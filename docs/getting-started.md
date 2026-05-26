# Getting Started with rjsf-agent

## 1. Install the plugin

```bash
claude plugin install github:your-org/rjsf-agent
```

## 2. Open your project in Claude Code

Navigate to the project directory where you want to add the form.

## 3. Build your first form

Run one of these:

```bash
# Describe the form directly
/rjsf-build "Build a contact form with: full name (required), email (required), phone (optional), message (textarea, required), preferred contact method (radio: email / phone)"

# Point to a requirements file
/rjsf-build --from docs/requirements.md

# Not sure? Let the agent guide you
/rjsf
```

## 4. Answer the clarifying questions

The agent asks one question at a time (20 questions total, skipping any already answered in your input):

- Which RJSF theme your project uses
- Single-page form or multi-step wizard?
- Does the form need to edit existing data (edit mode)?
- Do any dropdown options come from an API?
- Are there cross-field validation rules?
- ... and more, depending on your form

Take your time — you can paste multi-line answers.

## 5. Approve the Requirements Brief

After gathering all information, the agent shows you a structured `RequirementsBrief` markdown document. Review it and either confirm ("yes, looks good") or request changes ("add a company name field to section 2").

## 6. Review the Form Plan

Phase 2 produces a `FormPlan` showing:
- Column layout for each section
- Widget chosen for each field
- Any custom components that will need to be built
- Step Map (if multi-step)
- Async field map (if any async operations)

Approve or adjust before moving on.

## 7. Share the prototype with your client

The agent generates `prototype/prototype.html` — a completely self-contained file with no build step required. You can:
- Open it in any browser by double-clicking the file
- Send it to your client by email (it's a single file)
- Host it anywhere — it has zero external dependencies

The prototype shows the real layout, field types, column structure, and conditional show/hide logic. It includes a notice explaining what is simplified (no real API calls, no cross-field validation enforcement).

Once your client approves, come back to Claude and say "client approved" to continue.

## 8. Review and write the code

Phase 4 shows you every file it will generate, with full content, before writing anything to disk. Review each file and confirm the output path (defaults to `src/forms/<FormName>/`).

## 9. Run the tests

```bash
# Vitest
npx vitest src/forms/ContactForm

# Jest
npx jest src/forms/ContactForm
```

The test file covers:
- Required field validation
- Per-field validation rules (minLength, pattern, etc.)
- Conditional field visibility
- Form submission (success + rejection)
- Server error mapping
- Accessibility (axe-core)
- Plus any edge-case-specific tests (multi-step navigation, draft save, etc.)

## Resuming after a break

If you close Claude and come back later:

```bash
/rjsf-build        # checks session.json, offers to resume
/rjsf-status       # shows exactly where you left off
```

## Making changes after generation

```bash
/rjsf-iterate "add a company name field after employment type"
/rjsf-iterate "change the phone field to use a masked input"
/rjsf-iterate "add async validation on the username field"
/rjsf-iterate "change layout to 3 columns in the personal details section"
```

The iterate skill shows a before/after diff for every affected file before writing.

## Where session data is stored

The agent creates a `.rjsf/` directory in your project:

```
.rjsf/
├── session.json          Tracks current phase and status
├── requirements-brief.md  Output of Phase 1
├── form-plan.md           Output of Phase 2
└── history/               Archived sessions (when starting fresh)
```

Commit `.rjsf/requirements-brief.md` and `.rjsf/form-plan.md` to version control so your team can see the design decisions. The `session.json` file can also be committed for full traceability, or added to `.gitignore` if you prefer to keep it local.

## Next steps

- [All Commands Reference](commands.md)
- [Writing Good Requirements](requirements-guide.md)
- [Understanding the Generated Output](output-guide.md)
- [Custom Widgets, Fields & Templates](customization.md)
- [Examples](examples/)
