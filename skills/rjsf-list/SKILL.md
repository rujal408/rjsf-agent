---
name: rjsf-list
description: List all RJSF form sessions with theme, field counts, and active indicator
allowed-tools: [Read, Glob]
---

# RJSF List — Show All Sessions

**Trigger:** `/rjsf-list`

Displays a formatted table of all form sessions under `.rjsf/sessions/`, highlighting the active session and showing form stats for each.

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
- `rjsfTheme`
- `stylingApproach`
- `outputPath` (or "not set" if null)
- `createdAt`
- `lastModified`

Also check if `{outputPath}/schema.ts` exists and count fields (properties in the schema).

---

## Step 4 — Display Table

```
RJSF Form Sessions
===================

     Form Name              Theme              Fields   Output Path
     ─────────              ─────              ──────   ───────────
  *  UserRegistrationForm   @rjsf/mui          8        src/forms/UserRegistrationForm
     PaymentForm            @rjsf/core         3        src/forms/PaymentForm
     ContactForm            @rjsf/chakra-ui    12       src/forms/ContactForm

* = active session
```

### Formatting Rules

- **Active indicator:** Prefix the active session row with `*`. All others get a space.
- **Fields:** Show the count of schema properties. Show `0` for empty/unscaffolded forms.
- **Theme:** Show the short theme value (e.g., `@rjsf/mui`).

---

## Step 5 — Action Suggestions

Always end with action suggestions:

> "Actions:
> - `/rjsf-switch <FormName>` — switch to a different session
> - `/rjsf-new <FormName>` — create a new form session
> - `/rjsf-status` — detailed stats for the active session
> - `/rjsf-field list` — see fields in the active form
> - `/rjsf-delete <FormName>` — archive and remove a session"
