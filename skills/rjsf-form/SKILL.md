---
name: rjsf-form
description: Smart entry point — detects session context and routes to the right rjsf-agent command. Use when unsure which command to run, or to start a new form.
argument-hint: [requirements or --from file]
allowed-tools: [Read, Glob]
---

# RJSF — Smart Entry Point

**Trigger:** `/rjsf-form` with any input — or natural language like "I want to build a form", "continue", "where was I?", "help".

Detect project context and guide the developer to the right command. Never ask the developer which skill to use — infer it from context.

---

## Step 1 — Resolve Session (Multi-Session)

Follow the **Session Path Resolution Algorithm** (`references/session-pattern.md` Section 0):

1. Read `.rjsf/active-session` → get `formName` → `sessionDir` = `.rjsf/sessions/{formName}/`
2. Read `{sessionDir}/session.json`
3. If `.rjsf/active-session` does not exist but `.rjsf/session.json` does → perform legacy migration per Section 7, then re-read.
4. If `.rjsf/active-session` does not exist and no legacy session exists → no active session.

---

## Step 2 — Route by Context

### No session + input provided (description or `--from` file)

This is the primary entry point for building a new form. **Auto-create the session without asking for a separate form name:**

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

3. **Forward to `/rjsf-build`** with the original input as the requirements string (or `--from` path).

### No session + no input — sessions exist but none active
List existing sessions from `.rjsf/sessions/` and suggest:

> "No active session, but I found these forms:
>
> - **{formName1}** (Phase {N}, {status})
> - **{formName2}** (Phase {N}, {status})
>
> - Switch to one: `/rjsf-switch <FormName>`
> - Start a new form: `/rjsf-form "describe your form"`"

### No session + no input — no sessions at all
Display this menu and wait for the developer's choice:

> "Welcome to rjsf-agent! What would you like to do?
>
> A) Build a new form → `/rjsf-form "describe your form"` or `/rjsf-form --from requirements.md`
> B) Modify an existing generated form → `/rjsf-iterate`
> C) Generate tests for an existing form → `/rjsf-test`
> D) See all commands → `/rjsf-help`"

### Session exists, incomplete
Show the active session name and phase: "Active session: **{formName}** (Phase {N})".
Show the `/rjsf-status` output (read session.json and format it), then:

> "Run `/rjsf-build` to continue from Phase <N>, or tell me what you'd like to change.
> Switch to a different form: `/rjsf-switch`"

### Session exists, completed
> "<FormName> is complete.
>
> - To change something: `/rjsf-iterate \"describe change\"`
> - To start a new form: `/rjsf-new <NewFormName>`
> - To switch sessions: `/rjsf-switch`
> - To re-run tests: `/rjsf-test`
> - For help: `/rjsf-help`"

---

## Natural Language Intent Map

Match the developer's message against this table and route accordingly. Apply the FIRST matching row.

| If the developer says… | Route to |
|---|---|
| "build a form", "create a form", "I need a form", "new form" | `/rjsf-build` |
| "continue", "resume", "where was I", "pick up where", "where are we" | `/rjsf-build` (resume flow) |
| "change", "update", "modify", "add a field", "remove a field", "fix" | `/rjsf-iterate` |
| "client wants changes", "client feedback", "client said" | `/rjsf-iterate` |
| "client approved", "approved", "yes client approved" | `/rjsf-build` (client approval flow) |
| "tests", "generate tests", "write tests", "test the form" | `/rjsf-test` |
| "prototype", "show client", "preview" | `/rjsf-prototype` |
| "plan", "design the form", "layout" | `/rjsf-plan` |
| "suggest", "suggestions", "enhance", "enhancements", "what options", "what widgets", "improve UI", "better UI", "make it look better" | `/rjsf-suggest` |
| "technical", "technical decisions", "schema version", "validator", "configure", "settings", "breakpoints", "submission pattern" | `/rjsf-technical` |
| "requirements", "gather requirements" | `/rjsf-requirements` |
| "help", "what can you do", "commands", "how do I" | `/rjsf-help` |
| "status", "progress", "what phase", "where are we" | `/rjsf-status` |
| "switch", "switch to", "work on" | `/rjsf-switch` |
| "list sessions", "show sessions", "all sessions", "my forms" | `/rjsf-list` |
| "new session", "create session", "new form session" | `/rjsf-new` |
| "delete session", "remove session", "archive session" | `/rjsf-delete` |
| "--from", "requirements file", "from file" | `/rjsf-build --from <path>` |
