---
name: "add-project-listing"
description: "Add a new property project to the MYPropertyComparison homepage listings (data/projects.json) without building an individual project page. Use when the user wants to add a new project/launch to the site, list a new property, or add a project card — but has NOT asked for a dedicated page. If they also want a full page, use the new-project-page skill instead (or after this one)."
---

# Add Project Listing (MYPropertyComparison)

Adds a new property project as a homepage card in `data/projects.json` only —
no individual `projects/<slug>.html` page. Use this when the user just wants
the project to show up in the listing/search/compare/find pages, not a full
luxury landing page. If they later want a page for it, use the
`new-project-page` skill (it will upgrade this same entry by adding `slug` +
`hasPage: true`).

## CRITICAL RULE — do not break

Never change another project's image file extension or touch another
project's files. Only add the new project's own files/entry.

## Facts

**Facts need a source and a date.** A price, PSF, unit count, completion year or distance without a source and a date is "needs checking" (older than 30 days too): leave it out or flag it. **Never criticise** a new project or a developer.

## 1. Gather the project details

Ask the user for whatever isn't already known:

- Project name, location (area/township), developer
- Completion year
- Tenure (Freehold/Leasehold)
- Property type (Residential / Commercial / Commercial Under HDA / etc.)
- Total units
- Unit size (sqft, single value or range)
- Price ("From RMxxx,xxx")
- PSF ("From xxx psf" or a range)
- A short punchy tag for the card (e.g. "BEST MRT ACCESS", "SHORT-TERM
  INVESTMENT")
- Cover photo + any gallery photos

If hard data (price, psf, units, completion year) is missing, flag it to the
user rather than guessing — these are public-facing factual claims.

## 2. Prepare images

Images live in `assets/images/`. Naming convention: cover = `<short-
name>.<ext>`, gallery extras = `<short-name>-1.<ext>`, `<short-name>-2.<ext>`,
etc. Keep them compressed (~1920px max dimension, JPEG quality ~85) unless
already small. Preserve the source file's existing extension — don't
force-convert formats. If no photos are available yet, use a placeholder
path like `assets/images/.jpg` and flag it to the user as missing (this
matches how other incomplete listings, e.g. CloutHaus/Amara Residence, were
handled).

## 3. Add the entry to data/projects.json

Check the file for the highest existing `id` and use the next integer — do
not reuse or renumber existing ids. Add a new object with this exact field
set (note the field names with spaces):

```json
{
  "id": <next unused integer id>,
  "name": "<Project Name>",
  "location": "<Location>",
  "developer": "<Developer>",
  "completion Year": "<year>",
  "title": "Freehold" | "Leasehold",
  "type": "<Residential | Commercial | Commercial Under HDA | ...>",
  "total unit": "<e.g. 492>",
  "unit size": "<e.g. 550 sqft or 807-1,410 sqft>",
  "price": "From RMxxx,xxx",
  "psf": "From xxx psf",
  "image": "assets/images/<cover>.<ext>",
  "images": ["assets/images/<cover>.<ext>", "assets/images/<extra-1>.<ext>", "..."],
  "tag": "<short punchy tag>"
}
```

Do NOT add `slug` or `hasPage` — those only belong on projects with a
dedicated page (added by the `new-project-page` skill). Their absence is
what makes the homepage card render without a "View Full Page →" link.

## 4. Verify before handing back

- Confirm `data/projects.json` is still valid JSON (no trailing commas,
  matching brackets, new object properly comma-separated from neighbors).
- Confirm the `id` used doesn't collide with an existing one.
- List the image files the entry references and confirm they exist in
  `assets/images/`; flag any missing ones instead of leaving a broken image.
- Work on an `ai/<name>` branch and commit only there. Never merge, push or deploy: the work ends with `web_submit_change`, and only the owner's tap puts it live (code does it).

## Reference

- Data file: `data/projects.json`
- Example listing-only entry: any project without `hasPage: true` (e.g.
  D'Nuri, id 5)
- Project context/handoff notes: `HANDOFF-NOTES-v2.md`

