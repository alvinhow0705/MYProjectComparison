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
 * O: Journey
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
        data.utm       || "Direct",     // N: UTM Source
        data.journey   || ""            // O: Journey (what the visitor clicked, in order)
    ]);

    /* a new lead invalidates the cached stats so other visitors see it quickly */
    try { CacheService.getScriptCache().remove('claimStats'); } catch (err) {}

    /* ping Telegram — wrapped so a Telegram outage can never stop a lead
       being saved to the sheet */
    try { notifyTelegram(data); } catch (err) {}

    return jsonOut({ result: "success" });
}


/* ---- Telegram notification ------------------------------------------------
   The bot token and chat ID are NOT written in this file — this file lives in
   a public GitHub repo, and a token in it could be used by anyone to hijack
   the bot. They're stored in Apps Script instead:

     Project Settings (gear icon) → Script Properties → Add script property
       TELEGRAM_TOKEN    123456789:AAxxxxxxxxxxxxxxxxxxxxxxxxxxx
       TELEGRAM_CHAT_ID  123456789

   To find them:
     • Token   — message @BotFather in Telegram → /mybots → your bot → API Token
     • Chat ID — message your bot once, then open
                 https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
                 and read "chat":{"id": ... }
--------------------------------------------------------------------------- */
function notifyTelegram(data) {
    var props   = PropertiesService.getScriptProperties();
    var token   = props.getProperty('TELEGRAM_TOKEN');
    var chatId  = props.getProperty('TELEGRAM_CHAT_ID');
    if (!token || !chatId) return;          // not configured yet — stay silent

    var name  = data.name  || 'No name';
    var phone = (data.phone || '').replace(/[^0-9]/g, '');
    var project = data.project1 || '';
    if (data.project2) project += ' + ' + data.project2;

    var lines = [];
    lines.push('🔔 <b>New Lead</b>');
    lines.push('');
    lines.push('👤 <b>' + esc(name) + '</b>');
    if (phone)          lines.push('📞 +' + esc(phone));
    if (project)        lines.push('🏢 ' + esc(project));
    if (data.source)    lines.push('📄 Source: ' + esc(data.source));
    if (data.purpose)   lines.push('🎯 Purpose: ' + esc(data.purpose));
    if (data.status)    lines.push('🌡 Interest: ' + esc(data.status));
    if (data.budget  && data.budget  !== 'Direct') lines.push('💰 Budget: ' + esc(data.budget));
    if (data.location&& data.location!== 'Direct') lines.push('📍 Wants: ' + esc(data.location));
    if (data.utm     && data.utm     !== 'Direct') lines.push('📢 Campaign: ' + esc(data.utm));
    if (data.device)    lines.push('📱 ' + esc(data.device));

    /* one-tap reply link straight into the WhatsApp chat with this lead */
    if (phone) {
        var wa = 'https://wa.me/' + phone +
                 '?text=' + encodeURIComponent('Hi ' + name + ' 👋 Thanks for your enquiry —');
        lines.push('');
        lines.push('<a href="' + wa + '">💬 Reply on WhatsApp</a>');
    }

    UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
        method: 'post',
        payload: {
            chat_id: chatId,
            text: lines.join('\n'),
            parse_mode: 'HTML',
            disable_web_page_preview: 'true'
        },
        muteHttpExceptions: true
    });
}

/* Telegram's HTML mode breaks on stray < > & — strip them out */
function esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}


/* Run this from the editor to check Telegram is wired up.
   Select "testTelegram" in the function dropdown, press Run, then read the
   Execution log — it says exactly what happened instead of failing silently. */
function testTelegram() {
    var props  = PropertiesService.getScriptProperties();
    var token  = props.getProperty('TELEGRAM_TOKEN');
    var chatId = props.getProperty('TELEGRAM_CHAT_ID');

    Logger.log('TELEGRAM_TOKEN   : ' + (token  ? 'set (' + token.length + ' chars)' : 'MISSING'));
    Logger.log('TELEGRAM_CHAT_ID : ' + (chatId ? chatId : 'MISSING'));

    if (!token || !chatId) {
        Logger.log('>> Nothing sent. Add the missing property in Project Settings → Script Properties.');
        return;
    }

    /* show enough of the token to spot a typo, without printing the secret */
    var bits = token.split(':');
    Logger.log('Token shape      : botID=' + bits[0] +
               '  secret starts "' + String(bits[1]||'').substring(0,4) +
               '" ends "' + String(bits[1]||'').slice(-4) + '"');
    if (token !== token.trim()) Logger.log('!! Token has a leading/trailing space — remove it.');

    /* step 1: is the token itself valid? getMe needs no chat ID */
    var me = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/getMe',
                               { muteHttpExceptions: true }).getContentText();
    Logger.log('getMe replied    : ' + me);
    if (me.indexOf('"ok":true') === -1) {
        Logger.log('>> TOKEN IS INVALID. The chat ID is irrelevant until this is fixed.');
        Logger.log('>> In Telegram: @BotFather → /mybots → your bot → API Token → tap the token to copy,');
        Logger.log('>> then paste it into Script Properties as TELEGRAM_TOKEN (no "bot" prefix, no spaces).');
        return;
    }

    /* step 2: token is good — now try the actual message */
    var res = UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
        method: 'post',
        payload: { chat_id: chatId, text: '✅ Test alert from MYPropertyComparison — Telegram is connected.' },
        muteHttpExceptions: true
    });

    Logger.log('Telegram replied: ' + res.getContentText());
    Logger.log(res.getContentText().indexOf('"ok":true') > -1
        ? '>> SUCCESS — check your Telegram.'
        : '>> FAILED — see the description above. 401 = bad token, 400 chat not found = wrong chat ID, 403 = message the bot first.');
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
