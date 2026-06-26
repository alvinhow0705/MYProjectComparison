/**
 * Google Apps Script — MYProjectComparison Lead Capture
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
 */

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
        data.source    || "",           // I: Source (Detail / Compare)
        data.budget    || "Direct",     // J: Budget
        data.location  || "Direct",     // K: Location Preference
        data.device    || "",           // L: Device (Mobile / Desktop)
        data.pageurl   || "",           // M: Page URL
        data.utm       || "Direct"      // N: UTM Source
    ]);

    return ContentService
        .createTextOutput(JSON.stringify({ result: "success" }))
        .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
    return ContentService
        .createTextOutput("Lead capture is running.")
        .setMimeType(ContentService.MimeType.TEXT);
}
