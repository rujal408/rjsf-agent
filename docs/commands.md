# Commands Reference

Complete reference for all 8 rjsf-agent commands.

---

## Core Commands

### `/rjsf-new`

**Description:** Creates a new named form session. Sets up a session directory under `.rjsf/sessions/<name>/` with an initial `session.json` and makes it the active session.

**When to use:** When starting work on a new form, especially when you already have an existing session and want to keep it intact.

**Syntax:**
```
/rjsf-new <name>
```

**Produces:** A new session directory `.rjsf/sessions/<name>/` with an initial `session.json`. Updates `.rjsf/active-session`.

**Example:**
```
/rjsf-new ContactForm
```

**Common follow-up:** Run `/rjsf-form "description"` to start building.

---

### `/rjsf-form`

**Description:** The main command for building forms. Accepts an inline description or a `--from` flag pointing to a requirements file. Runs all 7 phases in sequence (requirements, suggestions, planning, technical, prototype, execution, testing), pausing between each for your approval. If a session already exists, resumes from the last incomplete phase.

**When to use:** Every time you want to build a new form or resume an interrupted session. This is the only command you need for the full pipeline.

**Syntax:**
```
/rjsf-form "description of your form"
/rjsf-form --from path/to/requirements.md
/rjsf-form
```

**Pause behavior:** After each phase, the agent asks: `Continue? (y / skip / stop)`
- **y** — proceed to next phase
- **skip** — skip the next phase
- **stop** — save progress and exit (resume later with `/rjsf-form`)

**Produces:** On full completion: schema, uiSchema, types, component, tests, and a prototype HTML file.

**Examples:**
```
# Start a new form (auto-creates session)
/rjsf-form "Loan application: applicant name, DOB, employment type (select), monthly income (number), loan amount, loan purpose (textarea)"

# Build from a file
/rjsf-form --from docs/requirements.md

# Resume where you left off
/rjsf-form

# After client approves prototype
/rjsf-form
# Then say: "client approved"
```

---

### `/rjsf-status`

**Description:** Shows your current session's phase-by-phase progress with status icons, plus a clear "What to do next" section that tells you exactly which command to run. Does not make changes.

**When to use:** Anytime you want to know where a session stands. Especially useful when returning after a break.

**Syntax:**
```
/rjsf-status
```

**Produces:** A formatted status report with guided next steps. No files are written.

**Example output:**
```
Active session: LoanApplication
Theme: @rjsf/mui | Styling: mui-grid

  ✅ Phase 1   — Requirements        (completed, 2 hours ago)
  ✅ Phase 1.5 — Feature Suggestions  (completed, 2 hours ago)
  ✅ Phase 2   — Planning             (completed, 1 hour ago)
  ✅ Phase 2.5 — Technical Decisions  (completed, 1 hour ago)
  ⏳ Phase 3   — Prototype            (awaiting client approval)
  ⬜ Phase 4   — Execution
  ⬜ Phase 5   — Testing

─── What to do next ────────────────────────────────────

Waiting for client approval. Share .rjsf/sessions/LoanApplication/prototype.html with your client.

Once they approve, run:
  /rjsf-form
Then say 'client approved' to continue.
```

---

## Utility Commands

### `/rjsf-iterate`

**Description:** Modifies an already-generated form without re-running the full pipeline. Shows a before/after diff for every affected file before writing. Only rewrites files that need to change.

**When to use:** Any time you need to change a form after code generation. Changes can be anything: adding fields, changing widgets, adjusting layout, adding features, fixing validation.

**Syntax:**
```
/rjsf-iterate "description of change"
```

**Produces:** Updated versions of only the affected files. Appends a changelog entry to `form-plan.md`.

**Examples:**
```
/rjsf-iterate "add a company name field after employment type"
/rjsf-iterate "change the phone field to use a masked input"
/rjsf-iterate "add draft save with localStorage"
/rjsf-iterate "change the address section to 3 columns"
```

---

### `/rjsf-list`

**Description:** Lists all form sessions with their current phase, status, and progress. Marks the active session.

**When to use:** When you want to see all forms, check progress, or find a session name to switch to.

**Syntax:**
```
/rjsf-list
```

**Example output:**
```
Sessions:
  * ContactForm       Phase 4 (Execution)     ✅1 ✅1.5 ✅2 ✅2.5 ✅3 ⏳4 ⬜5
    LoanApplication   Phase 2 (Planning)      ✅1 ⏳1.5 ⬜2 ⬜2.5 ⬜3 ⬜4 ⬜5
```

---

### `/rjsf-switch`

**Description:** Switches the active session. Provide a name to switch directly, or run without arguments to see a picker.

**Syntax:**
```
/rjsf-switch <name>
/rjsf-switch
```

**Example:**
```
/rjsf-switch LoanApplication
```

**Common follow-up:** Run `/rjsf-status` to see where you left off, or `/rjsf-form` to resume.

---

### `/rjsf-delete`

**Description:** Archives a session by moving it to `.rjsf/history/` and removing it from active sessions. Generated code at the output path is preserved.

**Syntax:**
```
/rjsf-delete <name>
```

**Example:**
```
/rjsf-delete LoanApplication
```

---

### `/rjsf-help`

**Description:** Explains any rjsf-agent command or RJSF concept in plain English. Ask about commands, concepts like "what is uiSchema", or features like "how do I add async validation".

**Syntax:**
```
/rjsf-help
/rjsf-help "<question or topic>"
```

**Examples:**
```
/rjsf-help "what is a custom widget?"
/rjsf-help "how do I resume?"
/rjsf-help "what are the phases?"
```
