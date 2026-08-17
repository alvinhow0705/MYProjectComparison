/**
 * wa-track.js — records the WhatsApp clicks that bypass the enquiry form.
 *
 * The nav link and the floating WhatsApp button are deliberately zero-friction:
 * a visitor taps and lands straight in WhatsApp, so there is no name or phone
 * to capture. That is why those leads never appeared in the Google Sheet.
 *
 * This script does two things without adding any friction:
 *   1. stamps a Ref code onto the outgoing message, so the WhatsApp chat itself
 *      says which page (and project) the person was looking at;
 *   2. writes a row to the same Google Sheet with the name/phone columns blank,
 *      so the click can be matched against the WhatsApp message that follows.
 *
 * Usage — on each page, before </body>:
 *   <script src="assets/wa-track.js" data-ref="MPC-HOME"></script>
 * Optionally add data-project="Project Name" for single-project pages.
 *
 * For WhatsApp opened from JavaScript (window.open) rather than a link, call
 * waLog({source:..., project:...}) just before opening.
 */
(function () {
    var SHEET_URL = "https://script.google.com/macros/s/AKfycbzSWt_8ceLD172O_RX2PXrqrZpbB0GGtLN7KGX0HbybfOlL6PCztv_zYCQPU0cCH682bg/exec";

    var me = document.currentScript;
    var REF = (me && me.dataset.ref) || "MPC-WEB";
    var PAGE_PROJECT = (me && me.dataset.project) || "";

    function journeySummary() {
        try {
            var j = JSON.parse(localStorage.getItem("userJourney") || "[]");
            if (!j.length) return "No journey data";
            return j.map(function (x) {
                return "[" + x.time + "] " + x.action + (x.details ? ": " + x.details : "");
            }).join(" | ");
        } catch (e) { return ""; }
    }

    function post(data) {
        var f = document.getElementById("waTrackFrame");
        if (!f) {
            f = document.createElement("iframe");
            f.id = "waTrackFrame"; f.name = "waTrackFrame"; f.style.display = "none";
            document.body.appendChild(f);
        }
        var form = document.createElement("form");
        form.method = "POST"; form.action = SHEET_URL; form.target = "waTrackFrame";
        for (var k in data) {
            var i = document.createElement("input");
            i.type = "hidden"; i.name = k; i.value = data[k];
            form.appendChild(i);
        }
        document.body.appendChild(form);
        form.submit();
        form.remove();
    }

    /* Public: log a WhatsApp click that produced no form details. */
    window.waLog = function (o) {
        o = o || {};
        var mob = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
        var utm = "Direct";
        try { utm = localStorage.getItem("utm_source") || "Direct"; } catch (e) {}
        post({
            name: "", phone: "", email: "", purpose: "", status: "Direct WhatsApp",
            project1: o.project || PAGE_PROJECT || "",
            project2: "",
            source: "WhatsApp Click - " + (o.source || REF),
            budget: "Direct",
            location: "Direct",
            device: mob ? "Mobile" : "Desktop",
            pageurl: window.location.href,
            utm: utm,
            journey: journeySummary()
        });
        if (typeof gtag === "function") {
            gtag("event", "whatsapp_direct_click", {
                source: o.source || REF, project_1: o.project || PAGE_PROJECT || ""
            });
        }
    };

    /* Stamp the Ref onto plain <a href="https://wa.me/..."> links and log them.
       Runs in the capture phase and only rewrites href — the browser reads href
       when it performs the default action, which happens after this listener,
       so nothing needs to be cancelled and no popup blocker is involved. */
    document.addEventListener("click", function (e) {
        var a = e.target && e.target.closest ? e.target.closest('a[href*="wa.me/"]') : null;
        if (!a) return;
        try {
            var u = new URL(a.href, window.location.href);
            var t = u.searchParams.get("text") || "";
            if (t.indexOf("Ref:") === -1) {
                u.searchParams.set("text", t + "\n\nRef: " + REF);
                a.href = u.toString();
            }
        } catch (err) { /* leave the link untouched rather than break it */ }
        window.waLog({ source: REF });
    }, true);
})();
