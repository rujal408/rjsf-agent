---
name: rjsf-status
description: Show current RJSF session phase progress and guide what to do next
allowed-tools: [Read, Glob]
---

# RJSF Status — Session Progress & Next Steps

**Trigger:** `/rjsf-status`

---

## Step 1 — Resolve Session (Multi-Session)

**Session Resolution** (do NOT read session-pattern.md — algorithm is inline):

1. Read `.rjsf/active-session` → get `formName` → `sessionDir` = `.rjsf/sessions/{formName}/`
2. Read `{sessionDir}/session.json`
3. If `.rjsf/active-session` does not exist but `.rjsf/session.json` does → perform legacy migration per Section 7, then re-read.

If no active session:
- If other sessions exist in `.rjsf/sessions/`: "No active session, but {N} session(s) found. Run `/rjsf-switch` to select one."
- If no sessions at all: "No sessions found. Run `/rjsf-new` to create one, then `/rjsf-form "description"` to start building."
Stop here.

---

## Step 2 — Display Progress

Format and display the following status block. Use the status icons: ✅ = completed · ⏳ = in_progress or awaiting_client_approval · ⬜ = pending.

```
Active session: <FormName>
Theme: <rjsfTheme> | Styling: <stylingApproach | "not set yet">
Output: <outputPath | "not set yet">

  <icon> Phase 1   — Requirements        (<status> <completedAt or "">)
  <icon> Phase 1.5 — Feature Suggestions  (<status> <completedAt or "">)
  <icon> Phase 2   — Planning             (<status> <completedAt or "">)
  <icon> Phase 2.5 — Technical Decisions  (<status> <completedAt or "">)
  <icon> Phase 3   — Prototype            (<status> <completedAt or "awaiting client approval" if status is awaiting_client_approval>)
  <icon> Phase 4   — Execution            (<status> <completedAt or "">)
  <icon> Phase 5   — Testing              (<status> <completedAt or "">)
```

When formatting timestamps, show them as relative time if within the last 7 days (e.g. "2 hours ago", "yesterday"), otherwise show the ISO date only (e.g. "2026-05-10").

**Phase key handling:** Read phase status from `session.phases["1"]`, `session.phases["1.5"]`, `session.phases["2"]`, `session.phases["2.5"]`, `session.phases["3"]`, `session.phases["4"]`, `session.phases["5"]`. If a phase key is missing (legacy session), show ⬜ with "(not available)" instead of a status.

---

## Step 2b — Other Sessions

List all other session directories under `.rjsf/sessions/` (excluding the active session). For each, read its `session.json` and show:

```
Other sessions:
  - PaymentForm        Phase 3 — Prototype (completed)
  - ContactForm        Phase 1 — Requirements (in_progress)

Switch: /rjsf-switch <name>
```

Omit this entire section if no other sessions exist.

---

## Step 3 — What To Do Next

Always end with a clear, actionable "What to do next" section based on the current state. This is the key feature — the developer should always know exactly what command to run.

### Determine next action:

| Current State | What to do next |
|---|---|
| All phases completed | "**All done!** Your form is at `<outputPath>/`.\n\n- Make changes: `/rjsf-iterate \"describe change\"`\n- Build another form: `/rjsf-new` then `/rjsf-form \"description\"`" |
| Phase 3 is `awaiting_client_approval` | "**Waiting for client approval.** Share `{sessionDir}/prototype.html` with your client.\n\nOnce they approve, run:\n```\n/rjsf-form\n```\nThen say **'client approved'** to continue to code generation." |
| Any phase incomplete | "**Ready to continue.** Run:\n```\n/rjsf-form\n```\nThis will resume from Phase <currentPhase> — <phase name>." |
| Phase 1 not started, no requirements yet | "**Ready to start.** Run:\n```\n/rjsf-form \"describe your form here\"\n```\nOr point to a file: `/rjsf-form --from requirements.md`" |

### Format:

```
─── What to do next ───────────────────────────────────────

<actionable message from table above>
```

Always show exactly one clear action. Do not list multiple options unless the form is complete.
