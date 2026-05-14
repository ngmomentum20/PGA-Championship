// ============================================================
// 2026 PGA Championship Pool — Google Apps Script Backend
// ============================================================
// SETUP:
// 1. Create a new Google Sheet
// 2. Rename the first tab to "Picks"
// 3. Add headers in row 1: Name | Passcode | Tier1 | Tier2a | Tier2b | Tier3a | Tier3b | Tier4a | Tier4b | Tier5 | TBScore | TBPlayoff | TBLeader | Timestamp
// 4. Go to Extensions > Apps Script
// 5. Paste this entire file into Code.gs
// 6. Replace SHEET_ID below with your Google Sheet ID (from the URL)
// 7. Deploy > New deployment > Web app
//    - Execute as: Me
//    - Who has access: Anyone
// 8. Copy the deployment URL and paste it into both index.html and leaderboard.html
//    where it says APPS_SCRIPT_URL
// ============================================================

const SHEET_ID = 'YOUR_SHEET_ID_HERE';
const DEADLINE = new Date('2026-05-15T04:00:00Z'); // Midnight ET May 14 = 04:00 UTC May 15

function getSheet() {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName('Picks');
}

// Handle GET requests
function doGet(e) {
  const action = e.parameter.action;

  let result;
  if (action === 'getPicks') {
    result = getAllPicks();
  } else if (action === 'loadEntry') {
    result = loadEntry(e.parameter.name, e.parameter.passcode);
  } else if (action === 'checkName') {
    result = checkName(e.parameter.name);
  } else {
    result = { error: 'Invalid action' };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle POST requests
function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: 'Invalid JSON' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  let result;
  if (data.action === 'submit') {
    result = submitEntry(data);
  } else {
    result = { error: 'Invalid action' };
  }

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

// Check if a name already exists (for registration flow)
function checkName(name) {
  if (!name) return { exists: false };
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const nameLower = name.trim().toLowerCase();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().trim().toLowerCase() === nameLower) {
      return { exists: true };
    }
  }
  return { exists: false };
}

// Load a specific entry by name + passcode
function loadEntry(name, passcode) {
  if (!name || !passcode) return { error: 'Name and passcode required' };

  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const nameLower = name.trim().toLowerCase();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0].toString().trim().toLowerCase() === nameLower) {
      if (data[i][1].toString().trim() === passcode.trim()) {
        return {
          success: true,
          entry: {
            name: data[i][0],
            tier1: data[i][2],
            tier2a: data[i][3],
            tier2b: data[i][4],
            tier3a: data[i][5],
            tier3b: data[i][6],
            tier4a: data[i][7],
            tier4b: data[i][8],
            tier5: data[i][9],
            tbScore: data[i][10],
            tbPlayoff: data[i][11],
            tbLeader: data[i][12]
          }
        };
      } else {
        return { error: 'Incorrect passcode' };
      }
    }
  }
  return { error: 'No entry found for that name' };
}

// Submit or update an entry
function submitEntry(data) {
  const now = new Date();
  if (now >= DEADLINE) {
    return { error: 'Submissions are closed. The tournament has started!' };
  }

  const name = (data.name || '').trim();
  const passcode = (data.passcode || '').trim();

  if (!name || !passcode) {
    return { error: 'Name and passcode are required' };
  }
  if (passcode.length < 3) {
    return { error: 'Passcode must be at least 3 characters' };
  }

  const sheet = getSheet();
  const allData = sheet.getDataRange().getValues();
  const nameLower = name.toLowerCase();
  let existingRow = -1;

  for (let i = 1; i < allData.length; i++) {
    if (allData[i][0].toString().trim().toLowerCase() === nameLower) {
      // Verify passcode for existing entry
      if (allData[i][1].toString().trim() !== passcode) {
        return { error: 'Incorrect passcode for existing entry' };
      }
      existingRow = i + 1; // 1-indexed for sheet
      break;
    }
  }

  const row = [
    name,
    passcode,
    data.tier1 || '',
    data.tier2a || '',
    data.tier2b || '',
    data.tier3a || '',
    data.tier3b || '',
    data.tier4a || '',
    data.tier4b || '',
    data.tier5 || '',
    data.tbScore || '',
    data.tbPlayoff || '',
    data.tbLeader || '',
    now.toISOString()
  ];

  if (existingRow > 0) {
    // Update existing
    sheet.getRange(existingRow, 1, 1, row.length).setValues([row]);
    return { success: true, message: 'Entry updated successfully!' };
  } else {
    // New entry
    sheet.appendRow(row);
    return { success: true, message: 'Entry submitted successfully!' };
  }
}

// Get all picks for the leaderboard
function getAllPicks() {
  const sheet = getSheet();
  const data = sheet.getDataRange().getValues();
  const now = new Date();
  const isLocked = now >= DEADLINE;

  const entries = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue; // skip empty rows

    const entry = {
      name: data[i][0].toString().trim()
    };

    if (isLocked) {
      // After deadline: show all picks
      entry.picks = {
        tier1: [data[i][2]],
        tier2: [data[i][3], data[i][4]],
        tier3: [data[i][5], data[i][6]],
        tier4: [data[i][7], data[i][8]],
        tier5: [data[i][9]]
      };
      entry.tiebreakers = {
        score: data[i][10],
        playoff: data[i][11],
        leader: data[i][12]
      };
    }
    // Before deadline: only show name (picks are hidden)
    entries.push(entry);
  }

  return {
    entries: entries,
    isLocked: isLocked,
    deadline: DEADLINE.toISOString(),
    entryCount: entries.length
  };
}
