# WhatsApp Auto-Reply Flow — The Celestz @ Kebun Teh

For the ads campaign pointing at
`mypropertycomparison.com/projects/the-celestz-kehub-teh.html`

---

## 1. How routing works

Every WhatsApp link on the Celestz page now ends with a reference code. Set your
tool to match on that code — it's exact, so one message can only ever trigger one
flow.

| Ref code | Where it comes from | Lead temperature |
|---|---|---|
| `MPC-101` | The enquiry form on the Celestz page (name + phone captured) | **Hot** — ad click, gave details, named the project |
| `MPC-102` | "More Info" on a surrounding-project card | Warm — browsing alternatives |

Match rule to use in the tool: **message contains `MPC-101`**.

### Why the codes are numbers, not words

A word code like `CELESTZ` looks clearer but breaks. On the Compare page a
visitor can pick Celestz *and* another project, and the message then contains
"The Celestz @ Kebun Teh" as ordinary text. Most auto-reply tools match
case-insensitively, so `CELESTZ` would match `Celestz` inside that sentence and
fire the ads flow at a comparison lead.

`MPC-101` can never appear inside a project name, a person's name, or anything a
visitor types — so exactly one rule can ever match. Keep every future code
numeric for the same reason.

---

## 2. Flow A — `MPC-101` (your ad traffic)

These people clicked a paid ad, scrolled a landing page, and typed their name and
phone. They are the most expensive leads you have. Reply instantly, deliver what
was promised, ask one question, then take over personally.

**Message 1 — immediate (0 sec)**

> Hi {name}, thanks for your interest in *The Celestz @ Kebun Teh* 🌙
>
> Here's your e-Brochure 👇
> *(attach the Celestz PDF)*
>
> Quick summary:
> • From RM543,800 (from 936 psf)
> • 581–915 sq.ft · 735 units · Leasehold
> • Kebun Teh, Johor Bahru — strong rental demand area
>
> I'm Alvin, the property advisor here. I'll reply personally in a moment.

**Message 2 — after ~45 seconds (the one qualifying question)**

> So I can send the right unit types and the current promo — is this for
> *own stay* or *investment*?
>
> 1️⃣ Own stay
> 2️⃣ Investment
> 3️⃣ Both / still deciding
>
> _Reply STOP anytime to opt out._

**Branches**

- **1 (Own stay)** → "Got it. Most own-stay buyers here take the 753 or 915 sq.ft
  layouts. Want me to check what's still available on the higher floors?"
- **2 (Investment)** → "Good choice — Kebun Teh has strong tenant demand from the
  nearby industrial and CIQ crowd. Want me to send the rental yield estimate and
  the smallest entry unit?"
- **3 (Both)** → "No problem. I'll send the full price list so you can compare —
  what's your rough budget range?"
- **Anything else typed** → stop the sequence, flag to you. A real question from a
  hot lead should never meet a bot.

**Then hand over.** After the branch reply, notify yourself and take the chat over
manually. Don't automate a third message.

---

## 3. Flow B — `MPC-102`

They were on the Celestz page but clicked a *different* project from the
surrounding-projects carousel. They're comparing. The project name is inside their
message (between the asterisks).

**Message 1 — immediate**

> Hi 👋 Thanks for your interest in *{project}*.
>
> Sending you the price list and e-Brochure now 👇
> *(attach, or reply manually if you don't have it ready)*
>
> Are you comparing a few projects? I can send a side-by-side so it's easier —
> just tell me which ones you're looking at.
>
> _Reply STOP anytime to opt out._

Keep this flow to a **single message**. They're mid-browse, not ready for
questions. The goal is to be useful, not to qualify.

---

## 4. Ground rules for both flows

**Speed is the whole advantage.** The instant reply is why this exists. If your
tool has a delay setting, set the first message to zero.

**Never send more than two automated messages before a human.** More reads as
spam and gets you reported.

**One question, not a form.** You already captured name and phone on the website.
Asking again looks broken.

**Always allow escape.** Any unexpected reply → stop automating, notify you. Add
`STOP` as a hard opt-out that halts the sequence permanently — your privacy policy
promises this, and it's a PDPA requirement.

**Be honest about the bot.** "I'll reply personally in a moment" performs better
than a bot pretending to be you and getting caught.

**Outside business hours**, change message 1's closing line to:
"It's after hours here — I'll reply personally first thing tomorrow morning."
An unanswered "are you there?" at 1am costs you the lead.

---

## 5. What to measure

Your GA4 already fires `whatsapp_lead` when the form is submitted. Track in
WhatsApp itself:

- How many `MPC-101` conversations reply to the qualifying question
  (that's your real engagement rate, not the click rate)
- How many reach a viewing appointment
- Which branch (own stay / investment) converts better — that tells you how to
  write the next ad

---

## 6. Rolling this out to other pages

Once Celestz is proven, the same pattern extends with one code per entry point:

| Ref code | Entry point |
|---|---|
| `MPC-101` | Celestz enquiry form ✅ done |
| `MPC-102` | Surrounding-projects carousel ✅ done |
| `MPC-201` | Nav "Advisor" link + floating WhatsApp button |
| `MPC-301` | Free eBook claim |
| `MPC-302` | eBook purchase intent |
| `MPC-303` | Payment receipt — needs delivery |
| `MPC-401` | Detail page enquiry form (one project) |
| `MPC-402` | Compare page enquiry form (two projects) |

Numbering: 1xx = a specific project landing page, 2xx = general advisor,
3xx = eBook funnel, 4xx = site-wide enquiry forms.

Ask me to add the remaining codes when you're ready — the Celestz ones are live
now.
