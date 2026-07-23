# MYPropertyComparison — Handoff / Continuation Notes (v2, current)

Paste or attach this file at the start of a new Claude/Cowork session (opened in the project folder) so it can continue with full context. A new chat does NOT remember previous chats — this file is the bridge. The project files themselves live in the folder/GitHub and are shared across all chats.

## What this is
A Malaysian property comparison website. Visitors browse new-launch property projects (mostly KL/Selangor), filter/search, view detail/compare pages and individual project pages, and submit a WhatsApp enquiry form to become a lead.

## Key accounts & settings
- **Live site:** https://mypropertycomparison.com (GitHub Pages)
- **GitHub repo:** alvinhow0705/MYProjectComparison (public)
- **Local repo folder:** `C:\Users\USER1\Documents\GitHub\MYProjectComparison-git`
- **Deploy flow:** edit files → GitHub Desktop → Commit → Push → live in ~1 min. Hard-refresh each page with Ctrl+Shift+R (every page caches separately in the browser).
- **Google Analytics ID:** G-EDVF9QYQPZ. `whatsapp_lead` is set as a Key event.
- **Google Sheets lead endpoint (SHEET_URL):** `https://script.google.com/macros/s/AKfycbzSWt_8ceLD172O_RX2PXrqrZpbB0GGtLN7KGX0HbybfOlL6PCztv_zYCQPU0cCH682bg/exec`
- **WhatsApp lead number:** 60162171839
- **Brand name:** MYPropertyComparison (renamed from "MYProjectComparison" to match the .com domain).

## CRITICAL RULE (do not break)
Never change other projects' image file types. Each project's image extension is fixed (.jpeg / .jpg / .png / .webp vary by project). Keep each file's exact name and format; only touch the specific project named.

## File / data structure
- `index.html` (homepage), `script.js`, `style.css`, `sitemap.xml`, `CNAME`, favicon/logo files.
- `pages/` → compare.html, detail.html, find.html, calculator.html
- `projects/` → individual project pages, one per project: `projects/<slug>.html`
- `data/projects.json` → all listings. Fields: id, name, location, developer, "completion Year", title (Freehold/Leasehold), type, "total unit", "unit size", price ("From RMxxx"), psf ("From xxx psf"), image, images[] (gallery), tag. Projects with their own page also have **slug** and **hasPage: true**.
- `assets/images/` → project photos. Cover = `<name>.<ext>`; extras = `<name>-1`, `<name>-2`, etc. Keep them compressed (~1920px max, JPEG q85).

## STATUS — now LIVE (pushed)
- Image compression (~480MB → ~55MB).
- Homepage search box + price-range filter + property-type filter.
- Detail & compare pages: auto **Pros** + soft "Good to Know" note (pros written to dominate so every project looks sellable).
- Brand renamed to MYPropertyComparison everywhere; blue-house logo/favicon added and placed in nav.
- "Malaysia" added to titles/headings for SEO.
- **5 individual project pages are LIVE** in a luxury, EXSIM-inspired style:
  The Queenswoodz, The Vividz, The Aldenz, Phoeniz Suites, D'Evia
  → e.g. https://mypropertycomparison.com/projects/the-queenswoodz.html
- Homepage project cards show a **"View Full Page →"** link (only for projects with `hasPage`). All 5 added to `sitemap.xml`.

## Luxury project-page style (to replicate for new projects)
Self-contained HTML with embedded CSS. Fonts: `Cormorant Garamond` (serif headings) + `Inter` (body). Accent gold `#a8894e`, light/cream background `#f7f4ee`, ink `#1c1b19`. Sections in order: fixed nav (logo + "Get e-Brochure") → full-screen hero (cover image, project name, location eyebrow, price, gold CTA) → intro tagline → key-facts strip (Price, PSF, Size, Units, Tenure, Completion) → full-width feature image w/ tagline → Highlights (the auto-pros) → gallery grid → second feature image → dark enquiry section with the WhatsApp form (journey tracking + Google Sheets POST + gtag `whatsapp_lead`, source "Project Page") → footer.
**Easiest way to make a new one:** copy an existing live page like `projects/the-queenswoodz.html`, then swap in the new project's name, location, developer, price, psf, size, units, tenure, completion, image paths (`../assets/images/...`), slug, canonical/OG URLs, and JSON-LD. Then add the project to `data/projects.json` with `slug` + `hasPage: true`, and add its URL to `sitemap.xml`.

## Pending / to-do
1. **The Bedrock** — page + data built but NOT deployed; needs its 10 photos processed (files never came through) and its **completion year**. On file: Kota Kinabalu, Sabah; developer EXSIM and Bedi Group; Leasehold; Commercial; 1,111 units; 351–700 sqft; From RM508,000 (up to ~RM973,100); From 1,447 psf; tag "SHORT-TERM INVESTMENT". 10 images in upload order (cover = aerial marina shot) → name bedrock.jpg, bedrock-1.jpg … bedrock-9.jpg. Add to projects.json + sitemap + build luxury page once photos are in.
2. **3 more new projects** to add (need details + photos): Causewayz Square, Keeperz Suites, The Celestz @ Kehub Teh.
3. **Missing photos** for existing listings **CloutHaus** (id 17) and **Amara Residence** (id 28) — currently placeholder `assets/images/.jpg`.
4. **Roll the luxury project-page style out to the remaining projects** (only 5 done so far).
5. Owner may supply **custom pros/taglines** per project to replace the auto-generated copy.

## SEO note (owner asked "can't find my site on Google")
Normal for a young site + pages just pushed. Actions: in **Google Search Console** → check "Pages"/Indexing, **resubmit the sitemap** (now includes project pages), and use **URL Inspection → Request Indexing** on the homepage + new project pages to speed up crawling. Expect indexing in days–weeks; ranking for competitive keywords (e.g. "property comparison Malaysia", dominated by PropertyGuru/iProperty) takes months. Brand-name search should recover within days after Google re-crawls the rename.

## Growth
Drive real Malaysian traffic: WhatsApp status, Facebook property groups, TikTok, Xiaohongshu, Google Business Profile. Track the `whatsapp_lead` Key event — the only bot-proof measure of real leads.
