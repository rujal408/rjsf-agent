---
name: rjsf-delete
description: Archive and delete an RJSF form session (preserves generated code)
argument-hint: <FormName>
allowed-tools: [Read, Write, Glob, Bash]
---

# RJSF Delete — Archive and Remove a Session

**Trigger:** `/rjsf-delete <FormName>`

Archives the specified session to `.rjsf/history/` and removes it from `.rjsf/sessions/`. Generated code at the session's `outputPath` is **not** deleted.

---

## Step 1 — Validate Input

The user must provide a form name argument. If no argument is given:

> "Usage: `/rjsf-delete <FormName>` (e.g., `/rjsf-delete UserRegistrationForm`)
>
> Use `/rjsf-list` to see available sessions."

Stop here.

---

## Step 2 — Validate Session Exists

Check if `.rjsf/sessions/<FormName>/session.json` exists.

If it does not exist:

> "No session found for **<FormName>**. Use `/rjsf-list` to see available sessions."

Stop here.

---

## Step 3 — Show Summary and Confirm

Read `.rjsf/sessions/<FormName>/session.json` and display a summary:

> "You are about to delete the session for **<FormName>**:
>
> - Current phase: Phase <currentPhase> — <PhaseName> (<status>)
> - Completed phases: <count> of 7
> - Output path: <outputPath or "not set">
> - Session artifacts will be archived to `.rjsf/history/`
> - Generated code at `<outputPath>` will NOT be deleted
>
> Type **yes** to confirm deletion, or anything else to cancel."

Use the phase name mapping:
- `"1"` -> Requirements
- `"1.5"` -> Feature Suggestions
- `"2"` -> Planning
- `"2.5"` -> Technical Decisions
- `"3"` -> Prototype
- `"4"` -> Execution
- `"5"` -> Testing

**Wait for the user to respond.** If the response is not exactly `yes` (case-insensitive):

> "Deletion cancelled."

Stop here.

---

## Step 4 — Archive the Session

Follow `references/session-pattern.md` Section 6 exactly:

### 4a. Create Archive Directory

Generate an ISO 8601 timestamp for right now, replacing colons with hyphens (e.g., `2026-05-26T09-30-00Z`).

Create the directory: `.rjsf/history/<FormName>_<timestamp>/`

### 4b. Copy Session Directory

Copy the entire contents of `.rjsf/sessions/<FormName>/` into `.rjsf/history/<FormName>_<timestamp>/`. This includes `session.json` and all artifact files.

Use Bash to copy: `cp -r .rjsf/sessions/<FormName>/* .rjsf/history/<FormName>_<timestamp>/`

### 4c. Delete Session Directory

Remove the session directory and all its contents:

`rm -rf .rjsf/sessions/<FormName>/`

### 4d. Update Active Session Pointer

Read `.rjsf/active-session` to check if the deleted session was the active one.

If the deleted form name matches the active session:
- Delete `.rjsf/active-session` (use Bash: `rm .rjsf/active-session`).
- Note this in the confirmation message.

If it was not the active session, leave `.rjsf/active-session` unchanged.

---

## Step 5 — Confirm

Display:

> "Deleted session: **<FormName>**
>
> - Archived to: `.rjsf/history/<FormName>_<timestamp>/`
> - Generated code at `<outputPath>` was preserved (not deleted)
> [If was active session:] - Active session cleared. Use `/rjsf-switch` to select another session or `/rjsf-new` to create one.
>
> Actions:
> - `/rjsf-list` — see remaining sessions
> - `/rjsf-switch` — switch to another session
> - `/rjsf-new <FormName>` — create a new session"
