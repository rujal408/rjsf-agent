# rjsf-agent

A Claude Code plugin that converts client form requirements into a complete RJSF implementation — JSON Schema, uiSchema, custom widgets/fields/templates, HTML prototype, and tests.

## Install

```bash
claude plugin install github:your-org/rjsf-agent
```

## Quick Start

```bash
# Not sure where to start?
/rjsf

# Build a form from a description
/rjsf-build "Build a loan application form: applicant name, DOB, employment type, monthly income"

# Build from a requirements file
/rjsf-build --from requirements.md

# Check progress on an existing session
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

Plus `prototype/prototype.html` — a self-contained file for client sign-off before any React code is written.

## How It Works

The agent runs 5 phases:

1. **Requirements** — asks clarifying questions, produces a structured brief
2. **Planning** — designs column layout, widget choices, identifies any custom components needed
3. **Prototype** — generates a standalone `prototype/prototype.html` for client approval
4. **Execution** — generates all React/RJSF code (schema, uiSchema, components, tests)
5. **Testing** — generates test file covering validation, conditionals, a11y

Each phase pauses for your approval before proceeding. Session state is saved so you can resume after closing Claude.

## Commands

| Command | Purpose |
|---|---|
| `/rjsf` | Smart entry — let the agent guide you |
| `/rjsf-build` | Full pipeline or resume existing session |
| `/rjsf-status` | See current session progress |
| `/rjsf-requirements` | Phase 1 — gather requirements |
| `/rjsf-plan` | Phase 2 — design structure and layout |
| `/rjsf-prototype` | Phase 3 — generate HTML prototype |
| `/rjsf-execute` | Phase 4 — generate all React/RJSF code |
| `/rjsf-test` | Phase 5 — generate tests |
| `/rjsf-iterate "change"` | Modify an existing form |
| `/rjsf-help` | Help on any command or concept |

## Supported RJSF Themes

- `@rjsf/core`
- `@rjsf/mui` (Material UI)
- `@rjsf/antd` (Ant Design)
- `@rjsf/bootstrap`

Theme is selected during requirements gathering (Phase 1).

## What It Handles

- Multi-step wizard forms with Back/Next navigation
- Async options loaded from an API (e.g. country → province cascading selects)
- Server-side field validation on blur
- Server error mapping after submission
- Cross-field validation (e.g. end date must be after start date)
- Nested arrays (work history with skills sub-lists)
- Computed/derived fields
- Drag-to-reorder array items (`@dnd-kit/core`)
- File upload to a server endpoint
- Read-only view mode
- Tab layout (all sections accessible at once)
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
# rjsf-agent
