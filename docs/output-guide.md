# Understanding Generated Output

Every form the agent builds is placed under `src/forms/<FormName>/`. This guide explains what each generated file is, what it controls, how to use it, and when to edit it manually versus using `/rjsf-iterate`.

---

## File Overview

```
src/forms/ContactForm/
├── schema.ts                  JSON Schema (Draft-07, typed)
├── uiSchema.ts                Layout + widget configuration
├── types.ts                   TypeScript interfaces
├── index.tsx                  Form component
├── widgets/                   Custom input widgets (if needed)
│   └── PhoneWidget.tsx
├── fields/                    Custom fields (if needed)
│   └── DateRangeField.tsx
├── templates/                 Custom templates (if needed)
│   └── WizardTemplate.tsx
└── ContactForm.test.tsx       Test file
```

Plus:
```
prototype/
└── prototype.html             Standalone HTML prototype

.rjsf/
├── active-session             Points to the active form name
├── sessions/
│   └── ContactForm/
│       ├── session.json       Session state for this form
│       ├── requirements-brief.md  Phase 1 output
│       └── form-plan.md      Phase 2 output
└── history/                   Archived sessions
```

---

## `schema.ts`

**What it is:** The JSON Schema (Draft-07) definition for your form, typed as `RJSFSchema` from `@rjsf/utils`.

**What it controls:** RJSF uses the schema for two things simultaneously: validation (required fields, string lengths, patterns, number ranges) and field rendering (a `type: "string"` with `enum` renders as a select, a `type: "boolean"` renders as a checkbox). The schema also drives conditional logic via `if/then/else` keywords — RJSF evaluates these live and shows or hides fields as the user types.

**How to import/use it:**
```typescript
import { schema } from './schema';
// Pass it to the Form component:
<Form schema={schema} ... />
```

**When to edit manually:** Schema is the most stable output file. Edit it manually only for minor tweaks like adding a `description` string, tightening a `maxLength`, or adding a new `enum` value. For structural changes (new fields, new conditions, changing types), use `/rjsf-iterate` — it updates both `schema.ts` and `types.ts` together.

---

## `uiSchema.ts`

**What it is:** The UI Schema configuration, typed as `UiSchema` from `@rjsf/utils`. This file lives alongside the JSON Schema but is kept separate because it controls presentation, not data structure.

**What it controls:**
- `ui:order` — the display order of fields within a section (an array of field keys)
- `ui:widget` — override the default widget ("radio", "textarea", "password", "PhoneWidget")
- `ui:placeholder` — placeholder text shown in the input
- `ui:options` — arbitrary widget-specific options (rows for textarea, accept for file inputs, etc.)
- `ui:help` — help text displayed below the field
- `ui:field` — override the entire field rendering with a custom field component

**How to import/use it:**
```typescript
import { uiSchema } from './uiSchema';
<Form schema={schema} uiSchema={uiSchema} ... />
```

**When to edit manually:** This is the most common file to adjust directly. Layout changes (reordering fields, changing column spanning, adjusting placeholders and help text) are safe to make manually because the changes are isolated to this file. For bigger changes like swapping a widget type or adding a custom field, use `/rjsf-iterate` to keep the test file consistent.

---

## `types.ts`

**What it is:** TypeScript interfaces derived from the JSON Schema. The primary export is `FormData` (or `<FormName>Data`) — the typed shape of the form's value.

**What it controls:** Type safety throughout your component tree. When you pass `formData` as a prop or access `onSubmit`'s `formData` argument, this interface gives you autocompletion and compile-time checks.

**How to import/use it:**
```typescript
import type { ContactFormData } from './types';

// In your parent component:
const handleSubmit = (data: ContactFormData) => {
  // data.firstName, data.email, etc. are typed
};
```

**When to edit manually:** Rarely. The types are derived from the schema, so if you change the schema manually you need to update this file too — that is the main risk of editing schema directly. Always use `/rjsf-iterate` for field additions or removals so both files stay in sync.

---

## `index.tsx`

**What it is:** The main React component for the form. This is what you import and render in your application.

**What it controls:**
- The Form component with `schema`, `uiSchema`, `validator`, `widgets`, `fields`, `templates`, and `customValidate` wired together
- Submission state machine (`idle` → `submitting` → `success` / `error`)
- Server error mapping via the `extraErrors` prop and an `ErrorSchema` state variable
- The `onSubmit` and `onError` handler logic

**Props the generated component accepts:**

```typescript
interface ContactFormProps {
  // Optional initial data — used for edit mode
  formData?: Partial<ContactFormData>;
  // Called with validated form data when the user submits
  onSubmit: (data: ContactFormData) => Promise<void>;
  // Called when submit fails (either validation error or server rejection)
  onError?: (errors: unknown) => void;
}
```

**Submission states:** The component tracks state internally and shows loading feedback automatically:
```typescript
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
```

**Server error mapping:** If your `onSubmit` throws an object shaped as `{ fields: Record<string, string> }`, the component maps it to RJSF's `ErrorSchema` format and passes it via `extraErrors`. Each field-level error appears underneath the relevant input.

**How to import/use it:**
```typescript
import ContactForm from './ContactForm';

<ContactForm
  onSubmit={async (data) => {
    const response = await fetch('/api/contacts', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw err; // { fields: { email: "Already registered" } }
    }
  }}
/>
```

**When to edit manually:** Add submission-level UI (success banners, redirect logic, analytics events) directly in this file. For structural changes to the form itself, prefer `/rjsf-iterate`.

---

## `widgets/`

**What it is:** A directory of custom React components that replace a single HTML input control.

**When created:** Only when the FormPlan identifies a field that requires an input type not covered by RJSF's built-in widgets. Common examples: `PhoneWidget.tsx` (country code + number), `StarRatingWidget.tsx`, `MaskedInputWidget.tsx`.

**How it works:** Each widget implements the `WidgetProps` interface from `@rjsf/utils`. The widget is registered in `index.tsx` and referenced in `uiSchema.ts` via `"ui:widget": "PhoneWidget"`. See [Custom Widgets, Fields & Templates](customization.md) for a full walkthrough.

---

## `fields/`

**What it is:** A directory of custom React components that replace a whole field group — multiple inputs that share one schema property, label, and error display.

**When created:** When a single schema property maps to multiple inputs that must be rendered together. Common examples: `DateRangeField.tsx` (start date + end date under one label), `AddressField.tsx`, `CurrencyField.tsx`.

**How it works:** Each field implements the `FieldProps` interface from `@rjsf/utils`. Registered in `index.tsx` and referenced in `uiSchema.ts` via `"ui:field": "DateRangeField"`.

---

## `templates/`

**What it is:** A directory of custom React components that control the layout of a group of fields or the entire form structure.

**When created:** When the FormPlan calls for a non-default layout: multi-step wizard, tab layout, custom array item controls, or a specific grid arrangement that cannot be achieved with CSS alone.

**How it works:** Templates implement one of several interfaces from `@rjsf/utils`: `ObjectFieldTemplateProps` for section-level layout, `ArrayFieldTemplateProps` for array controls, `FieldTemplateProps` for individual field chrome. Registered in `index.tsx` via the `templates` prop on the `Form` component.

---

## `<FormName>.test.tsx`

**What it is:** A Vitest/Jest compatible test file for the form component.

**What each test block covers:**

| Test block | What it tests |
|---|---|
| "renders without errors" | Component mounts and passes axe-core accessibility scan |
| "required field validation" | Each required field shows an error when left blank on submit |
| "field-level validation" | minLength, maxLength, pattern, email format, number range rules |
| "conditional fields" | Fields appear/disappear correctly when controlling fields change |
| "successful submission" | onSubmit is called with correct typed data |
| "server error mapping" | Backend field errors appear under the correct fields |
| "multi-step navigation" | Back/Next work, fields on prior steps retain values (if multi-step) |
| "draft save" | Values survive a page reload via localStorage (if draft save enabled) |
| "async options" | Dropdown populates after mock API resolves (if async options present) |

**How to run:**
```bash
# Vitest
npx vitest src/forms/ContactForm

# Jest
npx jest src/forms/ContactForm

# Watch mode
npx vitest --watch src/forms/ContactForm
```

**When to edit manually:** Add test cases for business logic specific to your application (e.g., testing that a specific combination of field values triggers an analytics event). Do not remove the generated test cases — they cover the contract of the form.

---

## `prototype/prototype.html`

**What it is:** A self-contained, zero-dependency HTML file that renders the form visually.

**How to open it:** Double-click the file in your OS file explorer to open it in a browser. Or serve it: `npx serve prototype/`.

**What to share with clients:** Send this single file by email, Slack, or as a GitHub artifact. The client can open it in any browser with no installation. It shows the real column layout, field types, placeholder text, and conditional show/hide logic.

**Limitations notice:** The prototype includes a visible banner explaining:
- No real API calls (async dropdowns show placeholder options)
- No cross-field validation enforcement
- Submit button logs to the browser console rather than posting to a server

**When to edit manually:** Do not edit `prototype.html` directly. It is regenerated by `/rjsf-prototype`. If the client requests layout changes, update the requirements brief and regenerate.

---

## `.rjsf/sessions/{FormName}/session.json`

**What it is:** A JSON file that tracks the entire session state for a specific form — form name, output path, current phase, each phase's status and timestamps, and metadata flags for enabled edge cases. Each form has its own `session.json` inside its session directory.

> **Multi-session support:** The agent supports multiple form sessions simultaneously. Each form's data lives in `.rjsf/sessions/{FormName}/`. The `.rjsf/active-session` file contains the name of the currently active form. Use `/rjsf-new`, `/rjsf-switch`, `/rjsf-list`, and `/rjsf-delete` to manage sessions.

**What it tracks:**
```json
{
  "formName": "ContactForm",
  "outputPath": "src/forms/ContactForm",
  "currentPhase": 5,
  "phases": {
    "1": { "status": "completed", "completedAt": "2026-05-26T09:00:00Z" },
    "2": { "status": "completed", "completedAt": "2026-05-26T09:15:00Z" },
    "3": { "status": "completed", "completedAt": "2026-05-26T09:45:00Z" },
    "4": { "status": "completed", "completedAt": "2026-05-26T10:00:00Z" },
    "5": { "status": "completed", "completedAt": "2026-05-26T10:10:00Z" }
  },
  "edgeCaseFlags": {
    "asyncOptions": true,
    "serverErrorMapping": true,
    "multiStep": false
  }
}
```

**Whether to commit it to git:** You can commit session files for full traceability — they are clean JSON and markdown files with no secrets. Add `.rjsf/history/` to `.gitignore` to exclude archived sessions. If you prefer to keep session data local, add `.rjsf/` entirely to `.gitignore` and commit only the generated source files.

The companion files `requirements-brief.md` and `form-plan.md` inside each session directory are worth committing regardless — they document the design decisions behind each form.

---

## Import and Render Example

Once Phase 4 completes, you can use the form component anywhere in your application:

```typescript
import ContactForm from 'src/forms/ContactForm';
import type { ContactFormData } from 'src/forms/ContactForm/types';

export function ContactPage() {
  const handleSubmit = async (data: ContactFormData) => {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      // Throw a field-error object — the form component maps it to field-level errors
      const body = await res.json();
      throw { fields: body.errors }; // e.g. { fields: { email: "Already registered" } }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1>Contact Us</h1>
      <ContactForm onSubmit={handleSubmit} />
    </div>
  );
}
```

For edit mode (pre-populating the form from an existing record):
```typescript
import ContactForm from 'src/forms/ContactForm';

export function EditContactPage({ contactId }: { contactId: string }) {
  const { data } = useContact(contactId); // your data-fetching hook

  if (!data) return <Spinner />;

  return (
    <ContactForm
      formData={data}
      onSubmit={async (updated) => {
        await fetch(`/api/contact/${contactId}`, {
          method: 'PUT',
          body: JSON.stringify(updated),
        });
      }}
    />
  );
}
```
