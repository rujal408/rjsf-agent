---
name: rjsf-list
description: List all RJSF form sessions with phase progress and active indicator
allowed-tools: [Read, Glob]
---

# RJSF List — Show All Sessions

**Trigger:** `/rjsf-list`

Displays a formatted table of all form sessions under `.rjsf/sessions/`, highlighting the active session and showing phase progress for each.

---

## Step 1 — Discover Sessions

List all directories under `.rjsf/sessions/` by searching for `session.json` files using Glob (`.rjsf/sessions/*/session.json`).

If no sessions exist:

> "No form sessions found.
>
> Use `/rjsf-new <FormName>` to create your first session."

Stop here.

---

## Step 2 — Read Active Session

Read `.rjsf/active-session` to determine which session is currently active. If the file does not exist, treat as no active session.

---

## Step 3 — Read Each Session

For each `session.json` found, read and extract:
- `formName`
- `currentPhase`
- `outputPath` (or "not set" if null)
- Status of each phase (`phases["1"]` through `phases["5"]`)

---

## Step 4 — Display Table

Render a formatted table with the following columns:

```
RJSF Form Sessions
===================

   Form Name                Current Phase            Output Path
   ─────────                ─────────────            ───────────
 * UserRegistrationForm     Phase 4 — Execution      src/forms/UserRegistrationForm
   PaymentForm              Phase 2 — Planning       not set
   ContactForm              Phase 5 — Testing        src/forms/ContactForm

Phase Progress:

  UserRegistrationForm:  ✅ 1  ✅ 1.5  ✅ 2  ✅ 2.5  ✅ 3  ⏳ 4  ⬜ 5
  PaymentForm:           ✅ 1  ⏳ 1.5  ⬜ 2  ⬜ 2.5  ⬜ 3  ⬜ 4  ⬜ 5
  ContactForm:           ✅ 1  ✅ 1.5  ✅ 2  ✅ 2.5  ✅ 3  ✅ 4  ✅ 5
```

### Formatting Rules

- **Active indicator:** Prefix the active session row with `*`. All others get a space.
- **Status icons:**
  - `✅` for `completed`
  - `⏳` for `in_progress` or `awaiting_client_approval`
  - `⬜` for `pending`
- **Phase name mapping:**
  - `"1"` -> Requirements
  - `"1.5"` -> Feature Suggestions
  - `"2"` -> Planning
  - `"2.5"` -> Technical Decisions
  - `"3"` -> Prototype
  - `"4"` -> Execution
  - `"5"` -> Testing
- If a phase key is missing from the session (legacy data), show `⬜` with no label.

---

## Step 5 — Action Suggestions

Always end with action suggestions based on the current state:

> "Actions:
> - `/rjsf-switch <FormName>` — switch to a different session
> - `/rjsf-new <FormName>` — create a new form session
> - `/rjsf-build` — continue the active session
> - `/rjsf-status` — detailed status of the active session
> - `/rjsf-delete <FormName>` — archive and remove a session"
