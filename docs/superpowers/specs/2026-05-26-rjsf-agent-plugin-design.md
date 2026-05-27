# RJSF Agent Plugin — Design Spec
**Date:** 2026-05-26  
**Status:** Approved

---

## 1. Overview

A Claude Code plugin that developers install locally. Given client requirements (natural language or a file), the agent produces a complete, production-ready RJSF form implementation — JSON Schema, uiSchema, custom widgets/fields/templates, tests, and a client-facing HTML/JS prototype — targeting whichever RJSF theme the developer's project uses (`@rjsf/core`, `@rjsf/mui`, `@rjsf/antd`, `@rjsf/bootstrap`).

The agent handles not just data modeling but also UI layout design: column layouts, widget selection, field ordering, section grouping, and visual hierarchy.

---

## 2. Goals

- Accept requirements as natural language chat or a structured requirements file (or both)
- Detect and handle any kind of complex form: multi-step, conditional logic, cascading selects, async options, arrays of objects, cross-field validation, role-based visibility, draft saving
- Generate a clickable HTML/JS prototype for client sign-off before any React code is written
- Show a full preview of all generated files before writing to disk — developer confirms before anything is saved
- Ask the developer their preferred styling approach (CSS Modules / Tailwind / plain CSS / bare) once per session, then apply it consistently
- Cover custom widgets, fields, and templates when standard RJSF primitives are insufficient — and explain why each is needed
- Generate tests alongside the form code
- Support iterating on already-generated forms via `/rjsf-iterate`

---

## 3. Plugin Structure

```
rjsf-agent/
├── plugin.json                          # Plugin manifest
├── README.md                            # Quick start: install, first run, examples
├── docs/
│   ├── getting-started.md               # Step-by-step: install → first form in 5 min
│   ├── commands.md                      # Every skill explained with examples
│   ├── requirements-guide.md            # How to write good requirements + file template
│   ├── output-guide.md                  # What files are generated, where, and why
│   ├── customization.md                 # Widgets vs fields vs templates — when and how
│   ├── layout-guide.md                  # How the agent makes UI layout decisions
│   ├── edge-cases.md                    # Async options, multi-step, role-based, draft save
│   └── examples/
│       ├── loan-application.md          # End-to-end: requirements → output
│       ├── registration-form.md         # Sections + conditional fields
│       └── dynamic-survey.md           # Arrays + custom widgets
├── skills/
│   ├── rjsf/SKILL.md                   # Smart entry point + natural language router
│   ├── rjsf-help/SKILL.md              # Contextual help for any command or concept
│   ├── rjsf-build/SKILL.md             # Orchestrator (resumes or starts fresh)
│   ├── rjsf-status/SKILL.md            # Show current session progress
│   ├── rjsf-requirements/SKILL.md      # Phase 1
│   ├── rjsf-plan/SKILL.md             # Phase 2
│   ├── rjsf-prototype/SKILL.md        # Phase 3
│   ├── rjsf-execute/SKILL.md          # Phase 4
│   ├── rjsf-test/SKILL.md             # Phase 5
│   └── rjsf-iterate/SKILL.md          # On-demand iteration
└── references/
    ├── rjsf-widget-api.md              # WidgetProps, FieldProps, TemplateProps APIs
    ├── rjsf-schema-patterns.md         # Common schema patterns with layout notes
    ├── customization-decision-tree.md  # Widget vs field vs template decision logic
    └── layout-principles.md            # Column/section/widget layout principles (Claude reference)
```

---

## 4. Five-Phase Pipeline

```
Requirements (natural language or file)
         │
         ▼
┌──────────────────────────┐
│  Phase 1: REQUIREMENTS   │  → RequirementsBrief
│  /rjsf-requirements      │
└──────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Phase 2: PLANNING       │  → FormPlan (developer approved)
│  /rjsf-plan              │
└──────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Phase 3: PROTOTYPE      │  → prototype.html (client approved)
│  /rjsf-prototype         │  ⛔ Pipeline pauses for client confirmation
└──────────────────────────┘
         │
   client confirms
         │
         ▼
┌──────────────────────────┐
│  Phase 4: EXECUTION      │  → Files written to src/forms/<Name>/
│  /rjsf-execute           │  (preview → developer confirms → write)
└──────────────────────────┘
         │
         ▼
┌──────────────────────────┐
│  Phase 5: TESTING        │  → Test files alongside form files
│  /rjsf-test              │
└──────────────────────────┘
```

---

## 5. Skills

| Command | Role | Entry point |
|---|---|---|
| `/rjsf` | Smart entry point — detects context and guides developer | **Start here if unsure** |
| `/rjsf-build` | Orchestrator — resumes session or starts fresh | Primary command |
| `/rjsf-status` | Show current session progress at a glance | Anytime |
| `/rjsf-requirements` | Phase 1 — gather & clarify requirements | Can run standalone |
| `/rjsf-plan` | Phase 2 — design structure, layout, components | Can run standalone |
| `/rjsf-prototype` | Phase 3 — HTML/JS prototype for client | Can run standalone |
| `/rjsf-execute` | Phase 4 — generate all React/RJSF code | Can run standalone |
| `/rjsf-test` | Phase 5 — generate tests | Can run standalone |
| `/rjsf-iterate` | On-demand — modify existing generated form | Reads existing files |
| `/rjsf-help` | Explain any command or concept in plain English | Anytime |

**Usage examples:**
```bash
# Don't know where to start — let the agent guide you
/rjsf

# Full pipeline — natural language
/rjsf-build "Build a loan application form for a bank"

# Full pipeline — from requirements file
/rjsf-build --from requirements.md

# Check progress after returning to a project
/rjsf-status

# Make a change to an already-generated form
/rjsf-iterate "change section 2 to a 2-column layout"

# Ask for help on any command
/rjsf-help "what does rjsf-plan do?"
/rjsf-help "when do I need a custom field vs a widget?"
```

---

## 6. Skill Discovery & Intelligent Routing

Developers should never need to memorise which command to run. Two mechanisms ensure this:

### 6.1 `/rjsf` — Smart Entry Point

Running `/rjsf` with no arguments (or with a vague natural language message) is the catch-all entry point. It reads the current project state and guides the developer to the right command.

**Decision logic:**

```
/rjsf invoked
      │
      ├─ .rjsf/session.json exists?
      │       │
      │       ├─ YES, incomplete → show /rjsf-status summary
      │       │   "You were at Phase 3. Run /rjsf-build to continue,
      │       │    or /rjsf-iterate to change something."
      │       │
      │       └─ YES, completed → offer options
      │           "LoanApplication is complete. Want to:
      │            • Iterate on it   → /rjsf-iterate "describe change"
      │            • Build a new form → /rjsf-build "describe form"
      │            • Run tests        → /rjsf-test"
      │
      └─ No session → ask what the developer wants to do
          "What would you like to do?
           A) Build a new form from requirements
           B) Modify an existing generated form
           C) Generate tests for an existing form
           D) See what this plugin can do  → explains all commands"
```

**Natural language routing** — `/rjsf` also understands plain English intent:

| Developer says | Agent routes to |
|---|---|
| "I want to build a form" | `/rjsf-build` |
| "Where was I?" / "Continue" | `/rjsf-status` then `/rjsf-build` to resume |
| "Change the layout" / "Update the form" | `/rjsf-iterate` |
| "The client wants changes" | `/rjsf-iterate` |
| "Generate tests" | `/rjsf-test` |
| "Show me the prototype" | `/rjsf-prototype` |
| "What can this do?" | `/rjsf-help` |
| "I have requirements in a file" | `/rjsf-build --from <file>` |

---

### 6.2 End-of-Phase Prompts

Every skill ends with an explicit "what to do next" prompt so the developer is never left wondering. The agent never silently finishes a phase.

**After Phase 1 (Requirements):**
> "Requirements captured. Next step: run `/rjsf-plan` to design the form structure and layout, or `/rjsf-build` to continue automatically."

**After Phase 2 (Planning):**
> "Form plan approved. Next step: run `/rjsf-prototype` to generate the client prototype, or `/rjsf-build` to continue automatically."

**After Phase 3 (Prototype):**
> "Prototype written to `prototype/prototype.html`. Share it with your client.
> Once they approve, run `/rjsf-build` (or just say 'client approved') to proceed to implementation."

**After Phase 4 (Execution):**
> "Form files written to `src/forms/LoanApplication/`. Next step: run `/rjsf-test` to generate tests, or start using the form. To make changes later, run `/rjsf-iterate`."

**After Phase 5 (Testing):**
> "Tests written. Your form is complete.
> - To modify the form: `/rjsf-iterate "describe what to change"`
> - To check status anytime: `/rjsf-status`
> - To build another form: `/rjsf-build "describe new form"`"

---

### 6.3 `/rjsf-help` — Contextual Help

`/rjsf-help` answers questions about the plugin in plain English. It understands both command names and concepts.

**Examples:**
```bash
/rjsf-help                              # lists all commands with one-line descriptions
/rjsf-help rjsf-plan                    # explains what rjsf-plan does, when to use it
/rjsf-help "what is a custom widget?"  # explains RJSF widget concept
/rjsf-help "when do I need a template?" # explains templates vs fields vs widgets
/rjsf-help "how do I add async validation?" # explains async validation pattern
/rjsf-help "what files get generated?" # explains output structure
```

`/rjsf-help` always ends its answer with: "Want me to run the relevant command now?"

---

### 6.4 Inline Suggestions During Phases

Within any phase, if the developer asks something outside that phase's scope, the agent redirects gracefully rather than ignoring it:

| Developer asks during Phase 1 | Agent responds |
|---|---|
| "Can you generate the schema now?" | "I'll capture that in Phase 2 (Planning). Let me finish gathering requirements first — just a couple more questions." |
| "Actually I want to change the layout" | "Once requirements are done, `/rjsf-plan` is where we design the layout. I'll flag your layout preference there." |
| "Skip this, just build it" | "Happy to use sensible defaults for the remaining questions. Shall I proceed with defaults for: required fields, single-page layout, no async options?" |

---

### 6.5 Plugin Structure Update — new skills

```
skills/
├── rjsf/SKILL.md              # Smart entry point + natural language router
├── rjsf-help/SKILL.md         # Contextual help for any command or concept
├── rjsf-build/SKILL.md        # Orchestrator
├── rjsf-status/SKILL.md       # Session status
├── rjsf-requirements/SKILL.md # Phase 1
├── rjsf-plan/SKILL.md         # Phase 2
├── rjsf-prototype/SKILL.md    # Phase 3
├── rjsf-execute/SKILL.md      # Phase 4
├── rjsf-test/SKILL.md         # Phase 5
└── rjsf-iterate/SKILL.md      # On-demand iteration
```

---

## 7. Phase Internals

### Phase 1 — `/rjsf-requirements`

1. Read input (inline text or file path; accept `.md`, `.txt`, plain text)
2. Extract: form purpose, user persona, sections, fields, types, validations, conditional logic, layout hints
3. Ask clarifying questions one at a time for ambiguities:
   - **Which RJSF theme does your project use?** (`@rjsf/core` / `@rjsf/mui` / `@rjsf/antd` / `@rjsf/bootstrap`) — saved to session, affects all generated code
   - Field type unclear
   - Required vs optional not stated
   - Conditional logic vague
   - Multi-step or single page?
   - Edit mode needed (pre-populate from existing data)?
   - Draft / auto-save needed?
   - Any fields dependent on user role/permissions?
   - Any options loaded from an API?
   - Any cross-field validation rules?
   - Any field that validates live against an API on blur (async field validation)?
   - Will submission errors from the server need to map back to specific fields?
   - Are any arrays nested inside other arrays?
   - Are any field values computed from other fields?
   - Do array items need to be reorderable?
   - Will file uploads go to a server or be base64 encoded?
   - Does the form need a read-only view mode (display submitted data)?
   - Should sections be in tabs rather than a linear layout?
   - Does the form need multi-language / i18n support?
   - Does any field require formatted input (phone mask, credit card, etc.)?
   - Does any field need a rich text / WYSIWYG editor?
   - Does the form need a print or PDF export action?
4. Produce **RequirementsBrief** containing:
   - Form title, purpose, user persona
   - Ordered sections with fields, types, constraints
   - Conditional logic map
   - Layout preferences
   - Edge case flags: `async_options`, `cross_field_validation`, `multi_step`, `edit_mode`, `role_based`, `draft_save`
   - RJSF theme: `core` | `mui` | `antd` | `bootstrap`
5. Show RequirementsBrief → ask developer to approve before proceeding

### Phase 2 — `/rjsf-plan`

1. Load RequirementsBrief
2. Ask styling preference if not already known: CSS Modules / Tailwind / plain CSS / bare structure
3. For each section decide:
   - Column layout (1–4 columns based on field count and field width needs)
   - Widget per field (infer from type + format + layout hints)
   - `ui:order`, placeholders, help text, `ui:options`
4. Produce **Customization Assessment**:
   - Standard RJSF covers: list fields
   - Needs custom **Widget**: name, why (single input control is insufficient)
   - Needs custom **Field**: name, why (multiple inputs under one label, or cross-field validation)
   - Needs custom **Template**: name, why (layout of a group of fields, multi-step, accordion)
5. For multi-step forms: produce a **Step Map** (step key, title, fields per step, validation trigger)
6. For async options: identify which fields need dynamic enum loading and from where
7. Produce **FormPlan** → show to developer → ask for approval

### Phase 3 — `/rjsf-prototype`

1. Load FormPlan
2. Generate a self-contained `prototype.html` (no build step, no dependencies):
   - All sections and fields rendered in plain HTML with correct column layout
   - Labels, placeholders, help text, required markers
   - Conditional show/hide via vanilla JS
   - Multi-step navigation with Back/Next buttons (if applicable)
   - Submit button showing a data summary panel (no real submission)
3. Include a **Prototype Limitations Notice** in the HTML and in chat:
   - What is simplified: async option loading (shows static placeholder options), complex cross-field validation (not enforced), role-based visibility (all fields shown)
   - What is accurate: layout, field types, section structure, conditional show/hide, step flow
4. Write file to `prototype/prototype.html` in the developer's project root
5. Tell developer: "Share this file with your client. Return here once they confirm and we will proceed to implementation."
6. **Pipeline pauses** — Phase 4 only runs after developer confirms client approval

### Phase 4 — `/rjsf-execute`

1. Load FormPlan + Customization Assessment
2. Generate all artifacts:

   **`schema.ts`** — JSON Schema Draft-07, typed, with comments on key decisions  
   **`uiSchema.ts`** — layout, widget overrides, options, ordering  
   **`types.ts`** — TypeScript interfaces derived from schema  
   **`index.tsx`** — Form component wiring schema + uiSchema + custom components + submission states (loading, success, error)  
   **`widgets/`** — one file per custom widget implementing `WidgetProps`  
   **`fields/`** — one file per custom field implementing `FieldProps`  
   **`templates/`** — one file per custom template implementing the relevant template props  

3. For each custom component: show the RJSF API contract it implements with inline comments explaining every non-obvious decision, and show exactly where it is wired in uiSchema / Form props
4. Handle edge cases:
   - **Async options**: custom widget with `useEffect`-based fetch hook and loading/error states
   - **Cross-field validation**: custom AJV keyword or `customValidate` prop (not `ui:options.validate` — not yet implemented in runtime)
   - **Multi-step**: `MultiStepForm` config with per-step schema/uiSchema and step navigation
   - **Edit mode**: `index.tsx` accepts optional `formData` prop for pre-population
   - **Role-based visibility**: `visibilityConfig` prop or React context pattern
   - **Draft save**: `localStorage` or API-based auto-save hook (developer chooses)
   - **Submission states**: loading spinner, success message, error display in `index.tsx`
   - **Server-side error mapping**: `handleServerErrors(errors)` utility wired to `customValidate`
   - **Async field validation**: debounced validator widget with loading indicator
   - **Nested arrays**: custom `ArrayFieldTemplate` with one additional nesting level
   - **Computed fields**: `useEffect` derived value hook writing to a read-only display field
   - **Array reorder**: dnd-kit `ArrayFieldTemplate`
   - **File upload (server)**: multipart POST widget with progress bar, stores returned URL
   - **View mode**: `<FormNameView />` companion component (read-only summary, no inputs)
   - **Tab layout**: `TabsTemplate` ObjectFieldTemplate
   - **Masked input**: mask widget with configurable pattern
   - **Autocomplete**: debounced fetch widget with keyboard navigation
   - **i18n**: translation keys + `translations.ts` companion file
   - **Rich text**: custom WYSIWYG widget with library integration point
   - **Print mode**: `@media print` CSS block + `window.print()` trigger
5. Show **full file tree preview** with complete file contents in chat
6. Ask: "Write these files to `src/forms/<FormName>/`? (yes / change path / cancel)"
7. On confirmation: write all files

**Generated output structure:**
```
src/forms/LoanApplication/
├── schema.ts
├── uiSchema.ts
├── types.ts
├── index.tsx
├── widgets/
│   └── PhoneWidget.tsx
├── fields/
│   └── DateRangeField.tsx
└── templates/
    └── WizardTemplate.tsx
```

### Phase 5 — `/rjsf-test`

Generate test files covering:
- Required field validation (submit without required fields → errors shown)
- Per-field validation rules (minLength, pattern, minimum/maximum)
- Cross-field validation (password === confirmPassword, endDate > startDate)
- Conditional field visibility (field appears when trigger field has expected value)
- Cascading select reset (child options reset when parent value changes)
- Async option loading (mock fetch, verify options populate correctly)
- Custom widget rendering and value propagation
- Multi-step navigation (Next validates current step, Back preserves values)
- Edit mode pre-population (formData prop populates all fields correctly)
- Form submission with valid data (onSubmit called with correct shape)
- Form submission with invalid data (onError called, no onSubmit)

Tests written to `src/forms/<FormName>/<FormName>.test.tsx`.

### `/rjsf-iterate`

1. Read existing files in `src/forms/<FormName>/`
2. Accept a change request in natural language
3. Identify which phases are affected (schema only? layout only? a component?)
4. Rerun only the affected phases
5. Show diff of what will change → confirm → write

---

## 7. Customization Detection

The three levels of RJSF customization and when each is needed:

| Level | Controls | Use when |
|---|---|---|
| **Widget** | A single input control | Standard HTML input is insufficient (phone + country code, color picker, star rating) |
| **Field** | Full field: label + multiple inputs + error | Two inputs share one label, or cross-field validation within one logical field (date range) |
| **Template** | Layout of a group of fields | Multi-step wizard, accordion sections, side-by-side label/input, custom array item layout |

The Customization Assessment in Phase 2 surfaces all three needs before any code is written. For each custom component the agent:
1. Names it and explains why standard RJSF is insufficient
2. States the exact RJSF API interface it implements
3. Shows the generated component with inline comments
4. Shows exactly where it is wired in uiSchema or Form props

---

## 8. Edge Cases In Scope

### Original edge cases

| Edge Case | Detected in | Handled in |
|---|---|---|
| Async / dynamic options | Phase 1 | Phase 4 — custom widget with fetch hook |
| Cross-field validation | Phase 1 | Phase 4 — custom AJV keyword or resolver-level rule (not `ui:options.validate` — not yet implemented in runtime) |
| Multi-step / wizard | Phase 1 | Phase 2 step map + Phase 4 MultiStepForm config |
| Create vs edit mode | Phase 1 | Phase 4 — optional `formData` prop |
| Submission states | Phase 4 always | Phase 4 — loading / success / error in `index.tsx` |
| Role-based field visibility | Phase 1 | Phase 4 — `visibilityConfig` prop or context |
| Draft / auto-save | Phase 1 | Phase 4 — localStorage or API hook (developer chooses) |
| Prototype limitations | Phase 3 | Disclosed in prototype HTML + chat |
| Iteration on existing form | `/rjsf-iterate` | Reads files, reruns affected phases only |
| Requirements file format | `docs/requirements-guide.md` | Defined template developers can follow |

### Additional edge cases

#### 🔴 Critical

**Server-Side Error Mapping**
After submission the backend returns field-level errors (e.g. `{ "email": "already taken" }`). Phase 4 always generates a `handleServerErrors(errors)` utility that maps backend error keys onto form fields using the form's `setErrors` / `customValidate` RJSF hook.

**Async Field-Level Validation**
Per-field live checks on blur — username availability, NID existence, email uniqueness. Phase 1 detects when requirements mention real-time or uniqueness checks. Phase 4 generates a debounced async validator widget with loading indicator and error display.

**Nested Arrays**
Arrays inside arrays (e.g. Work History → each job has a Skills array). Blocked in the current runtime at one level. Phase 1 detects nested array requirements. Phase 4 generates a custom `ArrayFieldTemplate` that handles one additional nesting level and clearly documents the one-level limit.

**Cross-Field Validation (implementation note)**
`ui:options.validate` is documented in `CONDITIONAL.md` but not yet implemented in the runtime. Phase 4 generates a custom AJV keyword or a `customValidate` prop function instead — not `ui:options.validate`.

#### 🟡 Important

**Computed / Derived Fields**
Fields whose value is auto-calculated from other fields (`total = qty × price`, `age = today − dob`, `full_name = first + last`). Phase 1 asks if any fields are computed. Phase 4 generates a `useEffect`-based derived value hook that watches source fields and writes the result into a read-only display field.

**Array Item Reordering**
Users need to reorder items in a list (priority order, ranked preferences). Phase 1 detects ordering requirements. Phase 4 generates a drag-and-drop `ArrayFieldTemplate` using `@dnd-kit` (already a dependency in the ecosystem).

**File Upload — Server Upload Pattern**
Base64 encoding only works for small files. Phase 1 asks: "Will uploaded files go to a server or be encoded as base64?" When server upload is needed, Phase 4 generates a custom file widget with multipart `FormData` POST, progress bar, and stores the returned URL/ID in form data.

**Full Read-Only / View Mode**
Same form for displaying submitted data — labels with plain text values, no inputs, print-friendly. Phase 1 detects view-mode requirements. Phase 4 generates a `<FormNameView />` companion component that renders the same schema as a styled read-only summary, not a form.

**Tab-Based Layout**
Groups of fields in tabs — all tabs accessible at once, no sequential validation (distinct from a wizard). Phase 2 detects tab layout requirements separately from multi-step. Phase 4 generates a `TabsTemplate` (ObjectFieldTemplate) with accessible tab navigation.

**Masked / Formatted Input**
Phone numbers, credit cards, national IDs, IBAN — inputs that format as the user types. Phase 1 detects masking requirements. Phase 4 generates a masked input widget with a configurable mask pattern.

#### 🟢 Nice to Have

**Debounced Autocomplete / Search-as-you-type**
A text field that fetches suggestions from an API as the user types — distinct from a static select or full async options load. Phase 4 generates an autocomplete widget with debounced fetch, keyboard navigation, and accessible suggestion list.

**i18n / Multi-Language Labels**
Form labels, placeholders, and error messages in multiple languages. Phase 1 asks if the form needs to support multiple languages. Phase 4 generates labels as translation keys (`t('fieldName.label')`) with a companion `translations.ts` file containing all string keys.

**Rich Text Editor Field**
WYSIWYG input for formatted content — notes, descriptions, terms. Phase 1 detects rich text requirements. Phase 4 generates a custom widget that wraps a `contenteditable`-based editor or provides a clean integration point for a library the developer already uses (Quill, TipTap, etc.).

**Accessibility Testing**
Every generated form should be tested for ARIA labels, keyboard navigation, and focus management when conditional fields appear. Phase 5 always generates an `axe-core` accessibility test alongside the functional tests.

**Print / Export Mode**
"Print this form" or "Export as PDF" action — common in application forms, intake forms, government forms. Phase 1 detects print requirements. Phase 4 generates a `@media print` CSS block and a `window.print()` trigger on the form component.

---

## 9. Documentation Plan

| File | Audience | Contents |
|---|---|---|
| `README.md` | Any developer | Install, first run in 5 minutes, link to all docs |
| `docs/getting-started.md` | New users | Step-by-step walkthrough from install to first generated form |
| `docs/commands.md` | All users | Every skill with syntax, options, examples |
| `docs/requirements-guide.md` | All users | How to write requirements + structured file template |
| `docs/output-guide.md` | All users | Every generated file explained: what it is, why it exists |
| `docs/customization.md` | Advanced users | Widget vs field vs template decision tree + API reference |
| `docs/layout-guide.md` | All users | How the agent chooses columns, widget types, field order |
| `docs/edge-cases.md` | Advanced users | All edge cases: async validation, server errors, nested arrays, computed fields, reorder, file upload, view mode, tabs, masks, i18n, rich text, a11y, print |
| `docs/examples/loan-application.md` | All users | End-to-end: multi-section + async validation + server error mapping |
| `docs/examples/registration-form.md` | All users | Sections + conditional fields + cross-field validation |
| `docs/examples/dynamic-survey.md` | All users | Arrays + reorder + nested arrays + custom widgets |
| `docs/examples/ecommerce-checkout.md` | All users | Multi-step + file upload (server) + computed totals + i18n |

---

## 10. Session Persistence & History

Every phase saves its output as a file inside a `.rjsf/` directory in the developer's project. This means developers can close Claude, come back later, and resume exactly where they left off — with full context restored.

### Directory layout

```
.rjsf/
├── session.json              # Current active session state
├── requirements-brief.md     # Phase 1 output (human-readable)
├── form-plan.md              # Phase 2 output (human-readable)
└── history/
    ├── LoanApplication-2026-05-26.json   # Archived past sessions
    └── RegistrationForm-2026-05-20.json
```

### `session.json` structure

```json
{
  "version": "1.0",
  "formName": "LoanApplication",
  "outputPath": "src/forms/LoanApplication",
  "rjsfTheme": "mui",
  "stylingApproach": "css-modules",
  "currentPhase": 3,
  "phases": {
    "1": {
      "status": "completed",
      "completedAt": "2026-05-26T10:30:00Z",
      "artifactPath": ".rjsf/requirements-brief.md"
    },
    "2": {
      "status": "completed",
      "completedAt": "2026-05-26T11:00:00Z",
      "artifactPath": ".rjsf/form-plan.md"
    },
    "3": {
      "status": "awaiting_client_approval",
      "artifactPath": "prototype/prototype.html"
    },
    "4": { "status": "pending" },
    "5": { "status": "pending" }
  }
}
```

### Resume behavior

When any skill starts, it checks for `.rjsf/session.json` first:

- **Session found → incomplete**: Agent says:
  > "Found an active session for **LoanApplication** (started 2026-05-26). You were at Phase 3 — Prototype, awaiting client approval. Resume from here or start fresh?"
  - **Resume**: Loads context from saved artifact files, continues from the saved phase
  - **Start fresh**: Archives the current session to `.rjsf/history/`, starts new session

- **Session found → completed**: Agent says:
  > "**LoanApplication** was fully built on 2026-05-26. Want to iterate on it (`/rjsf-iterate`) or start a new form?"

- **No session found**: Starts Phase 1 normally

### What each phase saves

| Phase | Saves to | Contains |
|---|---|---|
| 1 — Requirements | `.rjsf/requirements-brief.md` | Full RequirementsBrief in readable markdown |
| 2 — Planning | `.rjsf/form-plan.md` | Full FormPlan + Customization Assessment + Step Map |
| 3 — Prototype | `prototype/prototype.html` + session status update | Prototype file + `awaiting_client_approval` flag |
| 4 — Execution | Session status update only | Files already written to `src/forms/<Name>/` |
| 5 — Testing | Session status update only | Test files already written to `src/forms/<Name>/` |

### `/rjsf-status` skill (new)

A lightweight skill that shows the current session without starting anything:

```
$ /rjsf-status

Active session: LoanApplication
Started: 2026-05-26

  ✅ Phase 1 — Requirements   (completed 10:30)
  ✅ Phase 2 — Planning       (completed 11:00)
  ⏳ Phase 3 — Prototype      (awaiting client approval)
  ⬜ Phase 4 — Execution
  ⬜ Phase 5 — Testing

Run /rjsf-build to continue from Phase 3.
```

### Updated skills table

| Command | Role |
|---|---|
| `/rjsf-build` | Orchestrator — resumes or starts fresh |
| `/rjsf-status` | Show current session progress |
| `/rjsf-requirements` | Phase 1 |
| `/rjsf-plan` | Phase 2 |
| `/rjsf-prototype` | Phase 3 |
| `/rjsf-execute` | Phase 4 |
| `/rjsf-test` | Phase 5 |
| `/rjsf-iterate` | Modify an existing generated form |

### `.rjsf/` and `.gitignore`

The `.rjsf/` directory should be committed — it is the source of truth for the form's design decisions and enables team collaboration (another developer can open the same project and see the full history). The `prototype/` folder should also be committed so the prototype can be shared via a repository link.

---

## 11. What Is Out of Scope

- `$ref` / `$defs` schema references — resolve before passing requirements to the agent
- PDF/Word requirements files — convert to `.md` or plain text first
- Deployment or hosting of the generated form
- Backend API implementation for async option endpoints
- RJSF themes beyond `@rjsf/core`, `@rjsf/mui`, `@rjsf/antd`, `@rjsf/bootstrap` (community themes not covered)
