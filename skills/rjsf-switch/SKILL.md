---
name: rjsf-switch
description: Switch the active RJSF form session or pick from a list of existing sessions
argument-hint: [FormName]
allowed-tools: [Read, Write, Glob]
---

# RJSF Switch — Change Active Session

**Trigger:** `/rjsf-switch <FormName>` (direct switch) or `/rjsf-switch` (picker mode)

Switches the active form session by updating `.rjsf/active-session`.

---

## Step 1 — Discover Sessions

List all directories under `.rjsf/sessions/` using Glob (`**.rjsf/sessions/*/session.json`).

If no sessions exist:

> "No form sessions found. Use `/rjsf-new <FormName>` to create one."

Stop here.

---

## Step 2 — Read Current Active Session

Read `.rjsf/active-session` to determine which session is currently active. If the file does not exist, treat as no active session.

---

## Step 3 — Direct Switch or Picker

### If a FormName argument was provided:

1. Check if `.rjsf/sessions/<FormName>/session.json` exists.
   - If it does **not** exist: `"No session found for **<FormName>**. Use /rjsf-list to see available sessions or /rjsf-new <FormName> to create one."` Stop here.
2. Check if `<FormName>` is already the active session.
   - If yes: `"**<FormName>** is already the active session."` Stop here.
3. Proceed to Step 4 with the provided FormName.

### If no argument was provided (picker mode):

1. For each directory under `.rjsf/sessions/`, read its `session.json` to extract `formName`, `rjsfTheme`, and `outputPath`.
2. Display a numbered list with theme info. Mark the current active session with `*`:

```
Available sessions:

  1. * UserRegistrationForm  — @rjsf/mui (src/forms/UserRegistrationForm)
  2.   PaymentForm           — @rjsf/core (src/forms/PaymentForm)
  3.   ContactForm           — @rjsf/chakra-ui (src/forms/ContactForm)

Enter a number to switch, or 0 to cancel:
```

3. Wait for the user to respond with a number.
   - `0` or cancel: `"Cancelled."` Stop here.
   - Valid number: extract the FormName from that entry. If it is already active, inform the user and stop. Otherwise, proceed to Step 4.
   - Invalid number: `"Invalid selection. Please enter a number from the list."` Stop here.

---

## Step 4 — Write Active Session

Write the selected `FormName` (plain text) to `.rjsf/active-session`.

---

## Step 5 — Confirm

Read the newly active session's `session.json` and display:

> "Switched to **<FormName>**.
>
> Theme: `<rjsfTheme>` | Output: `<outputPath>`
>
> Use `/rjsf-status` to see form details or `/rjsf-field list` to see all fields."
