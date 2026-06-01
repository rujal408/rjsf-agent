---
name: rjsf-new
description: Create a new RJSF form session with its own isolated directory under .rjsf/sessions/
argument-hint: <FormName>
allowed-tools: [Read, Write, Glob, Bash]
---

# RJSF New — Create a Form Session

**Trigger:** `/rjsf-new <FormName>`

Creates a new multi-session directory for the given form name, initializes `session.json`, and sets it as the active session.

---

## Step 1 — Validate Input

The user must provide a form name argument. If no argument is given:

> "Usage: `/rjsf-new <FormName>` (e.g., `/rjsf-new UserRegistrationForm`)"

Stop here.

### PascalCase Enforcement

The form name **must** be PascalCase (e.g., `UserRegistrationForm`, `PaymentForm`).

- If the input is already PascalCase, use it as-is.
- If the input is not PascalCase (e.g., `user-registration-form`, `user_registration_form`, `userRegistrationForm`, `payment form`), auto-convert it:
  - Split on hyphens, underscores, spaces, or camelCase word boundaries.
  - Capitalize the first letter of each segment.
  - Join without separators.
  - Inform the user of the conversion: `"Converted to PascalCase: <ConvertedName>"`

---

## Step 2 — Check for Legacy Migration

Check if `.rjsf/session.json` exists **and** `.rjsf/active-session` does **not** exist.

If both conditions are true, this is a legacy flat-directory layout. Perform the full legacy migration described in `references/session-pattern.md` Section 7 before proceeding:

1. Read `.rjsf/session.json` and extract the `formName`.
2. Create `.rjsf/sessions/{formName}/`.
3. Move `.rjsf/session.json` to `.rjsf/sessions/{formName}/session.json`.
4. Move artifact files (only those that exist): `requirements-brief.md`, `enhanced-brief.md`, `form-plan.md`, `technical-choices.md` from `.rjsf/` to `.rjsf/sessions/{formName}/`.
5. If `prototype/prototype.html` exists, move it to `.rjsf/sessions/{formName}/prototype.html`.
6. Update all non-null `artifactPath` values in the migrated `session.json` to filenames only.
7. Set `version` to `"2.0.0"`.
8. Write the legacy `formName` to `.rjsf/active-session`.
9. Notify the user: `"Migrated existing session for <formName> to multi-session layout."`

After migration, continue to Step 3 with the user's requested new form name.

---

## Step 3 — Check for Name Conflicts

Check if the directory `.rjsf/sessions/<FormName>/` already exists.

If it exists:

> "A session for **<FormName>** already exists. Use `/rjsf-switch <FormName>` to switch to it, or choose a different name."

Stop here.

---

## Step 4 — Create Session Directory

Create the directory `.rjsf/sessions/<FormName>/`.

---

## Step 5 — Write Initial session.json

Write `.rjsf/sessions/<FormName>/session.json` with the following content:

```json
{
  "version": "2.0.0",
  "formName": "<FormName>",
  "outputPath": null,
  "rjsfTheme": null,
  "stylingApproach": null,
  "technicalChoices": {},
  "currentPhase": "1",
  "phases": {
    "1": {
      "status": "pending",
      "startedAt": null,
      "completedAt": null,
      "artifactPath": null
    },
    "1.5": {
      "status": "pending",
      "startedAt": null,
      "completedAt": null,
      "artifactPath": null
    },
    "2": {
      "status": "pending",
      "startedAt": null,
      "completedAt": null,
      "artifactPath": null
    },
    "2.5": {
      "status": "pending",
      "startedAt": null,
      "completedAt": null,
      "artifactPath": null
    },
    "3": {
      "status": "pending",
      "startedAt": null,
      "completedAt": null,
      "artifactPath": null
    },
    "4": {
      "status": "pending",
      "startedAt": null,
      "completedAt": null,
      "artifactPath": null
    },
    "5": {
      "status": "pending",
      "startedAt": null,
      "completedAt": null,
      "artifactPath": null
    }
  }
}
```

Replace `<FormName>` with the actual PascalCase form name.

---

## Step 6 — Set Active Session

Write the form name (plain text, no trailing newline) to `.rjsf/active-session`.

---

## Step 7 — Confirm

Display:

> "Created new session: **<FormName>**
>
> Session directory: `.rjsf/sessions/<FormName>/`
> Active session set to: **<FormName>**
>
> Next steps:
> - `/rjsf-build` — start the full pipeline from requirements to tests
> - `/rjsf-list` — see all form sessions
> - `/rjsf-switch` — switch to a different form session"
