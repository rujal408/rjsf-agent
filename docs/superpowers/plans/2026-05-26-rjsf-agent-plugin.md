# RJSF Agent Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Claude Code plugin that converts client form requirements into a complete, production-ready RJSF implementation — schema, uiSchema, custom widgets/fields/templates, HTML prototype, and tests — through a guided 5-phase pipeline.

**Architecture:** Twelve SKILL.md files define the agent's behavior at each phase. Four reference documents give Claude the RJSF domain knowledge it needs. Session state is persisted to `.rjsf/session.json` in the developer's project so work survives Claude restarts. All output is previewed before any file is written.

**Tech Stack:** Claude Code plugin system (SKILL.md markdown files), JSON (plugin.json, session.json), Markdown (all reference and documentation files), `@rjsf/core` / `@rjsf/mui` / `@rjsf/antd` / `@rjsf/bootstrap` (target libraries in generated code), `@dnd-kit/core` (array reorder), `axe-core` (generated a11y tests).

---

## File Map

```
rjsf-agent/
├── plugin.json
├── README.md
├── references/
│   ├── rjsf-widget-api.md              # WidgetProps, FieldProps, all template interfaces
│   ├── rjsf-schema-patterns.md         # JSON Schema patterns + uiSchema examples
│   ├── customization-decision-tree.md  # Widget vs Field vs Template decision logic
│   └── layout-principles.md            # Column/section/widget layout heuristics
├── skills/
│   ├── rjsf/SKILL.md                   # Smart entry point + router
│   ├── rjsf-help/SKILL.md              # Contextual help
│   ├── rjsf-build/SKILL.md             # Orchestrator
│   ├── rjsf-status/SKILL.md            # Session status display
│   ├── rjsf-requirements/SKILL.md      # Phase 1
│   ├── rjsf-plan/SKILL.md              # Phase 2
│   ├── rjsf-prototype/SKILL.md         # Phase 3
│   ├── rjsf-execute/SKILL.md           # Phase 4
│   ├── rjsf-test/SKILL.md              # Phase 5
│   └── rjsf-iterate/SKILL.md           # On-demand iteration
└── docs/
    ├── getting-started.md
    ├── commands.md
    ├── requirements-guide.md
    ├── output-guide.md
    ├── customization.md
    ├── layout-guide.md
    ├── edge-cases.md
    └── examples/
        ├── loan-application.md
        ├── registration-form.md
        ├── dynamic-survey.md
        └── ecommerce-checkout.md
```

---

## Task 1: Plugin Manifest & Directory Scaffold

**Files:**
- Create: `rjsf-agent/plugin.json`
- Create all directories in the file map above (empty)

- [ ] **Step 1: Create plugin.json**

```json
{
  "name": "rjsf-agent",
  "version": "1.0.0",
  "description": "AI agent that converts client requirements into production-ready RJSF form implementations — schema, uiSchema, widgets, fields, templates, prototype, and tests.",
  "author": "rjsf-agent",
  "skills": [
    { "name": "rjsf",              "path": "skills/rjsf/SKILL.md",              "description": "Smart entry point — detects context and guides developer to the right command" },
    { "name": "rjsf-help",         "path": "skills/rjsf-help/SKILL.md",         "description": "Explain any rjsf-agent command or RJSF concept in plain English" },
    { "name": "rjsf-build",        "path": "skills/rjsf-build/SKILL.md",        "description": "Orchestrator — runs all 5 phases or resumes an existing session" },
    { "name": "rjsf-status",       "path": "skills/rjsf-status/SKILL.md",       "description": "Show current session progress at a glance" },
    { "name": "rjsf-requirements", "path": "skills/rjsf-requirements/SKILL.md", "description": "Phase 1 — gather and clarify client form requirements" },
    { "name": "rjsf-plan",         "path": "skills/rjsf-plan/SKILL.md",         "description": "Phase 2 — design form structure, layout, and identify custom components" },
    { "name": "rjsf-prototype",    "path": "skills/rjsf-prototype/SKILL.md",    "description": "Phase 3 — generate standalone HTML/JS prototype for client sign-off" },
    { "name": "rjsf-execute",      "path": "skills/rjsf-execute/SKILL.md",      "description": "Phase 4 — generate all React/RJSF code and write files" },
    { "name": "rjsf-test",         "path": "skills/rjsf-test/SKILL.md",         "description": "Phase 5 — generate tests for validation, conditionals, and submission" },
    { "name": "rjsf-iterate",      "path": "skills/rjsf-iterate/SKILL.md",      "description": "Modify an already-generated form without rerunning the full pipeline" }
  ]
}
```

- [ ] **Step 2: Create all directories**

```bash
mkdir -p rjsf-agent/skills/rjsf
mkdir -p rjsf-agent/skills/rjsf-help
mkdir -p rjsf-agent/skills/rjsf-build
mkdir -p rjsf-agent/skills/rjsf-status
mkdir -p rjsf-agent/skills/rjsf-requirements
mkdir -p rjsf-agent/skills/rjsf-plan
mkdir -p rjsf-agent/skills/rjsf-prototype
mkdir -p rjsf-agent/skills/rjsf-execute
mkdir -p rjsf-agent/skills/rjsf-test
mkdir -p rjsf-agent/skills/rjsf-iterate
mkdir -p rjsf-agent/references
mkdir -p rjsf-agent/docs/examples
```

- [ ] **Step 3: Verify structure**

```bash
find rjsf-agent -type d | sort
```
Expected: all 14 directories listed, no errors.

- [ ] **Step 4: Commit**

```bash
git init rjsf-agent
cd rjsf-agent
git add plugin.json
git commit -m "feat: add plugin manifest and directory scaffold"
```

---

## Task 2: Reference — RJSF Widget, Field & Template API

**Files:**
- Create: `references/rjsf-widget-api.md`

This document is loaded by Phase 3 and Phase 4 skills. It must cover every prop interface a developer would need to implement a custom widget, field, or template.

- [ ] **Step 1: Write references/rjsf-widget-api.md**

```markdown
# RJSF Widget, Field & Template API Reference

## Custom Widget — `WidgetProps`

A widget controls a single input. Register via `uiSchema["ui:widget"]`.

```typescript
import { WidgetProps } from '@rjsf/utils';

// All props your widget receives:
interface WidgetProps {
  id: string;           // Unique field ID for <label htmlFor>
  name: string;         // Field name
  value: unknown;       // Current field value
  required: boolean;    // Whether field is required
  disabled: boolean;    // Whether field is disabled
  readonly: boolean;    // Whether field is read-only
  autofocus: boolean;   // Whether to autofocus
  placeholder: string;  // Placeholder text from uiSchema
  label: string;        // Field label
  schema: RJSFSchema;   // The field's JSON Schema
  uiSchema: UiSchema;   // The field's uiSchema
  options: { [key: string]: boolean | number | string | object | unknown[] | null };
  formContext: object;  // Value of Form's formContext prop
  onChange: (value: unknown) => void;  // Call when value changes
  onBlur: (id: string, value: unknown) => void;
  onFocus: (id: string, value: unknown) => void;
  rawErrors?: string[]; // Validation error messages
}
```

**Minimal widget example:**
```tsx
import React from 'react';
import { WidgetProps } from '@rjsf/utils';

function PhoneWidget({ id, value, required, disabled, readonly, onChange, onBlur, onFocus, rawErrors }: WidgetProps) {
  return (
    <div>
      <input
        id={id}
        type="tel"
        value={value as string ?? ''}
        required={required}
        disabled={disabled || readonly}
        onChange={(e) => onChange(e.target.value)}
        onBlur={(e) => onBlur(id, e.target.value)}
        onFocus={(e) => onFocus(id, e.target.value)}
        aria-invalid={rawErrors && rawErrors.length > 0}
      />
      {rawErrors?.map((err, i) => <p key={i} role="alert">{err}</p>)}
    </div>
  );
}

export default PhoneWidget;
```

**Register in Form:**
```tsx
import Form from '@rjsf/core'; // or @rjsf/mui etc.
const widgets = { PhoneWidget };
<Form widgets={widgets} uiSchema={{ phone: { 'ui:widget': 'PhoneWidget' } }} ... />
```

---

## Custom Field — `FieldProps`

A field wraps label + one or more inputs + error display. Use when a single logical field needs multiple inputs or cross-field validation within itself. Register via `uiSchema["ui:field"]`.

```typescript
import { FieldProps } from '@rjsf/utils';

interface FieldProps {
  idSchema: IdSchema;     // { $id: string, [key]: IdSchema }
  name: string;
  schema: RJSFSchema;
  uiSchema: UiSchema;
  formData: unknown;
  required: boolean;
  disabled: boolean;
  readonly: boolean;
  autofocus: boolean;
  formContext: object;
  errorSchema: ErrorSchema;
  registry: Registry;     // Contains widgets, fields, templates, rootSchema, formContext
  onChange: (formData: unknown, errorSchema?: ErrorSchema, id?: string) => void;
  onBlur: (id: string, value: unknown) => void;
  onFocus: (id: string, value: unknown) => void;
}
```

**Minimal field example (DateRange — two date inputs under one label):**
```tsx
import React from 'react';
import { FieldProps } from '@rjsf/utils';

interface DateRangeValue { start: string; end: string; }

function DateRangeField({ idSchema, formData, onChange, errorSchema, disabled, readonly }: FieldProps) {
  const data = (formData as DateRangeValue) ?? { start: '', end: '' };
  const startError = (errorSchema?.start?.__errors ?? [])[0];
  const endError   = (errorSchema?.end?.__errors ?? [])[0];

  const update = (key: keyof DateRangeValue, value: string) => {
    const next = { ...data, [key]: value };
    const errors: Record<string, unknown> = {};
    if (next.start && next.end && next.end < next.start) {
      errors.end = { __errors: ['End date must be after start date'] };
    }
    onChange(next, Object.keys(errors).length ? errors : undefined);
  };

  return (
    <fieldset>
      <legend>Date Range</legend>
      <label htmlFor={`${idSchema.$id}-start`}>Start</label>
      <input id={`${idSchema.$id}-start`} type="date" value={data.start}
        disabled={disabled || readonly}
        onChange={(e) => update('start', e.target.value)} />
      {startError && <p role="alert">{startError}</p>}

      <label htmlFor={`${idSchema.$id}-end`}>End</label>
      <input id={`${idSchema.$id}-end`} type="date" value={data.end}
        disabled={disabled || readonly}
        onChange={(e) => update('end', e.target.value)} />
      {endError && <p role="alert">{endError}</p>}
    </fieldset>
  );
}

export default DateRangeField;
```

**Register in Form:**
```tsx
const fields = { DateRangeField };
<Form fields={fields} uiSchema={{ bookingDates: { 'ui:field': 'DateRangeField' } }} ... />
```

---

## Custom Templates

### `FieldTemplate` — wraps a single field (label + input + error)
```typescript
import { FieldTemplateProps } from '@rjsf/utils';
interface FieldTemplateProps {
  id: string; label: string; description?: React.ReactElement;
  rawDescription?: string; children: React.ReactElement;
  errors: React.ReactElement; help: React.ReactElement;
  hidden: boolean; required: boolean; readonly: boolean; disabled: boolean;
  displayLabel: boolean; classNames?: string; style?: object;
  schema: RJSFSchema; uiSchema: UiSchema; formContext: object;
}
```

### `ObjectFieldTemplate` — wraps an entire object/section
```typescript
import { ObjectFieldTemplateProps } from '@rjsf/utils';
interface ObjectFieldTemplateProps {
  title: string; description: string; properties: ObjectFieldTemplatePropertyType[];
  // properties[i].content  → rendered field React element
  // properties[i].name     → field key
  // properties[i].disabled, readonly, hidden
  required: boolean; disabled: boolean; readonly: boolean;
  uiSchema: UiSchema; schema: RJSFSchema; formContext: object;
  onAddClick: (schema: RJSFSchema) => (e: React.MouseEvent) => void;
  registry: Registry;
  idSchema: IdSchema;
}
```

### `ArrayFieldTemplate` — wraps an array field
```typescript
import { ArrayFieldTemplateProps } from '@rjsf/utils';
interface ArrayFieldTemplateProps {
  title: string; description: string;
  items: ArrayFieldTemplateItemType[];
  // items[i].children     → rendered item React element
  // items[i].index        → item index
  // items[i].hasMoveUp, hasMoveDown, hasRemove
  // items[i].onReorderClick(index, newIndex)
  // items[i].onDropIndexClick(index)
  canAdd: boolean;
  onAddClick: (e: React.MouseEvent) => void;
  readonly: boolean; disabled: boolean; required: boolean;
  uiSchema: UiSchema; schema: RJSFSchema; formContext: object; registry: Registry;
}
```

### `TitleFieldTemplate` and `DescriptionFieldTemplate`
```typescript
interface TitleFieldTemplateProps { id: string; title: string; required: boolean; schema: RJSFSchema; uiSchema: UiSchema; registry: Registry; }
interface DescriptionFieldTemplateProps { id: string; description: string | React.ReactElement; schema: RJSFSchema; uiSchema: UiSchema; registry: Registry; }
```

**Register all templates:**
```tsx
const templates = { FieldTemplate, ObjectFieldTemplate, ArrayFieldTemplate };
<Form templates={templates} ... />
```

---

## Per-Theme Import Differences

| Theme | Form import | Validator |
|---|---|---|
| `@rjsf/core` | `import Form from '@rjsf/core'` | `import validator from '@rjsf/validator-ajv8'` |
| `@rjsf/mui` | `import Form from '@rjsf/mui'` | same |
| `@rjsf/antd` | `import Form from '@rjsf/antd'` | same |
| `@rjsf/bootstrap` | `import Form from '@rjsf/react-bootstrap'` | same |

All themes accept identical props. Custom widgets/fields/templates are theme-agnostic.

---

## `customValidate` — Cross-Field Validation

```tsx
function customValidate(formData: Record<string, unknown>, errors: FormValidation) {
  if (formData.password !== formData.confirmPassword) {
    errors.confirmPassword?.addError('Must match password');
  }
  if (formData.endDate && formData.startDate && formData.endDate < formData.startDate) {
    errors.endDate?.addError('Must be after start date');
  }
  return errors;
}
<Form customValidate={customValidate} ... />
```

---

## Server-Side Error Mapping

```tsx
function handleServerErrors(
  serverErrors: Record<string, string>,
  setExtraErrors: React.Dispatch<React.SetStateAction<ErrorSchema>>
) {
  const errorSchema: ErrorSchema = {};
  for (const [field, message] of Object.entries(serverErrors)) {
    // Support nested paths: "address.city" → errorSchema.address.city.__errors
    const parts = field.split('.');
    let node: Record<string, unknown> = errorSchema;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) node[parts[i]] = {};
      node = node[parts[i]] as Record<string, unknown>;
    }
    node[parts[parts.length - 1]] = { __errors: [message] };
  }
  setExtraErrors(errorSchema);
}

// In Form component:
const [extraErrors, setExtraErrors] = React.useState<ErrorSchema>({});
const handleSubmit = async ({ formData }) => {
  try {
    await api.submit(formData);
  } catch (err) {
    handleServerErrors(err.fieldErrors, setExtraErrors);
  }
};
<Form extraErrors={extraErrors} onSubmit={handleSubmit} ... />
```
```

- [ ] **Step 2: Commit**

```bash
git add references/rjsf-widget-api.md
git commit -m "feat: add RJSF widget/field/template API reference"
```

---

## Task 3: Reference — Customization Decision Tree

**Files:**
- Create: `references/customization-decision-tree.md`

- [ ] **Step 1: Write references/customization-decision-tree.md**

```markdown
# RJSF Customization Decision Tree

Use this to decide whether a requirement needs a custom Widget, Field, or Template — or if standard RJSF handles it.

## Decision Flow

```
Does the requirement involve a SINGLE input control?
├── YES → Does the standard HTML input type cover it?
│         ├── YES → No customization needed (use uiSchema widget override)
│         └── NO  → Custom WIDGET
│                   Examples: phone + country code, star rating, color picker,
│                             masked input, autocomplete/search-as-you-type,
│                             rich text editor, signature pad
│
└── NO → Does it involve MULTIPLE inputs that share one label/error?
          ├── YES → Custom FIELD
          │         Examples: date range (start + end), address (street + city + country),
          │                   currency (amount + currency selector),
          │                   name (prefix + first + last)
          │
          └── NO → Does it affect the LAYOUT of a group of fields?
                    ├── YES → Custom TEMPLATE (ObjectFieldTemplate or ArrayFieldTemplate)
                    │         Examples: multi-step wizard, tab layout, accordion,
                    │                   2/3/4-column grid, custom array add/remove/reorder
                    │
                    └── NO → No customization needed
```

## Quick Reference

| Requirement | Type | Interface |
|---|---|---|
| Phone + country prefix | Widget | `WidgetProps` |
| Star / rating input | Widget | `WidgetProps` |
| Color picker | Widget | `WidgetProps` |
| Masked input (phone, card) | Widget | `WidgetProps` |
| Rich text / WYSIWYG | Widget | `WidgetProps` |
| Autocomplete / search-as-you-type | Widget | `WidgetProps` |
| File upload with server POST + progress | Widget | `WidgetProps` |
| Date range (start + end under one label) | Field | `FieldProps` |
| Address (multiple sub-fields, one error zone) | Field | `FieldProps` |
| Currency (amount + currency code) | Field | `FieldProps` |
| Multi-step wizard (Back/Next buttons) | Template | `ObjectFieldTemplateProps` |
| Tab layout (all sections accessible) | Template | `ObjectFieldTemplateProps` |
| Accordion sections | Template | `ObjectFieldTemplateProps` |
| Drag-reorder array items | Template | `ArrayFieldTemplateProps` |
| Custom add/remove buttons for arrays | Template | `ArrayFieldTemplateProps` |
| Custom label + error layout per field | Template | `FieldTemplateProps` |

## Nested Array Rule

RJSF supports one level of array nesting by default. If a requirement calls for arrays inside arrays (e.g., Work History → each job has a Skills array), generate a custom `ArrayFieldTemplate` that renders the inner array as a simple tag-input or comma-separated list to avoid deep nesting complexity.
```

- [ ] **Step 2: Commit**

```bash
git add references/customization-decision-tree.md
git commit -m "feat: add customization decision tree reference"
```

---

## Task 4: Reference — Schema Patterns & Layout Principles

**Files:**
- Create: `references/rjsf-schema-patterns.md`
- Create: `references/layout-principles.md`

- [ ] **Step 1: Write references/rjsf-schema-patterns.md**

```markdown
# RJSF Schema Patterns

## Field Type → JSON Schema mapping

| Widget | Schema type | Format | uiSchema hint |
|---|---|---|---|
| Text input | `string` | — | — |
| Email | `string` | `email` | — |
| Password | `string` | — | `ui:widget: password` |
| Textarea | `string` | — | `ui:widget: textarea` |
| Date | `string` | `date` | — |
| DateTime | `string` | `date-time` | — |
| Number | `number` | — | — |
| Integer | `integer` | — | — |
| Checkbox (single) | `boolean` | — | — |
| Select (single) | `string` + `enum` | — | — |
| Select (oneOf labels) | `string` + `oneOf[{const,title}]` | — | — |
| Radio group | `string` + `enum` | — | `ui:widget: radio` |
| Multi-select (checkboxes) | `array` + `items.enum` | — | `ui:widget: checkboxes` |
| Multi-select (dropdown) | `array` + `items.enum` | — | — |
| File upload (base64) | `string` | `data-url` | — |
| File upload (multiple) | `array` + `items.format: data-url` | — | — |
| Rich text | `string` | — | `ui:widget: RichTextWidget` |
| Masked input | `string` | — | `ui:widget: MaskedWidget` |

## Conditional Fields (if/then/else)

```json
{
  "if": { "properties": { "employmentType": { "const": "employed" } }, "required": ["employmentType"] },
  "then": { "properties": { "companyName": { "type": "string", "title": "Company Name" } }, "required": ["companyName"] },
  "else": { "properties": { "freelanceRate": { "type": "number", "title": "Daily Rate" } } }
}
```

## Cascading Select (dependencies + oneOf)

```json
{
  "properties": { "country": { "type": "string", "enum": ["np", "in"] } },
  "dependencies": {
    "country": {
      "oneOf": [
        { "properties": { "country": { "enum": ["np"] }, "province": { "type": "string", "enum": ["bagmati", "gandaki"] } } },
        { "properties": { "country": { "enum": ["in"] }, "province": { "type": "string", "enum": ["up", "mh"] } } }
      ]
    }
  }
}
```

## Array of Objects (repeating fieldset)

```json
{
  "contacts": {
    "type": "array",
    "title": "Contacts",
    "items": {
      "type": "object",
      "properties": {
        "name":  { "type": "string", "title": "Name" },
        "email": { "type": "string", "title": "Email", "format": "email" }
      },
      "required": ["name"]
    },
    "minItems": 1,
    "maxItems": 5
  }
}
```

## uiSchema — Common Patterns

```json
{
  "ui:order": ["firstName", "lastName", "*"],
  "firstName": { "ui:placeholder": "First name", "ui:autofocus": true },
  "bio":        { "ui:widget": "textarea", "ui:options": { "rows": 5 } },
  "role":       { "ui:widget": "radio", "ui:enumDisabled": ["admin"] },
  "avatar":     { "ui:widget": "file", "ui:options": { "accept": "image/*" } },
  "personal": {
    "ui:title": "Personal Information",
    "ui:order": ["firstName", "lastName", "dob"]
  }
}
```

## Multi-Step Schema Shape

Each step gets its own schema + uiSchema slice:

```typescript
const steps = [
  { key: 'personal',  title: 'Personal Info',  schema: personalSchema,  uiSchema: personalUiSchema },
  { key: 'contact',   title: 'Contact Details', schema: contactSchema,   uiSchema: contactUiSchema },
  { key: 'documents', title: 'Documents',       schema: docsSchema,      uiSchema: docsUiSchema },
];
```
```

- [ ] **Step 2: Write references/layout-principles.md**

```markdown
# Layout Principles for RJSF Forms

## Column Layout Heuristics

| Fields in section | Recommended columns |
|---|---|
| 1–2 fields | 1 column (full width) |
| 3–4 fields | 2 columns |
| 5–8 fields | 2 or 3 columns |
| 9+ fields | 3 or 4 columns |
| Mixed short + long fields | 2 columns, long fields span full width |

## Field Width by Type

| Field type | Typical width |
|---|---|
| Full name / address / description | Full width |
| First name / last name (paired) | Half width each |
| Email / phone / date / number | Half width |
| Textarea / rich text / file upload | Full width |
| Select / multi-select | Half to full width (depends on label length) |
| Checkbox / radio | Full width (easier to scan) |
| Short code / ZIP / postcode | Quarter width |

## Section Grouping Rules

1. **Group related fields** — personal info together, contact together, financial together
2. **Put identifying fields first** — name, ID, date of birth before secondary info
3. **Conditionally visible fields last within a section** — reduces layout shift
4. **Destructive / irreversible fields last** — confirmation, delete, submit at the bottom
5. **File uploads and signatures at the end** — users fill text fields first

## Layout Patterns by Form Type

| Form type | Recommended layout |
|---|---|
| Simple contact / enquiry (< 8 fields) | Single column, no sections |
| Registration / profile (8–20 fields) | 2-column sections, grouped |
| Application / onboarding (20+ fields) | Multi-step wizard, 2–3 columns per step |
| Settings / preferences | Tabs (all sections accessible at once) |
| Data entry / admin | 3–4 column grid, dense layout |
| Survey / questionnaire | Single column, one question per visual block |

## Widget Selection by Context

| Context | Preferred widget |
|---|---|
| 2–4 options | Radio group (all visible) |
| 5+ options | Select dropdown |
| Many options with search | Autocomplete |
| Binary yes/no | Checkbox or Toggle |
| Date in the past (DOB) | Date picker |
| Date in the future (booking) | Date picker with min=today |
| Long text (notes, description) | Textarea (min 3 rows) |
| Formatted text (policy, terms) | Rich text editor |
| Sensitive value | Password input |
| Numeric range | Slider/range if bounded, number input if unbounded |
```

- [ ] **Step 3: Commit**

```bash
git add references/rjsf-schema-patterns.md references/layout-principles.md
git commit -m "feat: add schema patterns and layout principles references"
```

---

## Task 5: Session Persistence — Shared Pattern

**Files:**
- Create: `references/session-pattern.md` (shared pattern embedded in all phase skills)

This document defines the exact session.json shape and read/write instructions used by every skill. Defining it once here ensures all skills are consistent.

- [ ] **Step 1: Write references/session-pattern.md**

```markdown
# Session Persistence — Shared Pattern

Every phase skill reads and writes `.rjsf/session.json` in the developer's current working directory.

## session.json Full Schema

```json
{
  "version": "1.0",
  "formName": "LoanApplication",
  "outputPath": "src/forms/LoanApplication",
  "rjsfTheme": "core",
  "stylingApproach": "css-modules",
  "currentPhase": 2,
  "phases": {
    "1": {
      "status": "completed",
      "completedAt": "2026-05-26T10:30:00Z",
      "artifactPath": ".rjsf/requirements-brief.md"
    },
    "2": {
      "status": "in_progress",
      "startedAt": "2026-05-26T11:00:00Z",
      "artifactPath": ".rjsf/form-plan.md"
    },
    "3": { "status": "pending" },
    "4": { "status": "pending" },
    "5": { "status": "pending" }
  }
}
```

## `status` values per phase

- `pending` — not started
- `in_progress` — started, not approved by developer
- `completed` — developer approved output
- `awaiting_client_approval` — Phase 3 only, prototype shared, waiting for client

## How to read the session at skill start

1. Check if `.rjsf/session.json` exists in the current directory.
2. If it exists, read it and show the developer the current state.
3. If `currentPhase` matches this skill's phase number and status is `in_progress`, resume from saved artifact.
4. If this skill's phase is `pending` and the previous phase is `completed`, proceed normally.
5. If this skill's phase is already `completed`, ask: "This phase is already done. Redo it or skip?"

## How to write the session after phase completion

1. Read current `.rjsf/session.json`.
2. Set `phases[N].status = "completed"` and `phases[N].completedAt = <ISO timestamp>`.
3. Set `currentPhase = N + 1`.
4. Write the updated JSON back to `.rjsf/session.json`.
5. Show the end-of-phase prompt (see each skill for exact wording).

## Artifact files

| Phase | Artifact path | Format |
|---|---|---|
| 1 | `.rjsf/requirements-brief.md` | Markdown — RequirementsBrief |
| 2 | `.rjsf/form-plan.md` | Markdown — FormPlan |
| 3 | `prototype/prototype.html` | Self-contained HTML |
| 4 | `src/forms/<FormName>/` | TypeScript + TSX files |
| 5 | `src/forms/<FormName>/<FormName>.test.tsx` | Vitest/Jest test file |

## `.rjsf/history/` archiving

When the developer chooses "start fresh" on an existing session:
1. Copy `.rjsf/session.json` to `.rjsf/history/<FormName>-<date>.json`
2. Copy `.rjsf/requirements-brief.md` to `.rjsf/history/<FormName>-<date>-requirements.md` (if exists)
3. Copy `.rjsf/form-plan.md` to `.rjsf/history/<FormName>-<date>-plan.md` (if exists)
4. Delete `.rjsf/session.json`, `.rjsf/requirements-brief.md`, `.rjsf/form-plan.md`
5. Start Phase 1 fresh.
```

- [ ] **Step 2: Commit**

```bash
git add references/session-pattern.md
git commit -m "feat: add session persistence shared pattern reference"
```

---

## Task 6: Phase 1 Skill — rjsf-requirements

**Files:**
- Create: `skills/rjsf-requirements/SKILL.md`

**Validation scenario:** Given input "Build a loan application form with: applicant name, DOB, employment type (employed/self-employed), monthly income. If employed, show company name.", the skill should produce a complete RequirementsBrief with edge case flags, save it to `.rjsf/requirements-brief.md`, and end with the next-step prompt.

- [ ] **Step 1: Write skills/rjsf-requirements/SKILL.md**

```markdown
# RJSF Requirements Gathering — Phase 1

Gather and clarify client form requirements. Produce a structured RequirementsBrief.

## Trigger
Invoked by `/rjsf-requirements` or by `/rjsf-build` as Phase 1.

## Step 1 — Read Session

Read `.rjsf/session.json` if it exists (see `references/session-pattern.md`).
- If Phase 1 is `completed`: show existing RequirementsBrief, ask "Use this or redo Phase 1?"
- If Phase 1 is `in_progress`: load `.rjsf/requirements-brief.md` and continue from where it left off.
- Otherwise: proceed.

## Step 2 — Read Input

Accept input in one of two ways:
- **Inline:** text after the command, e.g. `/rjsf-requirements "Build a loan form..."`
- **File:** `--from <path>` flag, e.g. `/rjsf-requirements --from requirements.md`. Read the file at that path.

If no input is provided, ask: "Please describe the form you want to build, or provide a requirements file path with `--from <path>`."

## Step 3 — Extract Structure

From the input, extract:
- Form title (infer from context if not stated)
- Form purpose and user persona (who fills this form?)
- Sections (top-level groupings of fields)
- Per field: name, type, required/optional, validation rules, options (for select/radio)
- Conditional logic (field A shows when field B has value X)
- Layout hints (any mentions of "side by side", "multi-step", "tabs", "accordion")

## Step 4 — Clarifying Questions

Ask ONE question at a time. Only ask about genuine ambiguities — do not ask about things clearly stated. Cover these topics (skip any that are already answered):

1. **RJSF theme:** "Which RJSF theme does your project use? @rjsf/core / @rjsf/mui / @rjsf/antd / @rjsf/bootstrap"
2. **Multi-step:** "Should this be a single-page form or a multi-step wizard?"
3. **Edit mode:** "Will this form be used to edit existing data, or only to create new records?"
4. **Draft/auto-save:** "Does the form need to save progress automatically (draft mode)?"
5. **Role-based fields:** "Do any fields show/hide based on who is filling the form (user role or permission)?"
6. **Async options:** "Do any dropdown options come from an API rather than being fixed values?"
7. **Async field validation:** "Does any field need to validate against an API on blur? (e.g. checking if a username is already taken)"
8. **Server error mapping:** "After submission, can the server return validation errors for specific fields?"
9. **Cross-field validation:** "Are there any rules where one field's validity depends on another? (e.g. end date must be after start date)"
10. **Nested arrays:** "Do any list fields contain sub-lists? (e.g. Work History where each job has a Skills list)"
11. **Computed fields:** "Are any field values automatically calculated from other fields? (e.g. total = quantity × price)"
12. **Array reorder:** "Do users need to reorder items in any list fields?"
13. **File upload pattern:** "Will uploaded files go to a server, or be encoded as base64 in the form data?"
14. **View mode:** "Does the form need a read-only view for displaying submitted data?"
15. **Tab layout:** "Should sections be shown as tabs (all accessible at once) rather than stacked?"
16. **i18n:** "Does the form need to support multiple languages?"
17. **Masked input:** "Do any fields need formatted input like phone numbers, credit cards, or IDs?"
18. **Rich text:** "Does any field need a rich text / WYSIWYG editor?"
19. **Print/export:** "Does the form need a print or PDF export action?"
20. **Accessibility:** "Are there specific accessibility requirements (screen reader, keyboard-only users)?"

## Step 5 — Produce RequirementsBrief

Format the RequirementsBrief as markdown with these sections:

```markdown
# Requirements Brief: <Form Title>

## Purpose
<One sentence: who fills this form and why.>

## RJSF Theme
<theme name>

## Sections & Fields

### <Section Name>
| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| <name> | <type> | Yes/No | <rules> | <any notes> |

## Conditional Logic
- Show `<fieldA>` when `<fieldB>` equals `<value>`
- Require `<fieldC>` when `<fieldD>` is not empty
(List all conditions found)

## Layout Intent
- Form type: single-page / multi-step / tabs
- <Any other layout notes from requirements>

## Edge Case Flags
- async_options: true/false — <which fields>
- cross_field_validation: true/false — <which rules>
- multi_step: true/false — <how many steps>
- edit_mode: true/false
- role_based: true/false — <which fields>
- draft_save: true/false
- async_field_validation: true/false — <which fields>
- server_error_mapping: true/false
- nested_arrays: true/false — <which fields>
- computed_fields: true/false — <which fields>
- array_reorder: true/false — <which arrays>
- file_upload_server: true/false
- view_mode: true/false
- tab_layout: true/false
- i18n: true/false — <languages>
- masked_input: true/false — <which fields>
- rich_text: true/false — <which fields>
- print_export: true/false
```

## Step 6 — Show and Save

1. Display the complete RequirementsBrief in the chat.
2. Ask: "Does this capture everything correctly? Any changes before we move to planning?"
3. On approval: write to `.rjsf/requirements-brief.md`.
4. Create/update `.rjsf/session.json`:
   - Set `formName` (derive from form title, PascalCase, no spaces)
   - Set `rjsfTheme` from the answer to clarifying question 1
   - Set `phases["1"].status = "completed"`, `completedAt = <now ISO>`
   - Set `phases["1"].artifactPath = ".rjsf/requirements-brief.md"`
   - Set `currentPhase = 2`

## Step 7 — End-of-Phase Prompt

> "Requirements captured and saved to `.rjsf/requirements-brief.md`.
>
> **Next step:** Run `/rjsf-plan` to design the form structure and layout, or `/rjsf-build` to continue automatically."
```

- [ ] **Step 2: Validate scenario mentally**

Given: "Build a loan application form: applicant name (text, required), DOB (date, required), employment type (select: employed/self-employed, required). If employed, show company name (text, required)."

Expected RequirementsBrief:
- Section: Applicant Details with 3 fields + 1 conditional
- Edge flags: cross_field_validation=false, multi_step=false, async_options=false
- Conditional: show `companyName` when `employmentType` equals `"employed"`
- Agent asks 4-5 clarifying questions for anything not mentioned

✓ The skill covers this scenario.

- [ ] **Step 3: Commit**

```bash
git add skills/rjsf-requirements/SKILL.md
git commit -m "feat: add rjsf-requirements Phase 1 skill"
```

---

## Task 7: Phase 2 Skill — rjsf-plan

**Files:**
- Create: `skills/rjsf-plan/SKILL.md`

**Validation scenario:** Given a RequirementsBrief with 3 sections and a multi-step flag, the skill should produce a FormPlan with column decisions, widget choices, a Step Map, and a Customization Assessment correctly identifying any custom components needed.

- [ ] **Step 1: Write skills/rjsf-plan/SKILL.md**

```markdown
# RJSF Form Planning — Phase 2

Design the complete form structure, layout, and identify custom components before any code is written.

## Trigger
Invoked by `/rjsf-plan` or by `/rjsf-build` as Phase 2.

## Step 1 — Read Session & Artifacts

1. Read `.rjsf/session.json`.
2. Read `.rjsf/requirements-brief.md` (RequirementsBrief from Phase 1).
3. Load `references/layout-principles.md` and `references/customization-decision-tree.md`.

If Phase 1 is not completed, tell the developer: "Phase 1 (Requirements) must be completed first. Run `/rjsf-requirements`."

## Step 2 — Ask Styling Preference (if not already set)

If `session.json` does not have a `stylingApproach` key, ask:
"Which styling approach should the generated components use?
A) CSS Modules (.module.css files)
B) Tailwind CSS utility classes
C) Plain CSS (single .css file)
D) No styles — bare structure only, I'll style it myself"

Save the answer to `session.json` as `stylingApproach`: `"css-modules"` / `"tailwind"` / `"plain-css"` / `"bare"`.

## Step 3 — Layout Decisions

For each section in the RequirementsBrief, decide:

**Columns:** Apply layout-principles.md heuristics:
- 1–2 fields → 1 column
- 3–4 fields → 2 columns
- 5+ fields → 3 columns
- If multi-step flag is true → each step gets its own section with the above rules

**Widget per field:** Apply schema-patterns.md widget table. Flag any field where:
- The standard widget is insufficient → mark for custom Widget
- Multiple inputs are needed under one label → mark for custom Field
- No standard schema type covers the requirement → explain what's needed

**uiSchema hints:** Assign `ui:order`, `ui:placeholder`, `ui:options`, `ui:help` where they add clarity.

## Step 4 — Customization Assessment

Produce this section for the FormPlan:

```markdown
## Customization Assessment

### Standard RJSF covers:
- List each field that needs no custom component

### Custom components needed:

#### Widgets (single input control)
| Component name | Field | Why standard is insufficient | RJSF API |
|---|---|---|---|
| PhoneWidget | phone | Needs country prefix + number input combined | WidgetProps |

#### Fields (multiple inputs under one label)
| Component name | Field | Why | RJSF API |
|---|---|---|---|
| DateRangeField | checkInOut | Two date pickers with cross-validation | FieldProps |

#### Templates (group layout)
| Component name | Scope | Why | RJSF API |
|---|---|---|---|
| WizardTemplate | ObjectFieldTemplate | 3-step form with Back/Next nav | ObjectFieldTemplateProps |
```

If no custom components are needed, write: "Standard RJSF covers all fields. No custom components required."

## Step 5 — Step Map (multi-step forms only)

If `multi_step: true` in the RequirementsBrief, produce:

```markdown
## Step Map

| Step | Key | Title | Fields | Validates on Next |
|---|---|---|---|---|
| 1 | personal | Personal Information | name, dob, gender | required fields only |
| 2 | employment | Employment Details | employmentType, companyName (conditional) | required + conditional |
| 3 | documents | Document Upload | idDocument, signature | file required |
```

## Step 6 — Async Fields Map (if async_options or async_field_validation)

```markdown
## Async Fields

| Field | Async type | Trigger | Endpoint hint |
|---|---|---|---|
| province | options from API | country value changes | GET /api/provinces?country={value} |
| username | field validation on blur | on blur | GET /api/users/check?username={value} |
```

## Step 7 — Produce FormPlan & Show

Assemble the full FormPlan as markdown with all sections above.

Display it in chat. Ask: "Does this plan look right? Any layout or component changes before we build the prototype?"

On approval:
1. Write to `.rjsf/form-plan.md`
2. Update `session.json`: `phases["2"].status = "completed"`, `currentPhase = 3`

## Step 8 — End-of-Phase Prompt

> "Form plan saved to `.rjsf/form-plan.md`.
>
> **Next step:** Run `/rjsf-prototype` to generate the client prototype, or `/rjsf-build` to continue automatically."
```

- [ ] **Step 2: Commit**

```bash
git add skills/rjsf-plan/SKILL.md
git commit -m "feat: add rjsf-plan Phase 2 skill"
```

---

## Task 8: Phase 3 Skill — rjsf-prototype

**Files:**
- Create: `skills/rjsf-prototype/SKILL.md`

**Validation scenario:** Given a FormPlan for a 2-section form with one conditional field, the skill generates a self-contained `prototype/prototype.html` that shows all fields in the correct column layout, with vanilla JS hide/show for the conditional field, and includes the Prototype Limitations Notice.

- [ ] **Step 1: Write skills/rjsf-prototype/SKILL.md**

```markdown
# RJSF Prototype Generation — Phase 3

Generate a self-contained HTML/JS prototype for client sign-off. No build step. No dependencies.

## Trigger
Invoked by `/rjsf-prototype` or by `/rjsf-build` as Phase 3.

## Step 1 — Read Session & Artifacts

1. Read `.rjsf/session.json`.
2. Read `.rjsf/form-plan.md`.
3. If Phase 2 is not completed: "Phase 2 (Planning) must be completed first. Run `/rjsf-plan`."

## Step 2 — Generate prototype/prototype.html

The file must be completely self-contained (no external CSS, no external JS, works when opened locally).

**HTML structure:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>[Form Title] — Prototype</title>
  <style>
    /* Inline CSS — minimal reset + grid layout */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; }
    .form-title { font-size: 1.5rem; font-weight: 700; margin-bottom: 24px; }
    .section { border: 1px solid #e0e0e0; border-radius: 8px; padding: 20px; margin-bottom: 24px; }
    .section-title { font-size: 1.1rem; font-weight: 600; margin-bottom: 16px; color: #333; }
    .grid-1 { display: grid; grid-template-columns: 1fr; gap: 16px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .grid-4 { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; }
    .col-full { grid-column: 1 / -1; }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label { font-size: 0.875rem; font-weight: 500; }
    .field .required { color: #dc2626; }
    .field input, .field select, .field textarea {
      padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 4px;
      font-size: 1rem; width: 100%;
    }
    .field .help { font-size: 0.75rem; color: #6b7280; }
    .hidden { display: none; }
    /* Multi-step */
    .step { display: none; }
    .step.active { display: block; }
    .step-nav { display: flex; justify-content: space-between; margin-top: 24px; }
    .step-indicator { display: flex; gap: 8px; margin-bottom: 24px; }
    .step-dot { width: 32px; height: 32px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 0.875rem; font-weight: 600; }
    .step-dot.active { background: #2563eb; color: white; }
    .step-dot.done { background: #16a34a; color: white; }
    button { padding: 10px 20px; background: #2563eb; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1rem; }
    button.secondary { background: #6b7280; }
    .data-summary { background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin-top: 24px; display: none; }
    .limitations { background: #fef3c7; border: 1px solid #fcd34d; border-radius: 8px; padding: 16px; margin-bottom: 24px; font-size: 0.875rem; }
    .limitations h3 { font-size: 0.9rem; font-weight: 600; margin-bottom: 8px; }
  </style>
</head>
<body>

  <!-- Prototype Limitations Notice -->
  <div class="limitations">
    <h3>⚠ Prototype — For Client Review Only</h3>
    <p><strong>This prototype accurately shows:</strong> layout, field types, section structure, conditional show/hide, step flow.</p>
    <p><strong>Simplified for prototype purposes:</strong> async option loading (static placeholder options shown), complex cross-field validation (not enforced), role-based field visibility (all fields shown), file upload (UI only, no actual upload).</p>
  </div>

  <h1 class="form-title">[Form Title]</h1>

  <form id="mainForm" novalidate>
    <!-- Generate sections based on FormPlan -->
    <!-- For single-page: render all sections -->
    <!-- For multi-step: wrap each section in .step div, add step indicator and Back/Next buttons -->

    <!-- EXAMPLE SECTION (replace with actual fields from FormPlan): -->
    <div class="section">
      <h2 class="section-title">Personal Information</h2>
      <div class="grid-2">
        <div class="field">
          <label for="firstName">First Name <span class="required">*</span></label>
          <input type="text" id="firstName" name="firstName" placeholder="Enter first name" required>
        </div>
        <div class="field">
          <label for="lastName">Last Name <span class="required">*</span></label>
          <input type="text" id="lastName" name="lastName" placeholder="Enter last name" required>
        </div>
        <!-- Add a field with id matching its key for JS targeting -->
      </div>
    </div>

    <!-- Submit / Nav buttons -->
    <div class="step-nav">
      <button type="submit">Submit</button>
    </div>
  </form>

  <!-- Data summary panel shown on submit -->
  <div class="data-summary" id="dataSummary">
    <h2>Form Submitted (Prototype)</h2>
    <pre id="dataSummaryContent"></pre>
  </div>

  <script>
    // Conditional field visibility
    // For each condition in FormPlan, add a listener:
    // document.getElementById('triggerField').addEventListener('change', function() {
    //   const dependent = document.getElementById('dependentField').closest('.field');
    //   dependent.classList.toggle('hidden', this.value !== 'expectedValue');
    // });

    // Multi-step navigation (if applicable)
    // let currentStep = 0;
    // const steps = document.querySelectorAll('.step');
    // function showStep(n) { steps.forEach((s, i) => s.classList.toggle('active', i === n)); }
    // showStep(0);

    // Submit handler — show data summary
    document.getElementById('mainForm').addEventListener('submit', function(e) {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(this));
      document.getElementById('dataSummary').style.display = 'block';
      document.getElementById('dataSummaryContent').textContent = JSON.stringify(data, null, 2);
      this.scrollIntoView({ behavior: 'smooth' });
      document.getElementById('dataSummary').scrollIntoView({ behavior: 'smooth' });
    });
  </script>
</body>
</html>
```

**Rendering rules for each field type from FormPlan:**

| Field type | HTML element |
|---|---|
| text, email, password, date, number | `<input type="...">` |
| textarea / rich text | `<textarea rows="4">` |
| select (single) | `<select>` with `<option>` per enum value |
| select (multi) | `<select multiple>` |
| radio | `<input type="radio">` group |
| checkbox (single) | `<input type="checkbox">` |
| checkbox group | Multiple `<input type="checkbox">` |
| file | `<input type="file">` |
| masked input | `<input type="text" placeholder="e.g. +977-98XXXXXXXX">` |
| async options | `<select>` with 2–3 placeholder options + note "(dynamic options in final form)" |

## Step 3 — Write File

Write to `prototype/prototype.html`.

Show the file path in chat: "Prototype written to `prototype/prototype.html`."

Update `session.json`:
- `phases["3"].status = "awaiting_client_approval"`
- `phases["3"].artifactPath = "prototype/prototype.html"`

## Step 4 — End-of-Phase Prompt

> "Prototype written to `prototype/prototype.html`. Open it in any browser to preview.
>
> **Share this file with your client.** Once they confirm the layout and fields are correct, come back and run `/rjsf-build` (or just say 'client approved') to proceed to implementation.
>
> The prototype limitations are noted at the top of the file so your client understands what's simplified."
```

- [ ] **Step 2: Commit**

```bash
git add skills/rjsf-prototype/SKILL.md
git commit -m "feat: add rjsf-prototype Phase 3 skill"
```

---

## Task 9: Phase 4 Skill — rjsf-execute

**Files:**
- Create: `skills/rjsf-execute/SKILL.md`

**Validation scenario:** Given a FormPlan with a phone field (needs PhoneWidget) and a multi-step flag, the skill generates schema.ts, uiSchema.ts, types.ts, index.tsx, widgets/PhoneWidget.tsx, and templates/WizardTemplate.tsx — shows full preview — then writes on confirmation.

- [ ] **Step 1: Write skills/rjsf-execute/SKILL.md**

```markdown
# RJSF Execution — Phase 4

Generate all React/RJSF code. Preview everything. Write files on confirmation.

## Trigger
Invoked by `/rjsf-execute` or by `/rjsf-build` as Phase 4.

## Step 1 — Read Session & Artifacts

1. Read `.rjsf/session.json`. Confirm `phases["3"].status` is `completed` or `awaiting_client_approval`.
2. Read `.rjsf/form-plan.md`.
3. Load `references/rjsf-widget-api.md`, `references/rjsf-schema-patterns.md`, `references/layout-principles.md`.
4. If Phase 3 is not completed: "Please confirm client approval of the prototype first. Once they approve, tell me 'client approved' to continue."

## Step 2 — Mark Client Approval

If the developer says "client approved" or "yes client approved" or similar, update `session.json`:
- `phases["3"].status = "completed"`, `completedAt = <now>`

## Step 3 — Generate Artifacts

Generate the following files based on FormPlan. Show each in chat with inline comments before writing any files.

### 3a. schema.ts

```typescript
// schema.ts — JSON Schema Draft-07
// Generated by rjsf-agent. Do not edit manually — use /rjsf-iterate to make changes.
import { RJSFSchema } from '@rjsf/utils';

export const schema: RJSFSchema = {
  title: '<Form Title>',
  type: 'object',
  required: [/* required field keys */],
  properties: {
    // One entry per field from FormPlan
    // For conditional fields: use if/then/else or dependencies
    // For sections: nested object with type: 'object'
  }
};
```

### 3b. uiSchema.ts

```typescript
// uiSchema.ts
import { UiSchema } from '@rjsf/utils';

export const uiSchema: UiSchema = {
  'ui:order': [/* field keys in display order */],
  // Per-field hints: placeholder, widget override, options, help text
};
```

### 3c. types.ts

```typescript
// types.ts — TypeScript interfaces derived from schema
// One interface per object section + root FormData interface

export interface FormData {
  // One property per field with correct TS type
}
```

### 3d. index.tsx

```tsx
// index.tsx — Form component
import React, { useState } from 'react';
import Form from '<theme-import>'; // e.g. '@rjsf/core' or '@rjsf/mui'
import validator from '@rjsf/validator-ajv8';
import { schema } from './schema';
import { uiSchema } from './uiSchema';
import type { FormData } from './types';

// Import custom components if any
// import { PhoneWidget } from './widgets/PhoneWidget';
// import { WizardTemplate } from './templates/WizardTemplate';

const widgets = { /* PhoneWidget, */ };
const fields  = { /* DateRangeField, */ };
const templates = { /* ObjectFieldTemplate: WizardTemplate, */ };

interface <FormName>Props {
  formData?: Partial<FormData>;           // Pre-populate for edit mode
  onSubmit: (data: FormData) => void;
  onError?: (errors: unknown) => void;
}

export function <FormName>({ formData, onSubmit, onError }: <FormName>Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [serverErrors, setServerErrors] = useState({});

  // customValidate — cross-field rules (add if cross_field_validation flag is true)
  // function customValidate(data, errors) { ... return errors; }

  const handleSubmit = async ({ formData: data }: { formData: FormData }) => {
    setStatus('loading');
    try {
      await onSubmit(data);
      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      if (err && typeof err === 'object' && 'fieldErrors' in err) {
        // Map server errors to fields
        const fieldErrors = (err as { fieldErrors: Record<string, string> }).fieldErrors;
        const errorSchema: Record<string, unknown> = {};
        for (const [field, msg] of Object.entries(fieldErrors)) {
          errorSchema[field] = { __errors: [msg] };
        }
        setServerErrors(errorSchema);
      }
      onError?.(err);
    }
  };

  if (status === 'success') return <div role="status">Form submitted successfully.</div>;

  return (
    <>
      {status === 'loading' && <div role="status" aria-live="polite">Submitting...</div>}
      {status === 'error'   && <div role="alert">Submission failed. Please check the errors below.</div>}
      <Form
        schema={schema}
        uiSchema={uiSchema}
        validator={validator}
        formData={formData}
        widgets={widgets}
        fields={fields}
        templates={templates}
        extraErrors={serverErrors}
        onSubmit={handleSubmit}
        // customValidate={customValidate}
      />
    </>
  );
}
```

### 3e. Custom widgets (one per item in Customization Assessment)

For each custom Widget, generate a file at `widgets/<ComponentName>.tsx` following the WidgetProps interface from `references/rjsf-widget-api.md`. Include inline comments.

### 3f. Custom fields (one per item in Customization Assessment)

For each custom Field, generate a file at `fields/<ComponentName>.tsx` following the FieldProps interface.

### 3g. Custom templates (one per item in Customization Assessment)

For each custom Template, generate a file at `templates/<ComponentName>.tsx` following the relevant template interface.

### 3h. Edge case handlers (based on flags in session.json / RequirementsBrief)

**async_options:** Generate fetch hook inside the relevant widget:
```typescript
const [options, setOptions] = useState<{value: string; label: string}[]>([]);
const [loading, setLoading] = useState(false);
useEffect(() => {
  setLoading(true);
  fetch(`/api/<endpoint>?<param>=${watchedValue}`)
    .then(r => r.json())
    .then(data => { setOptions(data); setLoading(false); })
    .catch(() => setLoading(false));
}, [watchedValue]);
```

**async_field_validation:** Generate debounced validator inside the widget:
```typescript
const [checking, setChecking] = useState(false);
const [asyncError, setAsyncError] = useState<string>('');
const debounceRef = useRef<ReturnType<typeof setTimeout>>();
const handleBlur = (id: string, value: unknown) => {
  clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(async () => {
    setChecking(true);
    const res = await fetch(`/api/check-<field>?value=${value}`);
    const { available } = await res.json();
    setAsyncError(available ? '' : '<Field> is already taken');
    setChecking(false);
  }, 400);
  onBlur(id, value);
};
```

**draft_save (localStorage):**
```typescript
const DRAFT_KEY = '<FormName>_draft';
// Load draft on mount
const [formData, setFormData] = useState<Partial<FormData>>(
  () => { try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}'); } catch { return {}; } }
);
// Save on every change
const handleChange = ({ formData: data }: { formData: unknown }) => {
  setFormData(data as Partial<FormData>);
  localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
};
```

**view_mode:** Generate `<FormName>View.tsx` companion:
```tsx
import type { FormData } from './types';
export function <FormName>View({ data }: { data: FormData }) {
  return (
    <dl>
      {/* One <dt>/<dd> pair per field */}
    </dl>
  );
}
```

**i18n:** Generate `translations.ts` with all string keys:
```typescript
export const en = {
  '<fieldKey>.label': '<Field Label>',
  '<fieldKey>.placeholder': '<Placeholder text>',
  '<fieldKey>.help': '<Help text>',
  // validation errors
  '<fieldKey>.required': 'This field is required',
};
export type TranslationKey = keyof typeof en;
```

**print_export:** Add to index.tsx:
```tsx
<button type="button" onClick={() => window.print()} className="print-trigger">
  Print / Export
</button>
```
And generate a `<FormName>.print.css`:
```css
@media print {
  .print-trigger { display: none; }
  button[type="submit"] { display: none; }
  input, select, textarea { border: none; box-shadow: none; }
}
```

**array_reorder:** Generate `templates/SortableArrayTemplate.tsx`:
```tsx
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ArrayFieldTemplateProps } from '@rjsf/utils';

export function SortableArrayTemplate({ items, canAdd, onAddClick, title }: ArrayFieldTemplateProps) {
  const ids = items.map((_, i) => String(i));
  return (
    <fieldset>
      <legend>{title}</legend>
      <DndContext collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (over && active.id !== over.id) {
            const from = Number(active.id);
            const to   = Number(over.id);
            items[from].onReorderClick(from, to)(new MouseEvent('click'));
          }
        }}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {items.map((item, i) => (
            <SortableItem key={i} id={String(i)} item={item} />
          ))}
        </SortableContext>
      </DndContext>
      {canAdd && <button type="button" onClick={onAddClick}>Add Item</button>}
    </fieldset>
  );
}

function SortableItem({ id, item }: { id: string; item: ArrayFieldTemplateProps['items'][0] }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }}>
      <span {...attributes} {...listeners} style={{ cursor: 'grab' }}>⠿</span>
      {item.children}
      {item.hasRemove && (
        <button type="button" onClick={item.onDropIndexClick(item.index)}>Remove</button>
      )}
    </div>
  );
}
```

## Step 4 — Full Preview

Show the complete file tree in chat:

```
Will write to src/forms/<FormName>/:
├── schema.ts
├── uiSchema.ts
├── types.ts
├── index.tsx
├── widgets/
│   └── PhoneWidget.tsx      (custom — phone + country prefix)
├── fields/
│   └── DateRangeField.tsx   (custom — start/end under one label)
└── templates/
    └── WizardTemplate.tsx   (custom — 3-step navigation)
```

Show each file's content in chat with syntax highlighting.

Ask: "Ready to write these files? Confirm the output path: `src/forms/<FormName>/` (or specify a different path)."

## Step 5 — Write Files

On confirmation, write all files to the confirmed path.

Update `session.json`:
- `phases["4"].status = "completed"`, `outputPath = "<confirmed path>"`
- `currentPhase = 5`

## Step 6 — End-of-Phase Prompt

> "Files written to `src/forms/<FormName>/`.
>
> **Next step:** Run `/rjsf-test` to generate tests, or import the form and start using it.
> To make changes later, run `/rjsf-iterate \"describe what to change\"`."
```

- [ ] **Step 2: Commit**

```bash
git add skills/rjsf-execute/SKILL.md
git commit -m "feat: add rjsf-execute Phase 4 skill"
```

---

## Task 10: Phase 5 Skill — rjsf-test

**Files:**
- Create: `skills/rjsf-test/SKILL.md`

**Validation scenario:** Given a generated form with a required field and one conditional field, the skill produces a test file with: required validation test, conditional visibility test, submit success test, submit error test, and an axe-core accessibility test.

- [ ] **Step 1: Write skills/rjsf-test/SKILL.md**

```markdown
# RJSF Test Generation — Phase 5

Generate tests covering validation, conditionals, submission, and accessibility.

## Trigger
Invoked by `/rjsf-test` or by `/rjsf-build` as Phase 5.

## Step 1 — Read Session & Generated Files

1. Read `.rjsf/session.json` and `.rjsf/form-plan.md`.
2. Read the generated `schema.ts` and `index.tsx` from `outputPath`.
3. If Phase 4 is not completed: "Phase 4 (Execution) must be completed first. Run `/rjsf-execute`."

## Step 2 — Generate Test File

Generate `src/forms/<FormName>/<FormName>.test.tsx`.

```typescript
// <FormName>.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { <FormName> } from './index';

expect.extend(toHaveNoViolations);

const noop = () => {};

// ─── Required Field Validation ──────────────────────────────────────────────
// For each required field from schema.ts:
describe('required field validation', () => {
  it('shows error when <fieldName> is empty on submit', async () => {
    render(<{FormName} onSubmit={noop} />);
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(await screen.findByText(/<fieldName>.*required/i)).toBeInTheDocument();
  });
});

// ─── Per-Field Validation Rules ──────────────────────────────────────────────
// For each field with minLength/maxLength/pattern/minimum/maximum:
describe('field validation rules', () => {
  it('shows error when <fieldName> is too short', async () => {
    render(<{FormName} onSubmit={noop} />);
    await userEvent.type(screen.getByLabelText(/<fieldLabel>/i), 'ab');
    await userEvent.tab();
    expect(await screen.findByText(/at least/i)).toBeInTheDocument();
  });
});

// ─── Conditional Field Visibility ────────────────────────────────────────────
// For each if/then condition in form-plan.md:
describe('conditional field visibility', () => {
  it('shows <dependentField> when <triggerField> equals <triggerValue>', async () => {
    render(<{FormName} onSubmit={noop} />);
    expect(screen.queryByLabelText(/<dependentFieldLabel>/i)).not.toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText(/<triggerFieldLabel>/i), '<triggerValue>');
    expect(await screen.findByLabelText(/<dependentFieldLabel>/i)).toBeInTheDocument();
  });

  it('hides <dependentField> when <triggerField> changes away from <triggerValue>', async () => {
    render(<{FormName} onSubmit={noop} />);
    await userEvent.selectOptions(screen.getByLabelText(/<triggerFieldLabel>/i), '<triggerValue>');
    await userEvent.selectOptions(screen.getByLabelText(/<triggerFieldLabel>/i), '<otherValue>');
    await waitFor(() => {
      expect(screen.queryByLabelText(/<dependentFieldLabel>/i)).not.toBeInTheDocument();
    });
  });
});

// ─── Cross-Field Validation (if cross_field_validation flag is true) ─────────
describe('cross-field validation', () => {
  it('shows error when <fieldB> violates constraint relative to <fieldA>', async () => {
    render(<{FormName} onSubmit={noop} />);
    await userEvent.type(screen.getByLabelText(/<fieldALabel>/i), '<valueA>');
    await userEvent.type(screen.getByLabelText(/<fieldBLabel>/i), '<invalidValueB>');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(await screen.findByText(/<cross-field error message>/i)).toBeInTheDocument();
  });
});

// ─── Cascading Select (if any) ───────────────────────────────────────────────
describe('cascading select', () => {
  it('resets child select when parent value changes', async () => {
    render(<{FormName} onSubmit={noop} />);
    await userEvent.selectOptions(screen.getByLabelText(/country/i), 'np');
    await userEvent.selectOptions(screen.getByLabelText(/province/i), 'bagmati');
    await userEvent.selectOptions(screen.getByLabelText(/country/i), 'in');
    await waitFor(() => {
      expect((screen.getByLabelText(/province/i) as HTMLSelectElement).value).toBe('');
    });
  });
});

// ─── Edit Mode Pre-population ────────────────────────────────────────────────
describe('edit mode', () => {
  it('pre-populates fields with provided formData', () => {
    const data = { <fieldName>: '<testValue>' /* add all fields */ };
    render(<{FormName} formData={data} onSubmit={noop} />);
    expect((screen.getByLabelText(/<fieldLabel>/i) as HTMLInputElement).value).toBe('<testValue>');
  });
});

// ─── Async Field Validation (if async_field_validation flag is true) ─────────
describe('async field validation', () => {
  it('shows error when API reports <fieldName> is taken', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ available: false })
    }) as jest.Mock;
    render(<{FormName} onSubmit={noop} />);
    const input = screen.getByLabelText(/<fieldLabel>/i);
    await userEvent.type(input, 'taken-value');
    fireEvent.blur(input);
    expect(await screen.findByText(/already taken/i)).toBeInTheDocument();
  });
});

// ─── Submission — Success ────────────────────────────────────────────────────
describe('form submission', () => {
  it('calls onSubmit with correct data shape when form is valid', async () => {
    const onSubmit = jest.fn();
    render(<{FormName} onSubmit={onSubmit} />);
    // Fill all required fields
    await userEvent.type(screen.getByLabelText(/<requiredFieldLabel>/i), '<validValue>');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({ <fieldName>: '<validValue>' })
      );
    });
  });

  it('does not call onSubmit when required fields are missing', async () => {
    const onSubmit = jest.fn();
    render(<{FormName} onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

// ─── Server Error Mapping ────────────────────────────────────────────────────
describe('server error mapping', () => {
  it('displays server errors on the correct fields', async () => {
    const onSubmit = jest.fn().mockRejectedValue({
      fieldErrors: { <fieldName>: '<Server error message>' }
    });
    render(<{FormName} onSubmit={onSubmit} />);
    await userEvent.type(screen.getByLabelText(/<requiredFieldLabel>/i), '<validValue>');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(await screen.findByText(/<Server error message>/i)).toBeInTheDocument();
  });
});

// ─── Multi-Step Navigation (if multi_step flag is true) ──────────────────────
describe('multi-step navigation', () => {
  it('validates current step before advancing to next', async () => {
    render(<{FormName} onSubmit={noop} />);
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(await screen.findByText(/<requiredFieldInStep1>.*required/i)).toBeInTheDocument();
    expect(screen.queryByText(/step 2/i)).not.toBeInTheDocument();
  });

  it('navigates back without losing values', async () => {
    render(<{FormName} onSubmit={noop} />);
    await userEvent.type(screen.getByLabelText(/<step1FieldLabel>/i), 'test value');
    await userEvent.click(screen.getByRole('button', { name: /next/i }));
    await userEvent.click(screen.getByRole('button', { name: /back/i }));
    expect((screen.getByLabelText(/<step1FieldLabel>/i) as HTMLInputElement).value).toBe('test value');
  });
});

// ─── Accessibility ───────────────────────────────────────────────────────────
describe('accessibility', () => {
  it('has no axe violations on initial render', async () => {
    const { container } = render(<{FormName} onSubmit={noop} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations when validation errors are shown', async () => {
    const { container } = render(<{FormName} onSubmit={noop} />);
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    await screen.findByRole('alert');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

**Include only the test blocks relevant to the form's edge case flags.** Skip blocks whose flag is false.

## Step 3 — Write File & Update Session

Write test file to `<outputPath>/<FormName>.test.tsx`.

Update `session.json`:
- `phases["5"].status = "completed"`, `completedAt = <now>`

## Step 4 — End-of-Phase Prompt

> "Tests written to `src/forms/<FormName>/<FormName>.test.tsx`.
>
> **Your form is complete.**
>
> - Run tests: `npx vitest src/forms/<FormName>` or `npx jest src/forms/<FormName>`
> - Make changes: `/rjsf-iterate \"describe what to change\"`
> - Build another form: `/rjsf-build \"describe new form\"`
> - Check status: `/rjsf-status`"
```

- [ ] **Step 2: Commit**

```bash
git add skills/rjsf-test/SKILL.md
git commit -m "feat: add rjsf-test Phase 5 skill"
```

---

## Task 11: rjsf-iterate Skill

**Files:**
- Create: `skills/rjsf-iterate/SKILL.md`

- [ ] **Step 1: Write skills/rjsf-iterate/SKILL.md**

```markdown
# RJSF Iterate — Modify Existing Form

Make targeted changes to an already-generated form without rerunning the full pipeline.

## Trigger
Invoked by `/rjsf-iterate "<description of change>"`.

## Step 1 — Read Session & Files

1. Read `.rjsf/session.json`. If Phase 4 is not completed: "No generated form found. Run `/rjsf-build` first."
2. Read all files in `outputPath` (schema.ts, uiSchema.ts, index.tsx, any custom components).
3. Read `.rjsf/form-plan.md`.

## Step 2 — Classify the Change

Determine which files and phases are affected:

| Change type | Affected files |
|---|---|
| Add/remove/rename a field | schema.ts, uiSchema.ts, types.ts, index.tsx (possibly), test file |
| Change field type or widget | schema.ts, uiSchema.ts, possibly a custom widget file |
| Change layout (columns, order) | uiSchema.ts |
| Add/modify conditional logic | schema.ts, test file |
| Add a new custom widget/field/template | new component file + uiSchema.ts/index.tsx |
| Change form from single-page to multi-step | schema.ts, uiSchema.ts, new template file, index.tsx |
| Add edge case (async validation, draft save, etc.) | index.tsx + possibly new files |

Explain to the developer: "I'll update these files: <list>. Here's what will change: <diff description>."

## Step 3 — Show Diff Preview

Show the complete before/after content for each affected file. Do NOT write yet.

Ask: "Make these changes? (yes / adjust)"

## Step 4 — Write Changes

On confirmation, write only the affected files.

Update `.rjsf/form-plan.md` to reflect the change (append a changelog entry).
Update `.rjsf/session.json`: add `"lastIterated": "<now ISO>"`.

## Step 5 — End-of-Phase Prompt

> "Changes applied to `src/forms/<FormName>/`.
>
> If you changed validation rules or conditional logic, re-run `/rjsf-test` to update the tests."
```

- [ ] **Step 2: Commit**

```bash
git add skills/rjsf-iterate/SKILL.md
git commit -m "feat: add rjsf-iterate skill"
```

---

## Task 12: rjsf-build Orchestrator Skill

**Files:**
- Create: `skills/rjsf-build/SKILL.md`

- [ ] **Step 1: Write skills/rjsf-build/SKILL.md**

```markdown
# RJSF Build — Orchestrator

Run all 5 phases in sequence, or resume an existing session.

## Trigger
`/rjsf-build "natural language requirements"` or `/rjsf-build --from <file>` or `/rjsf-build` alone.

## Step 1 — Check for Existing Session

Read `.rjsf/session.json` if it exists.

**If session exists and is incomplete:**
Show:
> "Found an active session for **<FormName>** (started <date>).
> Current phase: <currentPhase> — <phase name> (<status>).
>
> A) Resume from here
> B) Start fresh (current session will be archived)"

- On **A**: jump to the step for `currentPhase` (see routing below).
- On **B**: archive session (see `references/session-pattern.md`), then start Phase 1.

**If session exists and is fully completed (all phases "completed"):**
> "<FormName> was fully built on <date>.
> A) Iterate on it → describe your change and I'll run `/rjsf-iterate`
> B) Build a new form → provide requirements and I'll start Phase 1"

**If no session:** proceed to Phase 1.

## Step 2 — Detect Client Approval Signal

If the developer says "client approved" or "yes, proceed" or "continue" and `phases["3"].status` is `awaiting_client_approval`:
- Update `phases["3"].status = "completed"`, `currentPhase = 4`
- Proceed to Phase 4.

## Step 3 — Phase Routing

Run each phase in order by invoking the corresponding skill:

```
Phase 1 → invoke rjsf-requirements skill
         (pass inline text or --from file if provided)
         wait for developer to approve RequirementsBrief

Phase 2 → invoke rjsf-plan skill
         wait for developer to approve FormPlan

Phase 3 → invoke rjsf-prototype skill
         tell developer to share with client
         PAUSE — wait for developer to confirm client approval

Phase 4 → invoke rjsf-execute skill
         wait for developer to confirm file write

Phase 5 → invoke rjsf-test skill
         done
```

Between each phase, check `session.json` to confirm the previous phase is `completed` before proceeding.

If the developer says "stop here" at any point, acknowledge: "Paused at Phase <N>. Run `/rjsf-build` to continue when you're ready."
```

- [ ] **Step 2: Commit**

```bash
git add skills/rjsf-build/SKILL.md
git commit -m "feat: add rjsf-build orchestrator skill"
```

---

## Task 13: Discovery Skills — rjsf, rjsf-status, rjsf-help

**Files:**
- Create: `skills/rjsf/SKILL.md`
- Create: `skills/rjsf-status/SKILL.md`
- Create: `skills/rjsf-help/SKILL.md`

- [ ] **Step 1: Write skills/rjsf/SKILL.md**

```markdown
# RJSF — Smart Entry Point

Detect project context and guide the developer to the right command.

## Trigger
`/rjsf` with any input, or natural language like "I want to build a form", "continue", "where was I?"

## Step 1 — Read Session

Read `.rjsf/session.json` if it exists.

## Step 2 — Route by Context

**No session + input provided:**
→ Route to `/rjsf-build` with the input as requirements.

**No session + no input:**
> "Welcome to rjsf-agent! What would you like to do?
> A) Build a new form from requirements
> B) Modify an existing generated form → `/rjsf-iterate`
> C) Generate tests for an existing form → `/rjsf-test`
> D) See all commands → `/rjsf-help`"

**Session exists, incomplete:**
→ Show `/rjsf-status` output, then:
> "Run `/rjsf-build` to continue from Phase <N>, or tell me what you'd like to change."

**Session exists, completed:**
> "<FormName> is complete.
> - To change something: `/rjsf-iterate \"describe change\"`
> - To build a new form: `/rjsf-build \"describe new form\"`
> - To re-run tests: `/rjsf-test`"

## Natural Language Intent Map

| Developer says | Route to |
|---|---|
| "build a form", "create a form", "I need a form" | `/rjsf-build` |
| "continue", "resume", "where was I", "pick up where" | `/rjsf-build` (resume) |
| "change", "update", "modify", "add a field", "remove" | `/rjsf-iterate` |
| "client wants changes", "client feedback" | `/rjsf-iterate` |
| "tests", "generate tests", "write tests" | `/rjsf-test` |
| "prototype", "show client", "preview" | `/rjsf-prototype` |
| "help", "what can you do", "commands" | `/rjsf-help` |
| "status", "progress", "where are we" | `/rjsf-status` |
| "requirements file", "--from" | `/rjsf-build --from <file>` |
```

- [ ] **Step 2: Write skills/rjsf-status/SKILL.md**

```markdown
# RJSF Status — Session Progress

Show current session progress at a glance.

## Trigger
`/rjsf-status`

## Step 1 — Read Session

Read `.rjsf/session.json`.

If no session found:
> "No active session. Run `/rjsf-build` to start building a form."

## Step 2 — Display Progress

```
Active session: <FormName>
Theme: <rjsfTheme> | Styling: <stylingApproach>
Output: <outputPath>

  ✅ Phase 1 — Requirements     (completed <time>)
  ✅ Phase 2 — Planning          (completed <time>)
  ⏳ Phase 3 — Prototype         (awaiting client approval)
  ⬜ Phase 4 — Execution
  ⬜ Phase 5 — Testing

Run /rjsf-build to continue from Phase 3.
```

Status icons: ✅ completed · ⏳ in_progress or awaiting_client_approval · ⬜ pending

## Step 3 — Suggest Next Action

Always end with one clear suggestion:
- If phases all complete: "All done! Run `/rjsf-iterate` to make changes."
- If paused at Phase 3: "Share `prototype/prototype.html` with your client, then run `/rjsf-build` once they approve."
- Otherwise: "Run `/rjsf-build` to continue from Phase <N>."
```

- [ ] **Step 3: Write skills/rjsf-help/SKILL.md**

```markdown
# RJSF Help — Contextual Help

Answer questions about any rjsf-agent command or RJSF concept in plain English.

## Trigger
`/rjsf-help` or `/rjsf-help "<question or command name>"`

## No Input — List All Commands

If invoked with no argument, display:

```
rjsf-agent commands:

  /rjsf              Smart entry point — detects context and guides you
  /rjsf-build        Run the full pipeline (or resume where you left off)
  /rjsf-status       See your current session progress
  /rjsf-requirements Phase 1 — gather form requirements
  /rjsf-plan         Phase 2 — design structure and layout
  /rjsf-prototype    Phase 3 — generate HTML prototype for your client
  /rjsf-execute      Phase 4 — generate all React/RJSF code
  /rjsf-test         Phase 5 — generate tests
  /rjsf-iterate      Modify an already-generated form

For help on any command: /rjsf-help <command-name>
For help on concepts:    /rjsf-help "what is a custom widget?"
```

## With Input — Answer the Question

Match input against these topics and answer in plain English:

**Command help** (e.g. `/rjsf-help rjsf-plan`):
→ Explain what the command does, when to use it, what input it needs, what it produces.

**Concept help** — common questions and their answers:

| Question pattern | Answer summary |
|---|---|
| "what is a custom widget" | A React component that controls a single form input. Use when standard HTML inputs aren't enough — e.g. a phone number widget with country prefix. Implements WidgetProps from @rjsf/utils. |
| "when do I need a custom field" | When a single logical form field needs multiple inputs under one label, or when validation spans multiple inputs within that field. Implements FieldProps. |
| "when do I need a template" | When you need to change the layout of a group of fields — multi-step wizard, tabs, accordion, drag-reorder arrays. Implements ObjectFieldTemplateProps or ArrayFieldTemplateProps. |
| "what files get generated" | schema.ts (JSON Schema), uiSchema.ts (layout/widgets), types.ts (TypeScript types), index.tsx (Form component), plus custom component files in widgets/, fields/, templates/. |
| "how do I add async validation" | Phase 1 will ask if any field needs live API validation. If yes, Phase 4 generates a debounced validator widget. You provide the API endpoint URL. |
| "how do I handle server errors" | Phase 4 always generates a handleServerErrors() utility in index.tsx that maps backend field error keys to RJSF's extraErrors prop. |
| "what is a requirements file" | A .md or .txt file describing your form. See docs/requirements-guide.md for the template. Pass it with /rjsf-build --from requirements.md |
| "how do I resume" | Run /rjsf-build — it checks for an existing session automatically. |

Always end with: "Want me to run the relevant command now?"
```

- [ ] **Step 4: Commit**

```bash
git add skills/rjsf/SKILL.md skills/rjsf-status/SKILL.md skills/rjsf-help/SKILL.md
git commit -m "feat: add rjsf smart router, rjsf-status, and rjsf-help skills"
```

---

## Task 14: README & Getting Started

**Files:**
- Create: `README.md`
- Create: `docs/getting-started.md`

- [ ] **Step 1: Write README.md**

```markdown
# rjsf-agent

A Claude Code plugin that converts client form requirements into a complete RJSF implementation — JSON Schema, uiSchema, custom widgets/fields/templates, HTML prototype, and tests.

## Install

```bash
claude plugin install github:your-org/rjsf-agent
```

## Quick Start

```bash
# Don't know where to start?
/rjsf

# Build a form from a description
/rjsf-build "Build a loan application form: applicant name, DOB, employment type, monthly income"

# Build from a requirements file
/rjsf-build --from requirements.md

# Check progress on an existing session
/rjsf-status
```

## What You Get

```
src/forms/LoanApplication/
├── schema.ts          JSON Schema (typed)
├── uiSchema.ts        Layout + widget configuration
├── types.ts           TypeScript interfaces
├── index.tsx          Form component with submission states
├── widgets/           Custom widgets (if needed)
├── fields/            Custom fields (if needed)
├── templates/         Custom templates (if needed)
└── LoanApplication.test.tsx  Tests
```

Plus a `prototype/prototype.html` for client sign-off before any React code is written.

## Commands

| Command | Purpose |
|---|---|
| `/rjsf` | Smart entry — let the agent guide you |
| `/rjsf-build` | Full pipeline or resume existing session |
| `/rjsf-status` | See current progress |
| `/rjsf-iterate "change"` | Modify an existing form |
| `/rjsf-help` | Help on any command or concept |

## Documentation

- [Getting Started](docs/getting-started.md)
- [All Commands](docs/commands.md)
- [Writing Requirements](docs/requirements-guide.md)
- [Understanding Output](docs/output-guide.md)
- [Custom Widgets, Fields & Templates](docs/customization.md)
- [Edge Cases](docs/edge-cases.md)
- [Examples](docs/examples/)
```

- [ ] **Step 2: Write docs/getting-started.md**

```markdown
# Getting Started with rjsf-agent

## 1. Install the plugin

```bash
claude plugin install github:your-org/rjsf-agent
```

## 2. Open your project in Claude Code

Navigate to the project where you want to add a form.

## 3. Build your first form

Run one of these in Claude Code:

```bash
# Option A — describe the form directly
/rjsf-build "Build a contact form with: full name (required), email (required), phone (optional), message (textarea, required), preferred contact method (radio: email/phone)"

# Option B — point to a requirements file
/rjsf-build --from requirements.md
```

## 4. Answer clarifying questions

The agent will ask a few questions (one at a time):
- Which RJSF theme your project uses
- Whether the form is single-page or multi-step
- Whether any options come from an API
- And a few more depending on your requirements

## 5. Approve the plan

After gathering requirements, the agent shows you a FormPlan — the full design before any code is written. Review it and either approve or ask for changes.

## 6. Share the prototype with your client

The agent generates `prototype/prototype.html` — a standalone file you can open in any browser and email to your client. Once they approve the layout and fields, tell the agent "client approved" to proceed.

## 7. Review and write the code

The agent shows you every file it will generate before writing anything. Review them, then confirm to write to `src/forms/<FormName>/`.

## 8. Run tests

```bash
npx vitest src/forms/<FormName>
# or
npx jest src/forms/<FormName>
```

## Resuming after a break

If you close Claude and come back later, just run:

```bash
/rjsf-build
# or
/rjsf-status   (to see where you left off)
```

The agent remembers exactly where you were.

## Making changes later

```bash
/rjsf-iterate "add a company name field after employment type"
/rjsf-iterate "change the layout to 3 columns"
/rjsf-iterate "add async validation for the username field"
```
```

- [ ] **Step 3: Commit**

```bash
git add README.md docs/getting-started.md
git commit -m "docs: add README and getting-started guide"
```

---

## Task 15: Core Documentation Files

**Files:**
- Create: `docs/commands.md`
- Create: `docs/requirements-guide.md`
- Create: `docs/output-guide.md`
- Create: `docs/customization.md`
- Create: `docs/layout-guide.md`
- Create: `docs/edge-cases.md`

- [ ] **Step 1: Write docs/commands.md**

Write a full reference for every skill with: what it does, when to use it, syntax, what it produces, example, and common follow-up.

Cover all 10 commands: `/rjsf`, `/rjsf-help`, `/rjsf-build`, `/rjsf-status`, `/rjsf-requirements`, `/rjsf-plan`, `/rjsf-prototype`, `/rjsf-execute`, `/rjsf-test`, `/rjsf-iterate`.

For each command include a real example invocation and the expected output shape.

- [ ] **Step 2: Write docs/requirements-guide.md**

Include:
- Natural language tips: be specific about field types, required/optional, conditional rules
- Structured requirements file template:

```markdown
# Form Requirements: <Form Name>

## Purpose
Who fills this form and what happens after submission.

## Sections

### <Section Name>
- <Field name> (<type>, required/optional): <description, validation rules>
- ...

## Conditional Logic
- Show <field> when <other field> equals <value>
- Require <field> when <other field> is not empty

## Layout
- Form type: single-page / multi-step (<N> steps) / tabs
- <Any specific layout notes>

## Special Requirements
- [ ] Options for <field> come from API: <endpoint hint>
- [ ] Cross-field validation: <rule>
- [ ] File upload goes to server (not base64)
- [ ] Form needs read-only view mode
- [ ] Multi-language support: <languages>
- [ ] Draft / auto-save
- [ ] Print / export action
```

- [ ] **Step 3: Write docs/output-guide.md**

Explain every generated file:
- `schema.ts` — what JSON Schema is, why it's typed, how RJSF uses it
- `uiSchema.ts` — what uiSchema controls, key properties explained
- `types.ts` — how TypeScript types are derived from schema
- `index.tsx` — the Form component, props explained, how to import and use it
- `widgets/` — when this directory is created, how to add your own widgets
- `fields/` — when this directory is created, how custom fields differ from widgets
- `templates/` — when this directory is created, how templates control layout
- `<FormName>.test.tsx` — what each test block covers, how to run tests
- `prototype/prototype.html` — how to open it, what to share with clients
- `.rjsf/session.json` — what it tracks, why it's committed to git

- [ ] **Step 4: Write docs/customization.md**

Include the decision tree from `references/customization-decision-tree.md` reformatted for developers (with plain English explanations), plus:
- Walkthrough of building a simple PhoneWidget from scratch
- Walkthrough of building a DateRangeField
- Walkthrough of building a WizardTemplate
- How to register custom components with the Form
- How to request a specific component type: `/rjsf-execute --widget PhoneWidget`

- [ ] **Step 5: Write docs/layout-guide.md**

Adapt `references/layout-principles.md` for developers. Include:
- How the agent decides on columns, widget types, field order
- How to override layout decisions in your requirements or during `/rjsf-plan`
- Examples of 1-column, 2-column, 3-column form layouts as HTML mockups
- The `ui:order` pattern explained
- How tab layout differs from multi-step

- [ ] **Step 6: Write docs/edge-cases.md**

One section per edge case, each with:
- What it is
- When you need it
- How to tell the agent you need it (in requirements or clarifying question)
- What gets generated
- A code snippet of the key generated pattern

Cover all 15 edge cases from the spec.

- [ ] **Step 7: Commit**

```bash
git add docs/commands.md docs/requirements-guide.md docs/output-guide.md
git add docs/customization.md docs/layout-guide.md docs/edge-cases.md
git commit -m "docs: add all core documentation files"
```

---

## Task 16: Example Documentation

**Files:**
- Create: `docs/examples/loan-application.md`
- Create: `docs/examples/registration-form.md`
- Create: `docs/examples/dynamic-survey.md`
- Create: `docs/examples/ecommerce-checkout.md`

Each example must be end-to-end: the natural language requirements → the RequirementsBrief → the FormPlan (key decisions) → the generated `schema.ts` + `uiSchema.ts` → the generated `index.tsx` → the key test cases. No placeholders.

- [ ] **Step 1: Write docs/examples/loan-application.md**

Cover: multi-section form, conditional `companyName` (shows when `employmentType === 'employed'`), async validation for NID number, server error mapping. Show complete `schema.ts` and `uiSchema.ts` output.

- [ ] **Step 2: Write docs/examples/registration-form.md**

Cover: 2-section form, cascading country → province → city selects, cross-field validation (password === confirmPassword), edit mode. Show complete schema and uiSchema.

- [ ] **Step 3: Write docs/examples/dynamic-survey.md**

Cover: array of question objects, array item reorder, conditional sub-questions based on answer type. Show complete schema and the generated `SortableArrayTemplate`.

- [ ] **Step 4: Write docs/examples/ecommerce-checkout.md**

Cover: multi-step (3 steps), computed total field (quantity × price), file upload to server, i18n labels, print export. Show complete multi-step schema structure and Step Map.

- [ ] **Step 5: Commit**

```bash
git add docs/examples/
git commit -m "docs: add four end-to-end example walkthroughs"
```

---

## Task 17: End-to-End Validation

Manually validate that the full plugin works as intended by running through the loan application scenario.

- [ ] **Step 1: Install the plugin in a test project**

```bash
mkdir /tmp/rjsf-test-project && cd /tmp/rjsf-test-project
npm init -y
npm install @rjsf/core @rjsf/utils @rjsf/validator-ajv8
```

- [ ] **Step 2: Run Phase 1 — Requirements**

In Claude Code, invoke:
```
/rjsf-requirements "Build a loan application form: applicant full name (required), date of birth (required), employment type (select: employed/self-employed/unemployed, required). If employed, show company name (required) and monthly salary (number, required). If self-employed, show business name (required) and annual revenue (number)."
```

Expected: Agent asks 3–5 clarifying questions, then produces a RequirementsBrief with correct conditional logic map and edge case flags (multi_step=false, cross_field_validation=false, async_options=false).

Verify: `.rjsf/requirements-brief.md` is written, `.rjsf/session.json` shows Phase 1 completed.

- [ ] **Step 3: Run Phase 2 — Planning**

```
/rjsf-plan
```

Expected: Agent asks for styling preference, produces FormPlan with 2-column layout for the main section, Customization Assessment showing no custom components needed (standard RJSF if/then/else covers the conditional logic).

Verify: `.rjsf/form-plan.md` is written, `.rjsf/session.json` shows Phase 2 completed.

- [ ] **Step 4: Run Phase 3 — Prototype**

```
/rjsf-prototype
```

Expected: `prototype/prototype.html` is created. Open in browser: the form shows 2-column layout, employment type select, company name and salary fields hidden by default, revealed by JavaScript when "employed" is selected. Limitations notice is visible.

- [ ] **Step 5: Confirm and Run Phase 4 — Execution**

```
client approved
```

Expected: Agent generates `schema.ts` (with `dependencies` for conditional fields), `uiSchema.ts` (with `ui:order` and 2-column hints), `types.ts`, `index.tsx` (with handleServerErrors, loading/success/error states). Shows full file preview. On confirmation, files written to `src/forms/LoanApplication/`.

Verify: All files exist and TypeScript compiles (`npx tsc --noEmit`).

- [ ] **Step 6: Run Phase 5 — Tests**

```
/rjsf-test
```

Expected: `LoanApplication.test.tsx` generated with: required field tests for name/dob/employmentType, conditional visibility tests for companyName/monthlySalary, server error mapping test, submission tests, axe accessibility test.

- [ ] **Step 7: Verify /rjsf-status output**

```
/rjsf-status
```

Expected:
```
Active session: LoanApplication
  ✅ Phase 1 — Requirements   (completed)
  ✅ Phase 2 — Planning       (completed)
  ✅ Phase 3 — Prototype      (completed)
  ✅ Phase 4 — Execution      (completed)
  ✅ Phase 5 — Testing        (completed)
All done! Run /rjsf-iterate to make changes.
```

- [ ] **Step 8: Verify /rjsf-iterate**

```
/rjsf-iterate "add a phone number field (masked input) after full name"
```

Expected: Agent identifies `schema.ts`, `uiSchema.ts`, `types.ts`, and possibly a new `widgets/PhoneWidget.tsx` as affected files. Shows diff. On confirmation, writes changes.

- [ ] **Step 9: Commit final state**

```bash
git add .
git commit -m "feat: complete rjsf-agent plugin — all skills, references, and docs"
```

---

## Self-Review Checklist

- [x] **Spec coverage:** All 10 skills defined. All 15 edge cases handled in rjsf-execute. Session persistence in every phase skill. Routing in rjsf and rjsf-build. End-of-phase prompts in every phase skill.
- [x] **No placeholders:** Every SKILL.md contains actual workflow steps with real examples, real code, real formats.
- [x] **Type consistency:** `WidgetProps`, `FieldProps`, `ObjectFieldTemplateProps`, `ArrayFieldTemplateProps` used consistently across rjsf-widget-api.md and rjsf-execute. `FormData` type defined in types.ts and referenced in index.tsx. `session.json` shape defined once in session-pattern.md and referenced by all phase skills.
- [x] **Session keys consistent:** `phases["1"]` through `phases["5"]`, `rjsfTheme`, `stylingApproach`, `outputPath`, `formName` — same keys used in session-pattern.md and all skill steps.
