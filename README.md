# rjsf-agent

A Claude Code plugin that converts client form requirements into a complete RJSF implementation — JSON Schema, uiSchema, custom widgets/fields/templates, HTML prototype, and tests.

## Install

```bash
# Step 1: Register the marketplace (once per machine)
/plugin marketplace add rujal408/rjsf-agent

# Step 2: Install the plugin
/plugin install rjsf-agent@rjsf-agent
```

> **Coming soon:** Once listed in the official Claude community marketplace, installation will be a single command.

## Updating

```bash
claude plugin update rjsf-agent
```

Restart Claude Code after updating for changes to take effect.

## Quick Start

```bash
# Build a form from a description (creates session automatically)
/rjsf-form "Build a loan application form: applicant name, DOB, employment type, monthly income"

# Build from a requirements file
/rjsf-form --from requirements.md

# Resume where you left off
/rjsf-form

# Check progress and see what to do next
/rjsf-status
```

## What You Get

For every form you build, the agent produces:

```
src/forms/LoanApplication/
├── schema.ts                    JSON Schema (Draft-07, typed)
├── uiSchema.ts                  Layout + widget configuration
├── types.ts                     TypeScript interfaces
├── index.tsx                    Form component with submission states
├── widgets/                     Custom widgets (if any are needed)
│   └── PhoneWidget.tsx
├── fields/                      Custom fields (if any are needed)
├── templates/                   Custom templates (if any are needed)
│   └── WizardTemplate.tsx
└── LoanApplication.test.tsx     Tests (validation, conditions, a11y)
```

Plus `prototype.html` — a self-contained file for client sign-off before any React code is written.

## How It Works

Run `/rjsf-form "describe your form"` and the agent runs 7 phases automatically, pausing between each for your review:

1. **Requirements** — asks clarifying questions, produces a structured brief
2. **Suggestions** — proposes UI/UX enhancements as A/B/C options
3. **Planning** — designs column layout, widget choices, identifies custom components
4. **Technical** — configures schema version, validator, submission pattern
5. **Prototype** — generates standalone HTML for client approval
6. **Execution** — generates all React/RJSF code
7. **Testing** — generates comprehensive test file

At each pause you choose: **y** (continue), **skip** (skip next phase), or **stop** (save and exit). Run `/rjsf-form` again anytime to resume.

## Commands

| Command | Purpose |
|---|---|
| `/rjsf-new` | Create a new form session |
| `/rjsf-form` | Build a form (full pipeline) or resume |
| `/rjsf-status` | See progress and what to do next |
| `/rjsf-iterate "change"` | Modify an existing form (diff preview) |
| `/rjsf-list` | List all sessions |
| `/rjsf-switch [name]` | Switch active session |
| `/rjsf-delete <name>` | Archive and remove a session |
| `/rjsf-help` | Help on any command or concept |

## Typical Workflow

```bash
# 1. Start building
/rjsf-form "patient intake form with name, DOB, insurance, allergies"

# 2. Answer questions, approve phases (agent guides you through each)

# 3. Share prototype with client
#    Agent pauses at Phase 3 — open prototype.html, send to client

# 4. Resume after client approves
/rjsf-form
# Say "client approved"

# 5. Agent generates code and tests

# 6. Make changes later
/rjsf-iterate "add a phone field with country code"

# 7. Check status anytime
/rjsf-status
```

## Supported RJSF Themes

- `@rjsf/core`
- `@rjsf/mui` (Material UI)
- `@rjsf/antd` (Ant Design)
- `@rjsf/bootstrap`

Theme is selected during the requirements phase.

## What It Handles

- Multi-step wizard forms with Back/Next navigation
- Async options loaded from an API (cascading selects)
- Server-side field validation on blur
- Server error mapping after submission
- Cross-field validation
- Nested arrays (work history with skills sub-lists)
- Computed/derived fields
- Drag-to-reorder array items (`@dnd-kit/core`)
- File upload to a server endpoint
- Read-only view mode
- Tab layout
- Multi-language (i18n) support
- Masked input fields (phone, credit card)
- Rich text / WYSIWYG editors
- Print / PDF export
- Role-based field visibility
- Draft save with localStorage
- Accessibility (axe-core tests generated)

## Documentation

- [Getting Started](docs/getting-started.md)
- [All Commands](docs/commands.md)
- [Writing Requirements](docs/requirements-guide.md)
- [Understanding Generated Output](docs/output-guide.md)
- [Custom Widgets, Fields & Templates](docs/customization.md)
- [Layout Guide](docs/layout-guide.md)
- [Edge Cases](docs/edge-cases.md)
- [Examples](docs/examples/)
