---
name: "new-project-page"
description: "Build a full luxury individual project page for the MYPropertyComparison site (MYProjectComparison-git repo). Use when the user explicitly wants a dedicated page/landing page for a project — not just a homepage listing. Triggers on phrases like \"build the page for X\", \"make a project page for X\", \"roll the luxury page out to X\". If the user only wants the project added to the site/listings without a page, use add-project-listing instead."
---

# New Project Page (MYPropertyComparison)

Builds a self-contained, modern developer-grade project page in
`projects/<slug>.html`, wires it into `data/projects.json` and `sitemap.xml`,
and leaves it committed on an `ai/<name>` branch (never merge, push or deploy: the work ends with `web_submit_change`, and only the owner's tap puts it live, done by code).

If the user just wants a project added to the homepage/search listings without
a dedicated page, use the `add-project-listing` skill instead — don't build a
page nobody asked for.

## House style — read this first

The owner's taste has moved on from the early gold/cream template. What he
likes, in his words: sites that feel "super advance", cinematic, interactive.
Reference site he pointed to as the standard: **shangresidence.com** (a
Malaysian agent marketing site for a Kuchai Lama condo).

Hard rules learned from feedback:

- **No emoji anywhere.** Not in headings, not as icons, not in section
  labels. Use text labels, thin SVG line icons, or nothing.
- **Don't fake it.** Never invent prices, PSF, unit counts, completion years,
  distances to landmarks, or facility lists. These are factual claims on a
  public site — ask the user rather than guessing.
- **Don't box the media.** Video should stand free on the page, not sit in a
  small framed card. Big imagery, generous scale.
- **Don't chop up one artwork.** If the developer supplies a single image
  containing several floor plans, present it whole (with zoom) rather than
  slicing it into separate cards.
- **Don't repeat text the artwork already carries.** If the hero image
  already renders the project name/logo, don't overlay an HTML `<h1>` on top
  of it — it double-prints and looks broken. Use a visually-hidden `<h1>` for
  SEO/screen readers and let the artwork speak.
- **Facts need a source and a date.** A price, PSF, unit count, completion year or distance without a source and a date is "needs checking" (older than 30 days too): leave it out or flag it. **Never criticise** a new project or a developer.
- **Interactive beats static.** If a developer 360 tour exists, embed it in
  the page (check the URL allows framing first) rather than linking out.

## 0. Check whether the project is already listed

Look in `data/projects.json` for an existing entry (by name):

- **Already listed, no page yet** (no `slug`/`hasPage`) — upgrade that entry
  in step 6 by adding `slug` and `hasPage: true`. Don't create a duplicate.
- **Not listed at all** — create a new entry in step 6.

## CRITICAL RULE — do not break

Never change another project's image file extension, or rename/overwrite
another project's files. Each project's extension is fixed (.jpeg / .jpg /
.png / .webp varies by project). Only touch files for the project you're
building.

## 1. Gather the project details

Ask the user (or read `HANDOFF-NOTES-v2.md`) for whatever isn't known:

- Project name, location (area/township), developer
- Price ("From RMxxx,xxx"), PSF, unit size range, total units
- Tenure (Freehold/Leasehold), completion year, property type
- A one-line hook and 5-8 selling points
- A slug: lowercase, hyphenated (e.g. `the-bedrock`, `keeperz-suites`)
- Cover + gallery photos, and optionally: a video, a floor-plan artwork, a
  360 tour URL, a location map, brand artwork

Ask up front which sections apply — a project with a video, 360 tour and
floor plans gets a very different page from one with six photos.

## 2. Prepare images

Images live in `assets/images/`, video in `assets/videos/`. Naming: cover =
`<name>.<ext>`, extras = `<name>-1.<ext>`, `<name>-2.<ext>` in display order.
Compress to ~1920px max, JPEG q85 (Pillow is available). Preserve the source
extension — don't force-convert. Never touch another project's files.

For a page cover thumbnail of a PDF/brochure, render page 1 with
`pdftoppm -png -r 150 -f 1 -l 1 <file>.pdf out`.

## 3. Page structure

Build self-contained HTML — all CSS/JS embedded, only Google Fonts external.
Sections, in order (include only what the project actually has):

1. **Loader** — brand name + hairline, fades after load (with a timeout
   fallback so it can never trap the visitor).
2. **Fixed nav** — logo left; anchor links to the sections on this page
   (About / Highlights / Location / Facilities / Layouts / Register); solid
   CTA button right. Nav goes translucent→solid on scroll.
3. **Hero** — full-viewport image or video. Slow zoom or parallax drift.
   Price + CTAs pinned low. Scroll cue at the bottom.
4. **Marquee strip** (optional) — infinite-scrolling brand values.
5. **About / statement** — text one side, image the other. Image scales
   ~1.04 on hover with a soft shadow. Reveal-on-scroll.
6. **Stats strip** — Price, PSF, Size, Units, Tenure, Completion in a bordered
   grid. Numbers count up from zero when scrolled into view.
7. **Why this project** — 6-8 feature cards, text-led, no emoji.
8. **Connectivity** — landmark list with distances, plus a location map. If
   several landmarks, let clicking one swap the displayed image.
9. **Video** — free-standing, autoplays muted when scrolled into view, pauses
   when out of view, with a sound-on toggle.
10. **Facilities** — level selector (Level G / 1 / 8 / 38…) switching the
    facility list, with an auto-advancing image carousel and an "n / total"
    counter.
11. **Floor plans** — cards with specs, click to open a full-screen lightbox
    (Esc / click-outside to close), and a per-type WhatsApp CTA.
12. **360 tour** — embedded iframe with a "drag to look around" hint and a
    fullscreen button.
13. **Enquiry** — name / phone / purpose, WhatsApp submit.
14. **Footer** — brand, disclaimers, privacy link.

Typography that has worked well: Marcellus or Cormorant Garamond for
headings, Jost or Inter for body. Dark celestial palette (`#070b14` bg,
`#c9a869` gold) for premium projects; the older cream/gold
(`#f7f4ee` / `#a8894e`) still suits classic ones. Match the developer's own
brand artwork where it exists.

## 4. Interaction patterns worth reusing

- **Reveal on scroll**: `.reveal { opacity:0; transform:translateY(46px) }`
  + IntersectionObserver adding `.on`. Unobserve after firing.
- **Count-up stats**: ease-out cubic over ~1.4s, `toLocaleString('en-MY')`,
  fire once at 60% visibility.
- **Auto-advancing carousel**: swap on a timer, pause on hover, show
  "n / total", reset the timer on manual navigation.
- **Hover-zoom image**: wrapper `overflow:hidden`, inner img
  `transition:transform .6s ease`, `:hover { transform:scale(1.04) }`.
- **Lightbox**: fixed overlay, click-outside and Esc to close, image capped
  at `max-height:90vh`.
- **Parallax**: translate the background by `scrollY * 0.15` inside a
  `requestAnimationFrame` loop — never on the scroll event directly.
- **Video in view**: IntersectionObserver at ~0.3 threshold; `.play()`
  returns a promise — always `.catch(()=>{})` since autoplay can be blocked.
- **Embedding a 360 tour**: check for frame-blocking first with
  `curl -sI <url> | grep -i "x-frame\|content-security"`. If blocked, fall
  back to a button that opens it in a new tab.
- **Canvas starfield / particles**: size the canvas by `devicePixelRatio`,
  and skip drawing when `document.visibilityState !== 'visible'`.

Every animated section must degrade safely: if an image or video is missing,
the layout should still hold together.

## 5. Tracking — keep identical to the rest of the site

Copy the journey-tracking + Google Sheets + gtag block from a live page such
as `projects/the-celestz-kehub-teh.html`. Leave unchanged, exactly as on the live page: `SHEET_URL`, the WhatsApp number, the GA4 ID, the Ads ID and the conversion send_to (copy them from the page, never type them from memory).

Per page, set: `page:"<slug>.html"` in `trackJourney`, and the project name in
the WhatsApp message, `project1`/`project_1` payloads, and gtag calls.

Add events for any new interaction: `virtual_tour_interact`,
`virtual_tour_fullscreen`, `video_view`, `video_sound_on`, `cta_click`,
`floorplan_view`. Keep `whatsapp_lead` firing exactly as on other pages — it's
the owner's key conversion event.

## 6. Add or upgrade the entry in data/projects.json

Match this field set exactly, including the field names containing spaces:

```json
{
  "id": <next unused integer>,
  "name": "<Project Name>",
  "location": "<Location>",
  "developer": "<Developer>",
  "completion Year": "<year | Completed | TBA>",
  "title": "Freehold" | "Leasehold",
  "type": "<Residential | Commercial | Commercial Under HDA>",
  "total unit": "<e.g. 1,111>",
  "unit size": "<e.g. 351-700 sqft>",
  "price": "From RMxxx,xxx",
  "psf": "From xxx psf",
  "image": "assets/images/<cover>.<ext>",
  "images": ["assets/images/<cover>.<ext>", "assets/images/<extra-1>.<ext>"],
  "tag": "<short punchy tag>",
  "slug": "<slug>",
  "hasPage": true
}
```

Use the next unused integer id — never reuse or renumber existing ids.

If the location isn't already handled by the area filter in `script.js`
(`AREA_GROUPS`), tell the user it needs adding, or add it.

## 7. Add the page to sitemap.xml

Append before `</urlset>`:

```xml
<url>
  <loc>https://mypropertycomparison.com/projects/<slug>.html</loc>
  <priority>0.9</priority>
</url>
```

## 8. Replacing an existing live page

If the new page replaces one that's already live (especially one running in
Google Ads), preserve the URL so ads and conversions keep working:

1. Copy the current page to `projects/<slug>-old.html` as a rollback.
2. Mark the old copy `<meta name="robots" content="noindex">` so Google
   doesn't see a duplicate.
3. Write the new page at the original `projects/<slug>.html`.
4. Keep canonical/OG URLs pointing at the original URL.
5. Tell the user the backup exists and how to roll back.

Build new designs as a separate `-v2.html` (with `noindex`) for review first,
then swap only once the user confirms.

## 9. Verify before handing back

- Search the file for the old project's name — no leftovers.
- `data/projects.json` still parses as valid JSON.
- Sitemap XML well-formed.
- Every image/video path the page references actually exists on disk; flag
  missing ones rather than shipping a broken `<img>`.
- Braces/parens balanced in the embedded script.
- Check both a desktop and a phone width; the owner's traffic is mostly
  mobile. Confirm nothing collides with the floating WhatsApp button
  (`z-index` 60) or the sticky bottom bar (50).
- If `style.css` or `script.js` changed, bump their `?v=N` cache-buster in
  every HTML file that links them — otherwise returning visitors keep the
  old cached version and see a broken layout.
- Commit on the `ai/<name>` branch only; the owner approves going live.

## Reference

- Modern reference page: `projects/the-celestz-kehub-teh.html` (dark,
  cinematic, canvas starfield, embedded 360 tour, free-standing video, 3D
  tilt floor-plan artwork)
- Classic reference page: `projects/the-queenswoodz.html` (cream/gold)
- Design inspiration the owner rates: shangresidence.com
- Data: `data/projects.json` · Sitemap: `sitemap.xml`
- Context: `HANDOFF-NOTES-v2.md`
- Related skill: `add-project-listing` (listing only, no page)

