---
name: rjsf-form
description: Build an RJSF form from description or file — runs the full pipeline (requirements → suggestions → plan → technical → prototype → code → tests) with pause/resume support
argument-hint: ["description"] [--from file]
allowed-tools: [Read, Write, Edit, Glob, Bash]
---

# RJSF Form — Build & Resume

**Trigger:** `/rjsf-form "description"` or `/rjsf-form --from requirements.md` or `/rjsf-form` (resume)

The single command for building RJSF forms. Creates a session, runs all 7 phases in sequence, and pauses between each for your approval. If you stop midway, run `/rjsf-form` again to resume from where you left off.

---

## Step 1 — Resolve Session

**Session Resolution** (do NOT read session-pattern.md — algorithm is inline):

1. Read `.rjsf/active-session` → get `formName` → `sessionDir` = `.rjsf/sessions/{formName}/`
2. Read `{sessionDir}/session.json`
3. If `.rjsf/active-session` does not exist but `.rjsf/session.json` does → perform legacy migration per Section 8, then re-read.
4. If no active session at all → go to Step 2.
5. If active session found → go to Step 3.

---

## Step 2 — Create Session (no active session)

### If description or --from file was provided:

1. **Derive form name from input.** Read the description text (or file content if `--from` was used). Extract the form's subject/purpose and convert to PascalCase:
   - "I need a patient intake form with name, DOB, insurance…" → `PatientIntakeForm`
   - "Build a loan application" → `LoanApplicationForm`
   - "employee onboarding questionnaire" → `EmployeeOnboardingQuestionnaire`
   - If the description is too vague to derive a name (e.g., "build a form"), ask: "What should this form be called? (e.g., `UserRegistrationForm`)"

2. **Create the session automatically** (same logic as `/rjsf-new`):
   - Check if `.rjsf/sessions/<FormName>/` already exists. If so, ask: "A session for **<FormName>** already exists. Switch to it, or choose a different name?"
   - Create `.rjsf/sessions/<FormName>/` directory.
   - Write `.rjsf/sessions/<FormName>/session.json` with the initial schema (all phases pending, version "2.0.0").
   - Write the form name to `.rjsf/active-session`.
   - Inform: "Created session: **<FormName>**"

3. Proceed to Step 4 (run pipeline from Phase 1) with the original input as the requirements.

### If no description and no --from file:

Check for existing sessions under `.rjsf/sessions/`:

- **Sessions exist but none active:**
  > "No active session. Found these forms:
  >
  > - **FormName1** (Phase N, status)
  > - **FormName2** (Phase N, status)
  >
  > - Switch to one: `/rjsf-switch <FormName>`
  > - Start a new form: `/rjsf-new` then `/rjsf-form "describe your form"`"

- **No sessions at all:**
  > "Welcome to rjsf-agent! To build a form:
  >
  > `/rjsf-form "describe your form here"`
  >
  > Or create a session first with `/rjsf-new`, then run `/rjsf-form "description"`."

Stop here.

---

## Step 3 — Resume Existing Session

Read `session.json` and determine the current state.

### Detect Client Approval Signal

If `phases["3"].status` is `"awaiting_client_approval"` AND the developer's message contains any of these phrases (case-insensitive): "client approved", "approved", "yes", "proceed", "continue", "looks good", "go ahead":
- Set `phases["3"].status = "completed"`, `phases["3"].completedAt = <ISO timestamp>`.
- Set `currentPhase = 4`.
- Write full session.json (not a partial merge).
- Proceed to Phase 4 in Step 4.

If `phases["3"].status` is `"awaiting_client_approval"` and NO approval signal:
> "Phase 3 prototype is awaiting client approval.
>
> Share `{sessionDir}/prototype.html` with your client. Once they approve, run `/rjsf-form` and say **'client approved'** to continue."

Stop here.

### All phases completed

> "**<FormName>** is complete! All phases done.
>
> - Make changes: `/rjsf-iterate "describe change"`
> - New form: `/rjsf-new` then `/rjsf-form "description"`
> - Run tests: `npx vitest <outputPath>`
> - Check status: `/rjsf-status`"

Stop here.

### Session is incomplete

Show brief status:

> "Resuming **<FormName>** from Phase <currentPhase> — <phase name>."

Proceed to Step 4, starting from the first incomplete phase.

---

## Step 4 — Run Pipeline

Run each phase in order, starting from `currentPhase`. Skip any phase whose status is already `"completed"`. After each phase, check `session.json` to confirm the phase status before proceeding.

### Phase Execution Order

```
Phase 1   → invoke rjsf-requirements skill
            (pass description text or --from file path if this is a new session)
            IMPORTANT: Ask clarifying questions ONE AT A TIME. Do NOT dump
            all 23 questions at once. Skip questions already answered by
            the input. For key decisions (RJSF theme, form type, styling
            approach), always ask individually — never auto-default these.
            After completion → PAUSE (Step 5)

Phase 1.5 → invoke rjsf-suggest skill
            Present enhancement suggestions ONE CATEGORY AT A TIME
            (field enhancements first, then form layout, then visual polish).
            Wait for developer response per category before showing the next.
            After completion → PAUSE (Step 5)

Phase 2   → invoke rjsf-plan skill
            After completion → PAUSE (Step 5)

Phase 2.5 → invoke rjsf-technical skill
            Present technical decision GROUPS one at a time
            (Schema & Validation first, then Form Behavior, etc.).
            Wait for developer response per group before showing the next.
            After completion → PAUSE (Step 5)

Phase 3   → invoke rjsf-prototype skill
            After prototype is generated → HARD PAUSE for client approval.
            Tell developer: "Share the prototype with your client.
            Run /rjsf-form and say 'client approved' when they confirm."
            STOP — do NOT auto-continue past Phase 3.

Phase 4   → invoke rjsf-execute skill
            After completion → PAUSE (Step 5)

Phase 5   → invoke rjsf-test skill
            Done → go to Step 6 (Completion)
```

### IMPORTANT: One-at-a-Time Questioning

Never dump all questions/options at once. This is the key UX principle:
- Phase 1: Ask one clarifying question at a time. Wait for answer before next.
- Phase 1.5: Present one category of suggestions at a time.
- Phase 2.5: Present one group of technical decisions at a time.
- For critical choices (RJSF theme, styling approach, form type), ALWAYS ask explicitly — never auto-default.

---

## Step 5 — Pause Between Phases

After each phase completes (except Phase 3 and Phase 5), display:

> "✅ Phase <N> (<name>) complete.
>
> **Next:** Phase <N+1> — <next phase name>
>
> Continue? (**y** / **skip** / **stop**)
> - **y** — proceed to next phase
> - **skip** — skip next phase, move to the one after
> - **stop** — save progress and exit"

Wait for the developer's response:

- **y / yes / continue / proceed / go / next**: Run the next phase.
- **skip**: Skip the next phase — set its status to `"completed"` with `completedAt = <ISO timestamp>`, advance `currentPhase`, then show the pause prompt again for the phase after that. If skipping Phase 1.5 or 2.5 (optional enhancement phases), proceed cleanly. If skipping a core phase (1, 2, 3, 4), warn: "Skipping Phase <N> may cause issues in later phases. Are you sure?"
- **stop / pause / done / later**: Respond with:
  > "Paused at Phase <currentPhase>. Run `/rjsf-form` to resume, or `/rjsf-status` to check progress."
  Stop here.

### Phase 3 Special Handling

Phase 3 always pauses for client approval. After the prototype is generated, the rjsf-prototype skill sets status to `awaiting_client_approval`. Output:

> "Prototype written to `{sessionDir}/prototype.html`. Open it in any browser.
>
> **Share this with your client.** Once they approve, run `/rjsf-form` and say **'client approved'** to continue to code generation."

Stop here. Do NOT show y/skip/stop. Do NOT auto-continue to Phase 4.

---

## Step 6 — Completion

After Phase 5 completes, output:

> "**<FormName> is complete!** All 7 phases done.
>
> Generated files: `<outputPath>/`
>
> - **Make changes:** `/rjsf-iterate "describe change"`
> - **New form:** `/rjsf-new` then `/rjsf-form "description"`
> - **Run tests:** `npx vitest <outputPath>` or `npx jest <outputPath>`
> - **Check status:** `/rjsf-status`"

---

## Section 7 — Natural Language Intent Map

If the developer's message doesn't match the standard trigger but matches these patterns, route accordingly:

| If the developer says… | Route to |
|---|---|
| "build a form", "create a form", "I need a form", "new form" + description | Step 2 → create session → run pipeline |
| "continue", "resume", "where was I", "pick up where" | Step 3 → resume |
| "client approved", "approved", "yes client approved" | Step 3 → client approval flow |
| "change", "update", "modify", "add a field", "remove a field", "fix" | `/rjsf-iterate` |
| "tests", "generate tests", "write tests" | `/rjsf-test` (internal phase skill) |
| "status", "progress", "what phase" | `/rjsf-status` |
| "help", "what can you do", "commands" | `/rjsf-help` |
| "switch", "switch to", "work on" | `/rjsf-switch` |
| "list sessions", "show sessions", "my forms" | `/rjsf-list` |
| "delete session", "remove session" | `/rjsf-delete` |

---

## Section 8 — Legacy Migration

If `.rjsf/session.json` exists **and** `.rjsf/active-session` does **not** exist, this is a legacy flat-directory layout. Perform migration:

1. Read `.rjsf/session.json` and extract the `formName`.
2. Create `.rjsf/sessions/{formName}/`.
3. Move `.rjsf/session.json` to `.rjsf/sessions/{formName}/session.json`.
4. Move artifact files (only those that exist): `requirements-brief.md`, `enhanced-brief.md`, `form-plan.md`, `technical-choices.md` from `.rjsf/` to `.rjsf/sessions/{formName}/`.
5. If `prototype/prototype.html` exists, move it to `.rjsf/sessions/{formName}/prototype.html`.
6. Update all non-null `artifactPath` values in the migrated `session.json` to filenames only.
7. Set `version` to `"2.0.0"`.
8. Write the legacy `formName` to `.rjsf/active-session`.
9. Notify: `"Migrated existing session for <formName> to multi-session layout."`
