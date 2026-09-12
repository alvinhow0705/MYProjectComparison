# WhatsApp Ref Codes — full map

Every WhatsApp link on the site stamps a `Ref:` code onto the outgoing message.
The Auto Reply Agent matches on that code to pick the right flow.

**Rule: every code is `MPC-` plus exactly three digits.** No code is a prefix of
another, so a "message contains" match can only ever hit one rule. Keep it that
way — the moment a word code like `MPC-EBOOK` exists alongside
`MPC-EBOOK-PAID`, one message fires two flows.

---

## Don't build 58 flows. Build 5.

The 46 project codes all deserve the *same* reply — only the project name
changes, and **the name is already in the message, between asterisks**:

```
Hi MY Property Comparison 👋

I'm interested in *The Vividz*

Please send me the price list and floor plans. Thank you!

Ref: MPC-003
```

So set one rule on the pattern `MPC-0` (matches MPC-001 … MPC-047), pull the
project name out of the asterisks, and use it in the reply. One flow covers
every project, and new projects work automatically.

Then give these four their own flow, because the right reply really is different:

| Flow | Match | Why it's different |
|---|---|---|
| **Hot lead** | `MPC-101`, `MPC-401`, `MPC-402` | They filled in a form — name and phone already captured. Don't ask again. |
| **Paid, needs delivery** | `MPC-303` | They've paid for the eBook. This is a delivery obligation, not a lead. |
| **Buying intent** | `MPC-302` | Asking how to pay. Send payment details immediately. |
| **General project** | `MPC-0` (any project page) | Send the price list for the project named in the message. |
| **Browsing** | `MPC-2`, `MPC-301` | Low intent. One helpful message, no questions. |

---

## General flows

| Ref | Where it fires | Lead temperature |
|---|---|---|
| `MPC-101` | Celestz enquiry form (ad traffic, name + phone captured) | 🔥 Hottest |
| `MPC-102` | Celestz surrounding-projects card | 🟡 Comparing |
| `MPC-201` | Homepage nav + floating WhatsApp | 🟡 General enquiry |
| `MPC-202` | Find page (filtered search) | 🟡 Actively looking |
| `MPC-203` | Home loan calculator | 🔵 Researching affordability |
| `MPC-209` | Fallback for any page without its own code | 🔵 General |
| `MPC-301` | eBook claim | 🟡 Wants information |
| `MPC-302` | Asking how to pay for the eBook | 🟠 Buying intent |
| `MPC-303` | Paid, sending receipt | 🔥 Owed a delivery |
| `MPC-401` | Detail page form (one project) | 🔥 Hot |
| `MPC-402` | Compare page form (two projects) | 🔥 Hot |
| `MPC-909` | Old backup page | — |

## Project codes

`MPC-001` … `MPC-047` — one per project, matching the `id` in
`data/projects.json`. A new project gets the next id, and its code follows
automatically. The full list lives in that file; there's no second list to keep
in sync.

---

## Ground rules (unchanged, and they still matter)

- **Speed is the whole point.** First message at zero delay.
- **Never more than two automated messages before a human.** More reads as spam.
- **One question, not a form.** For form leads you already have name and phone —
  asking again looks broken.
- **Any unexpected reply stops the sequence** and notifies you. A real question
  from a hot lead should never meet a bot.
- **`STOP` is a hard opt-out.** The privacy policy promises it and the PDPA
  requires it.
- **Be honest that it's automated.** "I'll reply personally in a moment" beats a
  bot pretending to be you and getting caught.
- **After hours**, swap the closing line: "It's after hours here — I'll reply
  personally first thing tomorrow."

## What to measure

Not the click rate — the **reply rate to the first question**. That is the real
signal that the flow is working. Then: how many reach a viewing.

---

## Adding a new entry point

1. Pick the next free number in the right block
   (1xx project landing page · 2xx general · 3xx eBook · 4xx site forms).
2. Three digits, no words.
3. Add a row to the table above.
4. If it's a new project page, nothing to do — the `id` becomes the code.

See also: `WHATSAPP-FLOW-CELESTZ.md` for the full worked example of the
`MPC-101` and `MPC-102` message flows.
