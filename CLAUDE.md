# MYPropertyComparison website

## What this is
A Malaysian new-launch property comparison site (mostly Kuala Lumpur and Selangor). Visitors browse and filter projects, open a detail or compare page or a project page, and tap WhatsApp: **a WhatsApp lead (`whatsapp_lead` event) is the goal of every page.** Static site (HTML, `style.css`, `script.js`), hosted on GitHub Pages with the owner's own domain. This repo is public.

## Files
- `index.html` (homepage and project cards), `style.css`, `script.js`, `sitemap.xml`, `robots.txt`
- `data/projects.json`: all project listings (field names include spaces, e.g. `"completion Year"`; only projects with `hasPage: true` and a `slug` have a page)
- `projects/<slug>.html`: one self-contained page per project (CSS/JS embedded)
- `pages/`: compare, detail, find, calculator, ebook, recommend, leads, privacy policy
- `assets/images/`, `assets/videos/`, `assets/ebook/`: media (keep images compressed, about 1920px max)
- `admin/`: the owner's project manager page
- `CNAME`: the custom domain. `HANDOFF-NOTES-v2.md`: older notes
- `.claude/skills/`: `add-project-listing` (card only) and `new-project-page` (full page)

## Rules (always)
- **Audience:** Malaysian Chinese buyers. Chinese text for visitors is Simplified Chinese (never Traditional). Keep each page's current language unless the owner asks otherwise.
- **Prices and claims need a source and a date.** A price, PSF, unit count, completion year, distance or facility list without both is "needs checking" and must not be added; older than 30 days also needs checking. Never invent one.
- **Never criticise a new project or a developer.** Neutral, factual, positive-or-silent.
- **Never touch `CNAME`, DNS, the GitHub Pages settings or `.github/`.**
- **Never put keys, tokens or passwords in website code** (the repo is public). Existing public tracking IDs stay as they are.
- Never change another project's image file extension or rename another project's files.
- Keep `whatsapp_lead` firing exactly as on the other pages. After changing `style.css` or `script.js`, bump the `?v=N` cache-buster in every HTML file that links it.
- No emoji on project pages. Check pages at 390px (phone) as well as desktop: most visitors are on phones.

## Working here
- Work on a branch named `ai/<name>`; commit only there. Never merge, push or deploy: pushing to `main` is the deploy and only the owner's go-live tap does it (the AI office's code does it after that tap).
