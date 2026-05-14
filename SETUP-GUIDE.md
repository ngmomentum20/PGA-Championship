# 2026 PGA Championship Pool — Setup Guide

## Quick Overview
Three pieces to set up:
1. **Google Sheet + Apps Script** (your backend / database)
2. **GitHub Pages** (hosts the HTML pages)
3. **Connect them** (paste the Apps Script URL into all HTML files)

---

## Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Name it **"2026 PGA Championship Pool"**
3. Rename the first tab (bottom) to exactly: **Picks**
4. In row 1, add these column headers (A through N):

| A | B | C | D | E | F | G | H | I | J | K | L | M | N |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Name | Passcode | Tier1 | Tier2a | Tier2b | Tier3a | Tier3b | Tier4a | Tier4b | Tier5 | TBScore | TBPlayoff | TBLeader | Timestamp |

5. Copy the **Sheet ID** from the URL. It's the long string between `/d/` and `/edit`:
   ```
   https://docs.google.com/spreadsheets/d/THIS_IS_YOUR_SHEET_ID/edit
   ```

---

## Step 2: Deploy the Apps Script

1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete any existing code in `Code.gs`
3. Paste the entire contents of `apps-script-code.js` into the editor
4. **Replace** `YOUR_SHEET_ID_HERE` on line 19 with your actual Sheet ID from Step 1
5. Click **Deploy → New deployment**
6. Click the gear icon and select **Web app**
7. Set:
   - **Description:** PGA Championship Pool API
   - **Execute as:** Me
   - **Who has access:** Anyone
8. Click **Deploy**
9. **Authorize** when prompted (click through the "unsafe" warning — it's your own script)
10. **Copy the Web app URL** — it looks like:
    ```
    https://script.google.com/macros/s/AKfyc.../exec
    ```

---

## Step 3: Set Up GitHub Pages

1. Go to [github.com/ngmomentum20](https://github.com/ngmomentum20)
2. Create a new repository called **pga-pool** (public)
3. Upload all three HTML files (`index.html`, `leaderboard.html`, and `tv.html`) to the repository
4. Enable GitHub Pages:
   - Go to **Settings → Pages**
   - Source: **Deploy from a branch**
   - Branch: **main**, folder: **/ (root)**
   - Click **Save**

5. **Before uploading**, edit all three files and replace the Apps Script URL:
   - In `index.html` — find the line: `const APPS_SCRIPT_URL = '...';`
   - In `leaderboard.html` — find the same line
   - In `tv.html` — find the same line
   - Replace with your actual URL in all three files

6. Your pages will be live at:
   - **Pick page:** `https://ngmomentum20.github.io/pga-pool/`
   - **Leaderboard:** `https://ngmomentum20.github.io/pga-pool/leaderboard.html`
   - **TV Display:** `https://ngmomentum20.github.io/pga-pool/tv.html`

---

## How It All Works

### Before Midnight ET Wednesday May 14:
- Users visit the pick page, enter their name and create a passcode
- They select their 8 golfers across 5 tiers and submit
- They can come back, enter name + passcode, and edit their picks
- The leaderboard page shows a countdown and who has entered (but not their picks)

### Thursday Morning → Sunday Evening:
- Pick submissions are locked (the page shows a closed message)
- The leaderboard activates, showing everyone's picks
- Live scores pull from ESPN every 5 minutes
- Each person's best 4 of 8 golfer scores count toward their total
- The leaderboard ranks everyone — lowest points wins

### Tournament Complete:
- A champion banner with confetti appears for the winner
- The leaderboard freezes with final scores

---

## Sharing Links

| What | URL |
|------|-----|
| **Make Picks** (share with players tonight) | `https://ngmomentum20.github.io/pga-pool/` |
| **Leaderboard** (put on the TV Thursday–Sunday) | `https://ngmomentum20.github.io/pga-pool/leaderboard.html` |
| **TV Display** (full-screen split view for the big screen) | `https://ngmomentum20.github.io/pga-pool/tv.html` |

---

## Reusing Your Existing Google Sheet

If you already have a Google Sheet and Apps Script from the Masters pool, you can reuse the same setup:

1. **Option A — New sheet tab:** Add a new tab called "Picks" (or clear the existing one) in the same spreadsheet. The Apps Script URL stays the same.
2. **Option B — New spreadsheet:** Create a fresh spreadsheet, add the Apps Script, deploy a new web app, and update the URL in the HTML files.

Either way, make sure the Picks tab has the correct headers and is cleared of old Masters entries.

---

## Troubleshooting

**"Could not connect to server"** — The Apps Script URL is wrong or not deployed. Redeploy and update the URL in all three HTML files.

**Scores not updating** — ESPN's API may not have data until tee times begin Thursday morning. The leaderboard will show "N/A" for golfers not found in the ESPN data.

**Need to edit someone's picks after deadline** — Edit directly in the Google Sheet. The sheet is your source of truth.

**Need to add a new player after others have submitted** — They just visit the pick page and register. The system handles new entries on the fly.

**iPad full-screen tip** — Open tv.html in Safari, tap Share → Add to Home Screen. Opening from the Home Screen icon runs it without browser chrome for a clean TV display.
