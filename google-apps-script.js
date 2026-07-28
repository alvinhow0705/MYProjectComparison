/**
 * Google Apps Script — MYPropertyComparison Lead Capture + Live Stats
 *
 * SHEET COLUMNS (in order):
 * A: Time
 * B: Name
 * C: Phone
 * D: Email
 * E: Purpose
 * F: Status
 * G: Project 1
 * H: Project 2
 * I: Source
 * J: Budget
 * K: Location
 * L: Device
 * M: Page URL
 * N: UTM Source
 *
 * Deploy as Web App → Execute as: Me → Access: Anyone
 *
 * IMPORTANT: after pasting changes here you must redeploy —
 * Deploy → Manage deployments → edit (pencil) → Version: New version → Deploy.
 * Editing the code alone does NOT update the live /exec URL.
 */

/* ---- Public claim counter -------------------------------------------------
   Shown on the eBook page as "<n> claimed this month". Two parts added:
     1. a baseline that drifts upward through the month, so the figure keeps
        moving on quiet days;
     2. every genuine lead recorded in this sheet during the current month.
   The server works it out, so every visitor sees the same number at the same
   moment, and a real claim makes it jump immediately.
   It resets on the 1st of each month, which is why it can run fast without
   ever reaching an implausible total.
   Set CLAIM_DRIFT_PER_DAY to 0 to show only genuine claims.               */
var CLAIM_MONTH_BASE    = 800;  /* figure on the 1st */
var CLAIM_DRIFT_PER_DAY = 295;  /* ≈ 1 every 5 minutes → stays under 10k */

/* How many recent claimants the eBook page may show in its toasts. */
var RECENT_LIMIT = 12;

function driftedBaseline() {
    var now = new Date();
    var startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    var mins = Math.max(0, (now.getTime() - startOfMonth) / 60000);
    return CLAIM_MONTH_BASE + Math.floor(mins * CLAIM_DRIFT_PER_DAY / 1440);
}


function doPost(e) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    var data = e.parameter;

    sheet.appendRow([
        new Date(),                     // A: Time
        data.name      || "",           // B: Name
        data.phone     || "",           // C: Phone
        data.email     || "",           // D: Email
        data.purpose   || "",           // E: Purpose
        data.status    || "",           // F: Status (Interest Level)
        data.project1  || "",           // G: Project 1
        data.project2  || "",           // H: Project 2
        data.source    || "",           // I: Source (Detail / Compare / eBook Page)
        data.budget    || "Direct",     // J: Budget
        data.location  || "Direct",     // K: Location Preference
        data.device    || "",           // L: Device (Mobile / Desktop)
        data.pageurl   || "",           // M: Page URL
        data.utm       || "Direct"      // N: UTM Source
    ]);

    /* a new lead invalidates the cached stats so other visitors see it quickly */
    try { CacheService.getScriptCache().remove('claimStats'); } catch (err) {}

    return jsonOut({ result: "success" });
}


/**
 * Public read-only stats for the eBook page's live social proof.
 * Returns: { count: <number>, recent: [ { n: "Lou", m: 3 }, ... ] }
 *   n = first 3 letters of the name only (the page renders it as "Lou**")
 *   m = minutes ago
 * Full names and phone numbers are never exposed.
 */
function doGet(e) {
    var cache = CacheService.getScriptCache();
    var hit = cache.get('claimStats');
    if (hit) return jsonOut(JSON.parse(hit));

    var payload = { count: driftedBaseline(), recent: [] };

    try {
        var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
        var lastRow = sheet.getLastRow();
        var totalLeads = Math.max(0, lastRow - 1);     // minus the header row

        /* count only leads from the current month, so the figure matches the
           "claimed this month" label and resets cleanly on the 1st */
        var now = new Date();
        var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        var thisMonth = 0;
        var scan = Math.min(500, totalLeads);          // recent rows are enough
        if (scan > 0) {
            var times = sheet.getRange(lastRow - scan + 1, 1, scan, 1).getValues();
            for (var t = 0; t < times.length; t++) {
                var when = times[t][0];
                if (when && when.getTime && when.getTime() >= monthStart) thisMonth++;
            }
        }
        payload.count = driftedBaseline() + thisMonth; // drift + real claims

        var take = Math.min(RECENT_LIMIT, totalLeads);
        if (take > 0) {
            /* columns A (time) and B (name) for the most recent rows */
            var rows = sheet.getRange(lastRow - take + 1, 1, take, 2).getValues();
            var now = new Date().getTime();
            for (var i = rows.length - 1; i >= 0; i--) {   // newest first
                var when = rows[i][0];
                var name = String(rows[i][1] || '').replace(/[^A-Za-z]/g, '');
                if (!name) continue;
                var mins = 0;
                if (when && when.getTime) {
                    mins = Math.max(0, Math.round((now - when.getTime()) / 60000));
                }
                payload.recent.push({ n: name.substring(0, 3), m: mins });
            }
        }
    } catch (err) {
        /* fall through with the baseline so the page still renders */
    }

    /* cache briefly so a burst of visitors doesn't hammer the spreadsheet.
       Kept short so the drifting figure stays current between refreshes. */
    cache.put('claimStats', JSON.stringify(payload), 20);
    return jsonOut(payload);
}


function jsonOut(obj) {
    return ContentService
        .createTextOutput(JSON.stringify(obj))
        .setMimeType(ContentService.MimeType.JSON);
}
