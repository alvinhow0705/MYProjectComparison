/**
 * i18n.js - English default, optional Chinese (Simplified).
 *
 * - English text lives in the HTML. Chinese lives ONLY in assets/i18n/zh.json (key -> Chinese).
 * - Mark an element with:
 *     data-i18n="key"        swap its text
 *     data-i18n-html="key"   swap its inner HTML (only for short strings written by us)
 *     data-i18n-ph="key"     swap its placeholder
 *     data-i18n-vars='{"name":"The Wyn"}'   values for {name} style placeholders
 * - In scripts use:  i18n.t('key', 'English text', {name: 'x'})
 * - The choice is remembered in localStorage (wrapped in try/catch) so it stays on other pages.
 * - A page with <body data-i18n-reload> reloads after a switch (for pages whose text is built by scripts).
 */
(function () {
    var STORE = 'mpc_lang';
    var lang = 'en';
    try { if (localStorage.getItem(STORE) === 'zh') lang = 'zh'; } catch (e) {}

    var me = document.currentScript;
    var base = me && me.src ? me.src.replace(/[^\/]*$/, '') : '/assets/';
    var dict = {};

    function loadDict() {
        if (Object.keys(dict).length) return;
        try {
            var x = new XMLHttpRequest();          /* synchronous on purpose: strings must exist before page scripts render */
            x.open('GET', base + 'i18n/zh.json', false);
            x.send();
            if (x.status === 200 || (x.status === 0 && x.responseText)) dict = JSON.parse(x.responseText);
        } catch (e) { dict = {}; }
    }
    if (lang === 'zh') loadDict();

    function fill(s, vars) {
        if (!vars) return s;
        return s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] != null ? vars[k] : m; });
    }
    function t(key, en, vars) {
        var s = (lang === 'zh' && dict[key]) ? dict[key] : en;
        return fill(s, vars);
    }
    function varsOf(el) {
        try { var v = el.getAttribute('data-i18n-vars'); return v ? JSON.parse(v) : null; } catch (e) { return null; }
    }

    function apply() {
        document.documentElement.setAttribute('lang', lang === 'zh' ? 'zh-Hans' : 'en');
        var els = document.querySelectorAll('[data-i18n],[data-i18n-html],[data-i18n-ph]');
        for (var i = 0; i < els.length; i++) {
            var el = els[i], vars = varsOf(el), k;
            if ((k = el.getAttribute('data-i18n'))) {
                if (el.__en == null) el.__en = el.textContent;
                el.textContent = t(k, el.__en, vars);
            }
            if ((k = el.getAttribute('data-i18n-html'))) {
                if (el.__enh == null) el.__enh = el.innerHTML;
                el.innerHTML = t(k, el.__enh, vars);
            }
            if ((k = el.getAttribute('data-i18n-ph'))) {
                if (el.__enp == null) el.__enp = el.getAttribute('placeholder') || '';
                el.setAttribute('placeholder', t(k, el.__enp, vars));
            }
        }
        var tg = document.getElementById('i18nToggle');
        if (tg) {
            tg.querySelector('[data-l="en"]').classList.toggle('on', lang === 'en');
            tg.querySelector('[data-l="zh"]').classList.toggle('on', lang === 'zh');
        }
    }

    function set(l) {
        if (l === lang) return;
        lang = l === 'zh' ? 'zh' : 'en';
        try { localStorage.setItem(STORE, lang); } catch (e) {}
        if (lang === 'zh') loadDict();
        if (document.body && document.body.hasAttribute('data-i18n-reload')) { location.reload(); return; }
        apply();
        try { document.dispatchEvent(new CustomEvent('i18nchange', { detail: { lang: lang } })); } catch (e) {}
        try { if (typeof gtag === 'function') gtag('event', 'language_toggle', { language: lang }); } catch (e) {}
    }

    function build() {
        if (document.getElementById('i18nToggle')) return;
        var css = document.createElement('style');
        css.textContent =
            '#i18nToggle{position:fixed;top:8px;right:8px;z-index:100000;display:flex;align-items:center;gap:0;flex:none;' +
            'background:rgba(10,14,26,.78);color:#fff;border:1px solid rgba(255,255,255,.28);border-radius:999px;' +
            'font:600 12px/1 -apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;' +
            'padding:3px;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}' +
            '#i18nToggle button{all:unset;cursor:pointer;padding:6px 9px;border-radius:999px;opacity:.7;letter-spacing:.02em}' +
            '#i18nToggle button.on{background:#fff;color:#0a0e1a;opacity:1}' +
            '#i18nToggle button:focus-visible{outline:2px solid #ffc65c}' +
            '#i18nToggle i{font-style:normal;opacity:.35;padding:0 1px}' +
            '#i18nToggle.inl{position:static;display:inline-flex;width:max-content;max-width:max-content;align-self:center;justify-self:end;margin-left:auto;margin-right:0;z-index:auto;order:99}' +
            '@media(max-width:520px){' +
            'nav.i18n-nav .brand{font-size:0!important;gap:0!important}nav.i18n-nav .nav-cta{white-space:nowrap!important;font-size:11px!important;padding-left:10px!important;padding-right:10px!important;letter-spacing:.06em!important}' +
            'nav.i18n-nav{gap:6px!important;padding-left:14px!important;padding-right:14px!important}' +
            'nav.i18n-wrap{flex-wrap:wrap!important}nav.i18n-wrap .nav-links{order:3!important;flex:1 1 100%!important;justify-content:center!important;margin-top:2px!important}nav.i18n-wrap #i18nToggle{margin-left:auto!important;order:2!important}' +
            '#i18nToggle button{padding:5px 7px}#i18nToggle.inl{margin-left:6px}}';
        document.head.appendChild(css);
        var d = document.createElement('div');
        d.id = 'i18nToggle';
        d.setAttribute('role', 'group');
        d.setAttribute('aria-label', 'Language');
        d.innerHTML = '<button type="button" data-l="en" lang="en">EN</button><i>|</i><button type="button" data-l="zh" lang="zh-Hans">中文</button>';
        d.addEventListener('click', function (e) {
            var b = e.target.closest ? e.target.closest('button[data-l]') : null;
            if (b) set(b.getAttribute('data-l'));
        });
        var nav = document.querySelector('nav') || document.querySelector('.topnav');
        var host = nav && (nav.querySelector(':scope > .wrap') || nav);
        if (host) { nav.classList.add('i18n-nav'); if (nav.querySelector('.nav-brand')) nav.classList.add('i18n-wrap'); d.className = 'inl'; host.appendChild(d); } else { document.body.appendChild(d); }
    }

    function start() { build(); apply(); }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();

    window.i18n = { t: t, set: set, apply: apply, get lang() { return lang; } };
})();
