# Commands Reference

Complete reference for all 14 rjsf-agent commands.

---

## `/rjsf`

**Description:** Smart entry point. Reads session state and routes you to the right command automatically. If you have an active session, it shows your current progress. If there is no session, it presents a menu. Accepts natural language — you can describe what you want in plain English and it will figure out the right command.

**When to use:** When you are not sure which command to run next, when opening the plugin for the first time, or when returning to a session after a break.

**Syntax:**
```
/rjsf
/rjsf "I need to build a contact form"
/rjsf "continue"
/rjsf "where was I?"
```

**Produces:** Either a routing action (launches the appropriate command) or a menu offering four options: build a new form, modify an existing form, generate tests, or see all commands.

**Example:**
```
/rjsf "build a patient intake form with name, DOB, and insurance info"
```

**Common follow-up:** The agent routes you to `/rjsf-build` and begins Phase 1.

---

## `/rjsf-build`

**Description:** The main orchestrator command. Runs all 5 phases in sequence — requirements, planning, prototype, execution, and tests — pausing for your approval between each phase. Accepts an inline requirements string or a `--from` flag pointing to a markdown requirements file. If a session already exists, offers to resume from the last incomplete phase.

**When to use:** Every time you want to build a new form. Also use this to resume an interrupted session — running it with no arguments detects the existing session.

**Syntax:**
```
/rjsf-build "description of your form"
/rjsf-build --from path/to/requirements.md
/rjsf-build
```

**Produces:** Orchestrates all five phases. Final output is a complete form under `src/forms/<FormName>/` (schema, uiSchema, types, component, tests) plus a prototype HTML file in the session directory.

**Example:**
```
/rjsf-build "Loan application: applicant name, DOB, employment type (select: employed / self-employed / unemployed), monthly income (number, required if employed), loan amount (number), loan purpose (textarea)"
```

**Common follow-up:** Answer the clarifying questions in Phase 1, then approve the Requirements Brief before Phase 2 begins.

---

## `/rjsf-status`

**Description:** Displays a one-page summary of the current session: form name, output path, current phase, each phase's status (pending / in-progress / completed / awaiting-approval), and any blockers. Does not make changes.

**When to use:** Anytime you want to know exactly where a session stands. Useful when returning to work after a break, or before deciding whether to continue or start fresh.

**Syntax:**
```
/rjsf-status
```

**Produces:** A formatted status report reading from `.rjsf/session.json`. No files are written.

**Example:**
```
/rjsf-status
```

Output might look like:
```
Session: LoanApplication
Output:  src/forms/LoanApplication/
Phase 1: Requirements   ✓ completed
Phase 2: Planning       ✓ completed
Phase 3: Prototype      ✓ completed (awaiting client approval)
Phase 4: Execution      — pending
Phase 5: Testing        — pending
```

**Common follow-up:** Say "client approved" to advance past Phase 3, then run `/rjsf-build` to continue.

---

## `/rjsf-requirements`

**Description:** Runs Phase 1 — the requirements gathering phase. Asks up to 20 clarifying questions one at a time (skipping any already answered in your initial description). At the end, produces a structured `RequirementsBrief` markdown document in `.rjsf/requirements-brief.md` for your review.

**When to use:** When you want to run requirements gathering in isolation — for example to update the brief before re-running planning, or when working through requirements collaboratively in a meeting.

**Syntax:**
```
/rjsf-requirements
/rjsf-requirements "initial description"
```

**Produces:** `.rjsf/requirements-brief.md` — a structured document covering form purpose, all fields (with types, validation, required/optional), conditional logic, layout preferences, and edge case flags.

**Example:**
```
/rjsf-requirements "Employee onboarding form: personal info, emergency contact, and benefits enrollment. The benefits section should only appear for full-time employees."
```

**Common follow-up:** Review the brief. Say "looks good" or request specific changes before running `/rjsf-plan`.

---

## `/rjsf-plan`

**Description:** Runs Phase 2 — the form planning phase. Reads the Requirements Brief and designs the full FormPlan: column layout for each section, widget choice for every field, any custom components that will need to be built (widgets, fields, templates), the step map if it is a multi-step form, and the async field map if any fields load options from an API.

**When to use:** After requirements are finalized. Also use it to re-plan after making significant changes to the requirements brief.

**Syntax:**
```
/rjsf-plan
```

**Produces:** `.rjsf/form-plan.md` — a complete plan document you can review and approve or adjust before any code is generated.

**Example:**
```
/rjsf-plan
```

The output shows a table like:
```
Section: Personal Information (2 columns)
Field           Type      Widget      Width   Custom?
firstName       string    text        half    —
lastName        string    text        half    —
email           string    email       half    —
phone           string    PhoneWidget half    Widget: PhoneWidget
```

**Common follow-up:** Approve the plan or request layout changes ("use 3 columns in the address section", "change phone to a standard text input").

---

## `/rjsf-prototype`

**Description:** Runs Phase 3 — prototype generation. Reads the FormPlan and generates a completely self-contained `prototype.html` file inside the active session directory. The prototype uses vanilla HTML, CSS, and JavaScript with no build step and no external dependencies. It renders the actual layout, field types, column structure, and conditional show/hide logic.

**When to use:** After approving the FormPlan, before any React code is written. Share the prototype with your client for sign-off. The prototype makes layout and UX feedback fast and cheap to act on.

**Syntax:**
```
/rjsf-prototype
```

**Produces:** `{sessionDir}/prototype.html` — a single file you can open by double-clicking or send by email. Includes a visible notice explaining prototype limitations (no real API calls, no cross-field validation enforcement, no server submission).

**Example:**
```
/rjsf-prototype
```

**Common follow-up:** Open the file in a browser, share with the client. When they approve, come back and say "client approved" to continue to Phase 4.

---

## `/rjsf-execute`

**Description:** Runs Phase 4 — code generation. Reads the Requirements Brief and FormPlan and generates all React/RJSF source files. Shows you every file's full content in chat before writing anything to disk, so you can review and confirm the output path.

**When to use:** After client approval of the prototype. This is the phase that produces working code.

**Syntax:**
```
/rjsf-execute
```

**Produces:** All source files under `src/forms/<FormName>/`:
- `schema.ts` — JSON Schema (Draft-07, typed with `RJSFSchema`)
- `uiSchema.ts` — layout and widget configuration
- `types.ts` — TypeScript interfaces derived from the schema
- `index.tsx` — Form component with submission handling
- `widgets/` — any custom widget components
- `fields/` — any custom field components
- `templates/` — any custom template components

**Example:**
```
/rjsf-execute
```

**Common follow-up:** Review each file, confirm the output path, say "yes write them". Then run `/rjsf-test` to generate the test file.

---

## `/rjsf-test`

**Description:** Runs Phase 5 — test generation. Reads the schema, uiSchema, and FormPlan and generates a comprehensive test file covering required field validation, per-field validation rules, conditional field visibility, form submission (success and server rejection), server error mapping, accessibility (axe-core), and any edge-case-specific tests (multi-step navigation, draft save, async options, etc.).

**When to use:** After Phase 4 completes. Also use it standalone to regenerate tests after changing the form, or to add tests to an existing form that was not built with this plugin.

**Syntax:**
```
/rjsf-test
```

**Produces:** `src/forms/<FormName>/<FormName>.test.tsx` — a Vitest/Jest compatible test file. Run it with:
```bash
npx vitest src/forms/LoanApplication
# or
npx jest src/forms/LoanApplication
```

**Example:**
```
/rjsf-test
```

**Common follow-up:** Run the tests with your test runner to confirm they pass. If tests reveal schema issues, use `/rjsf-iterate` to fix them.

---

## `/rjsf-iterate`

**Description:** Modifies an already-generated form without re-running the full pipeline. Accepts a plain-English description of what to change. Shows you a before/after diff for every affected file before writing anything. Only rewrites the files that actually need to change.

**When to use:** Any time you need to change a form after Phase 4 has completed. Changes can be anything: adding or removing a field, changing a widget, adjusting layout, adding an edge case feature, converting single-page to multi-step, or fixing validation rules.

**Syntax:**
```
/rjsf-iterate "description of change"
```

**Produces:** Updated versions of only the affected files. Appends a changelog entry to `.rjsf/form-plan.md`.

**Examples:**
```
/rjsf-iterate "add a company name field after employment type"
/rjsf-iterate "change the phone field to use a masked input"
/rjsf-iterate "add async validation on the email field — check /api/check-email on blur"
/rjsf-iterate "change the address section to 3 columns"
/rjsf-iterate "add draft save with localStorage"
```

**Common follow-up:** Review the diff, say "yes" to apply. Re-run tests afterward to confirm nothing broke.

---

## `/rjsf-new`

**Description:** Creates a new named form session. Sets up a session directory under `.rjsf/sessions/<name>/` with an initial `session.json` and makes it the active session. All subsequent commands will operate on this session until you switch.

**When to use:** When starting work on a new form, especially when you already have an existing session and want to keep it intact.

**Syntax:**
```
/rjsf-new <name>
```

**Produces:** A new session directory `.rjsf/sessions/<name>/` with an initial `session.json`. Updates `.rjsf/active-session` to point to the new session.

**Example:**
```
/rjsf-new ContactForm
```

**Common follow-up:** Run `/rjsf-build "description"` to start building the form.

---

## `/rjsf-switch`

**Description:** Switches the active session to a different form. If a name is provided, switches directly. If no name is given, shows a picker listing all available sessions with their current phase and status.

**When to use:** When you want to resume work on a different form, or check the state of another session.

**Syntax:**
```
/rjsf-switch <name>
/rjsf-switch
```

**Produces:** Updates `.rjsf/active-session` to point to the selected session. No files are modified in the session itself.

**Example:**
```
/rjsf-switch LoanApplication
/rjsf-switch
```

**Common follow-up:** Run `/rjsf-status` to see where you left off, or `/rjsf-build` to resume.

---

## `/rjsf-list`

**Description:** Lists all form sessions under `.rjsf/sessions/` with their current phase, status, and last activity timestamp. Marks the currently active session.

**When to use:** When you want to see all forms you have been working on, check progress across multiple forms, or find the name of a session to switch to.

**Syntax:**
```
/rjsf-list
```

**Produces:** A formatted table in the chat showing all sessions. No files are written.

**Example:**
```
/rjsf-list
```

Output might look like:
```
Sessions:
  * ContactForm       Phase 4 (Execution)     completed
    LoanApplication   Phase 2 (Planning)      awaiting-approval
    EmployeeOnboard   Phase 1 (Requirements)  in-progress
```

**Common follow-up:** Run `/rjsf-switch <name>` to switch to a session, or `/rjsf-delete <name>` to archive one.

---

## `/rjsf-delete`

**Description:** Archives a named session by moving its directory from `.rjsf/sessions/<name>/` to `.rjsf/history/<name>/` and removing it from the active sessions list. Cannot delete the currently active session — switch to a different session first.

**When to use:** When a form is complete and you want to clean up, or when you want to discard an abandoned session.

**Syntax:**
```
/rjsf-delete <name>
```

**Produces:** Moves the session directory to `.rjsf/history/`. If the deleted session was the only session, clears `.rjsf/active-session`.

**Example:**
```
/rjsf-delete LoanApplication
```

**Common follow-up:** Run `/rjsf-list` to confirm the session was removed.

---

## `/rjsf-help`

**Description:** Provides plain-English explanations for any rjsf-agent command or RJSF concept. Ask about a specific command, a concept like "what is uiSchema", an error you are seeing, or a requirement like "how do I add a cascading select". Returns a focused explanation without launching any phase or modifying any files.

**When to use:** Whenever you are unsure how something works. Before running an unfamiliar command. When you encounter an unexpected behavior or error.

**Syntax:**
```
/rjsf-help
/rjsf-help "<question or topic>"
```

**Produces:** An explanation in the chat. No files written, no session modified.

**Examples:**
```
/rjsf-help "what is the difference between a widget and a field?"
/rjsf-help "how do I make a field required only when another field has a specific value?"
/rjsf-help "what does extraErrors do?"
/rjsf-help "how do I add async options to a select?"
```

**Common follow-up:** Use the explanation to inform your next `/rjsf-iterate` command or requirements description.
