# Getting Started with rjsf-agent

## 1. Install the plugin

```bash
claude plugin install github:your-org/rjsf-agent
```

## 2. Open your project in Claude Code

Navigate to the project directory where you want to add the form.

## 3. Build your first form

```bash
# Describe the form — the agent creates a session and starts building
/rjsf-form "Build a contact form with: full name (required), email (required), phone (optional), message (textarea, required), preferred contact method (radio: email / phone)"

# Or point to a requirements file
/rjsf-form --from docs/requirements.md
```

## 4. Follow the guided pipeline

The agent runs 7 phases automatically, pausing between each for your review:

1. **Requirements** — asks clarifying questions about your form (theme, validation, features)
2. **Suggestions** — proposes UI/UX enhancements as A/B/C options
3. **Planning** — designs column layout, widget choices, custom components
4. **Technical** — configures schema version, validator, submission pattern
5. **Prototype** — generates HTML for client sign-off
6. **Execution** — generates all React/RJSF code
7. **Testing** — generates comprehensive test file

At each pause, choose:
- **y** — continue to next phase
- **skip** — skip the next phase
- **stop** — save progress and exit

## 5. Share the prototype with your client

At Phase 3, the agent generates a `prototype.html` file — a self-contained file with no build step. You can:
- Open it in any browser by double-clicking
- Send it to your client by email (single file, zero dependencies)

The agent pauses here until your client approves. Once they do:

```bash
/rjsf-form
# Say "client approved"
```

## 6. Review the generated code

The agent shows every file before writing to disk. Final output:

```
src/forms/ContactForm/
├── schema.ts          JSON Schema
├── uiSchema.ts        Layout + widget config
├── types.ts           TypeScript interfaces
├── index.tsx          Form component
└── ContactForm.test.tsx  Tests
```

## 7. Run the tests

```bash
npx vitest src/forms/ContactForm
# or
npx jest src/forms/ContactForm
```

## Resuming after a break

```bash
# See where you left off and what to do next
/rjsf-status

# Resume the pipeline from where you stopped
/rjsf-form
```

## Making changes after generation

```bash
/rjsf-iterate "add a company name field after email"
/rjsf-iterate "change the phone field to use a masked input"
/rjsf-iterate "add draft save with localStorage"
```

The iterate command shows a before/after diff for every affected file before writing.

## Working on multiple forms

```bash
# Create sessions for each form
/rjsf-new ContactForm
/rjsf-form "contact form with name, email, message"

# Start another form
/rjsf-new LoanApplication
/rjsf-form "loan application with applicant info and income"

# Switch between forms
/rjsf-switch ContactForm

# See all sessions
/rjsf-list

# Archive a session
/rjsf-delete LoanApplication
```

## Where session data is stored

```
.rjsf/
├── active-session                         Points to the active form name
├── sessions/
│   ├── ContactForm/
│   │   ├── session.json                   Tracks phase progress
│   │   ├── requirements-brief.md          Phase 1 output
│   │   ├── form-plan.md                   Phase 2 output
│   │   └── prototype.html                 Phase 3 prototype
│   └── LoanApplication/
│       └── ...
└── history/                               Archived sessions
```

Commit the `requirements-brief.md` and `form-plan.md` files to version control so your team can see the design decisions.

## All commands

| Command | Purpose |
|---|---|
| `/rjsf-new` | Create a new form session |
| `/rjsf-form` | Build or resume a form (full pipeline) |
| `/rjsf-status` | See progress and what to do next |
| `/rjsf-iterate` | Modify an existing form (diff preview) |
| `/rjsf-list` | List all sessions |
| `/rjsf-switch` | Switch active session |
| `/rjsf-delete` | Archive and remove a session |
| `/rjsf-help` | Help on any command or concept |

## Next steps

- [All Commands Reference](commands.md)
- [Writing Good Requirements](requirements-guide.md)
- [Understanding the Generated Output](output-guide.md)
- [Custom Widgets, Fields & Templates](customization.md)
- [Examples](examples/)
