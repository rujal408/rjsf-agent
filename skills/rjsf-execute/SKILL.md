---
name: rjsf-execute
description: Phase 4 — generate all React/RJSF code: schema.ts, uiSchema.ts, types.ts, index.tsx, and custom components
allowed-tools: [Read, Write, Edit, Glob, Bash]
---

# RJSF Execution — Phase 4

**Trigger:** `/rjsf-execute` — or invoked automatically by `/rjsf-build` as Phase 4.

---

## Step 1 — Read Session & Artifacts

1. Read `.rjsf/session.json`.
2. Confirm `phases["3"].status` is `"completed"` or `"awaiting_client_approval"`. If neither: stop and say: "Please confirm client approval of the prototype first. Once they approve, tell me 'client approved' to continue."
3. Read `.rjsf/form-plan.md` (FormPlan from Phase 2).
4. Read `.rjsf/requirements-brief.md` (or `.rjsf/enhanced-brief.md` if Phase 1.5 completed — needed for edge case flags).
5. Read `references/rjsf-widget-api.md` for WidgetProps, FieldProps, and template interfaces.
6. Read `references/rjsf-schema-patterns.md` for JSON Schema and uiSchema patterns.
6b. **Read `references/rjsf-type-contracts.md`** for canonical RJSF v5 type signatures. This is the **type authority** — every generated file MUST conform to the contracts in this reference. Violations cause TypeScript build errors.
6c. **Read `references/visual-parity-rules.md`** for mandatory visual styling rules. This is the **visual authority** — every generated form MUST include the base CSS overrides, custom ObjectFieldTemplate, enum humanization, and other rules listed there. Without these, the RJSF form will look nothing like the client-approved prototype.
6d. **Read `references/typescript-pitfalls.md`** for common TypeScript build errors and their fixes. Every code template in this skill has been verified against these patterns, but when adapting templates to specific forms, always follow the "GOOD" patterns from that reference. Key rules: always use `IChangeEvent<T>` for handlers, always null-check `formData`, always use `import type` for type-only imports, never use bare `WidgetProps`/`FieldProps` without generics.
7. **Read `references/validation-strategy.md`** for the validation approach. This is critical — it defines two distinct strategies:
    - **Strategy 1 (single-page):** Let JSON Schema + RJSF handle all validation natively. Generate zero custom validation code unless `cross_field_validation` or `async_field_validation` flags are true.
    - **Strategy 2 (multi-step wizard):** Split schema into per-step sub-schemas, use `formRef.current.validateForm()` for programmatic per-step validation on "Next" click, and handle cross-step validation in `handleSubmit`.
    Apply Strategy 1 when `multi_step: false`. Apply Strategy 2 when `multi_step: true`. Follow the decision tree in that reference exactly.
8. **Read `references/technical-defaults.md`** for the technical decision keys and defaults.
9. **Read `session.json → technicalChoices`** (from Phase 2.5). These are the developer's explicit technical decisions. For every decision key, use the value from `technicalChoices`. If a key is missing (legacy session or developer skipped Phase 2.5), use the default from `references/technical-defaults.md`. Apply these choices throughout code generation:
    - `schemaVersion` → JSON Schema `$schema` header
    - `validator` → import path (`@rjsf/validator-ajv8` or `@rjsf/validator-yup`)
    - `validationTiming` → `liveValidate` prop on Form
    - `html5Validation` → `noHtml5Validate` prop
    - `omitExtraData` → `omitExtraData` prop
    - `submissionPattern` → handleSubmit function pattern
    - `successBehavior` → post-submit UI behavior
    - `serverErrorShape` → error mapping function shape
    - `formWrapper` → wrapper div style / component
    - `breakpoints` → responsive CSS breakpoint values
    - `touchTargetSize` → min-height on interactive elements
    - `gridGap` → CSS grid gap values
    - `colorPalette` → border, focus, error, primary color values
    - `typeStyle` → TypeScript interface generation approach
    - `conditionalApproach` → if/then/else vs dependencies vs allOf
    - `formStateManagement` → useState vs Context vs external store
    - `formContextUsage` → whether to pass formContext prop
10. **Read `prototype/prototype.html`** (the approved client prototype from Phase 3). Use this as the **visual reference** for the generated React form. The generated React code must visually match it.
11. **Read the UI reference** (if `ui_reference` in the RequirementsBrief is not `none`). If a design file or image path was provided, read/view it and extract visual style cues: color scheme, spacing patterns, typography, component styles. Apply these to the generated form's CSS/styles. The UI reference takes precedence over the prototype for visual decisions where they differ. If the UI reference is a URL that cannot be fetched, note this in the file preview and ask the developer to describe the key visual elements.
12. **Extract custom components from FormPlan.** Parse the Customization Assessment section of `.rjsf/form-plan.md`. Build three lists:
    - `requiredWidgets`: component names from the "Widgets" table
    - `requiredFields`: component names from the "Fields" table
    - `requiredTemplates`: component names from the "Templates" table
    These lists drive which files to generate in Steps 4e–4g and which imports/registrations to include in `index.tsx`. Do NOT comment out these imports — include them actively. Do NOT include empty widget/field/template objects if the lists are empty.
13. **Verify Phase 1.5 choices propagated.** If `.rjsf/enhanced-brief.md` exists, cross-reference the Enhancement Choices section against the FormPlan's Customization Assessment. For each enhancement that specified a custom widget/field/template (e.g., "1B — PhoneWidget"), verify it appears in the requiredWidgets/requiredFields/requiredTemplates list. If any are missing, warn the developer: "Enhancement [N] chose [component] but it's not in the FormPlan. Adding it now." and include it in the generation.

---

## Step 2 — Mark Client Approval (if prototype was awaiting)

If `phases["3"].status` is `"awaiting_client_approval"` and the developer says "client approved", "yes", "approved", or similar:
- Set `phases["3"].status = "completed"`, `phases["3"].completedAt = <ISO timestamp>`.
- Write full session.json (not partial merge).
- Proceed to Step 3.

If `phases["3"].status` is already `"completed"`, skip this step.

---

## Step 3 — Visual Parity Check

**This step is CRITICAL.** RJSF's default rendering looks nothing like the prototype — labels are centered, layout is single-column, sections have no borders, radio buttons are vertical, enum labels show raw snake_case values. Without explicit overrides, the generated form will be ugly and unprofessional.

Before generating any code, read `references/visual-parity-rules.md` and apply ALL mandatory rules. Additionally, compare the prototype HTML (read in Step 1.10) against the FormPlan and extract these visual properties:

1. **Section styling** — border style, border-radius, padding, margin-bottom of `.section` elements
2. **Field spacing** — gap values in `.grid-*` classes, `.field` flex gap
3. **Typography** — font sizes for labels (`.875rem`), section titles (`1.1rem`), form title (`1.5rem`)
4. **Color palette** — border color (`#d1d5db`), label color (`#374151`), focus ring (`#2563eb`), error red (`#dc2626`)
5. **Input styling** — padding, border-radius, min-height (44px touch target), focus outline
6. **Button styling** — padding, border-radius, primary/secondary colors
7. **Overall wrapper** — max-width, centering, body padding
8. **Column layout per section** — which fields are side-by-side, which are full-width
9. **Radio/checkbox layout** — inline vs vertical per field
10. **Enum label format** — how options are displayed (Title Case, sentence case, etc.)

**Mandatory artifacts to generate (from visual-parity-rules.md):**

- **`rjsf-overrides.css`** (or equivalent for styling approach) — base CSS that fixes RJSF defaults: left-align labels, consistent spacing, proper input styling, error/help text formatting, button alignment. **Always generate this file.**
- **`templates/SectionTemplate.tsx`** — custom ObjectFieldTemplate with CSS grid layout matching the FormPlan's column spec per section. **Always generate this for any form with multi-column sections.** Add it to requiredTemplates even if the FormPlan's Customization Assessment didn't list one.
- **Enum humanization** — scan every `enum` field in the schema; if any value contains underscores, hyphens, or non-human-readable text, convert to `oneOf` with `title` in `schema.ts`.
- **Radio inline** — for every radio field with ≤5 options and short text (≤30 chars per option), set `'ui:options': { inline: true }` in `uiSchema.ts`.

When generating the React form's CSS/styles (in Step 5 below), **match these values from the prototype**. The generated form should look visually identical to the prototype when rendered in a browser. If a UI reference file was also provided (Step 1.11), use it for any visual decisions not covered by the prototype.

---

## Step 3b — Check for Missing Flags (Priority 4I)

Scan the RequirementsBrief for edge case flags that affect code generation. If ANY of the following flags are missing or ambiguous, ask the developer before proceeding — do NOT silently default:

| Flag | If missing, ask... |
|---|---|
| `error_display` | "How should validation errors be displayed? A) Inline below fields only (recommended). B) Top summary + inline. C) Top summary only." |
| `responsive` | "Should this form be responsive for mobile/tablet? A) Yes (mobile + tablet + desktop). B) Desktop only." |
| `edit_mode` | "Does this form need an edit mode (pre-populate from existing data)? A) Yes. B) No." |
| `draft_save` | "Should the form auto-save drafts to localStorage? A) Yes. B) No." |
| `server_error_mapping` | "Will your server return field-level errors after submission? A) Yes. B) No." |

Only ask about flags that are genuinely missing. If the flag exists with any value (even `false`), do not ask.

Wait for the developer's answers before proceeding to Step 4.

---

## Step 4 — Show Decisions Summary (Priority 4J)

Before generating any code, display a compact summary of ALL decisions that will affect the generated output:

```
## Decisions Applied to Code Generation

### From Phase 1 (Requirements)
| Decision | Value | Source |
|----------|-------|--------|
| RJSF theme | @rjsf/mui | Phase 1 Q1 |
| Form type | multi-step wizard | Phase 1 Q2 |
| Error display | inline only | Phase 1 Q22 / Step 3b |
| Edit mode | yes | Phase 1 Q3 |
| ... | ... | ... |

### From Phase 1.5 (Enhancements)
| Enhancement | Choice | RJSF Extension |
|-------------|--------|-----------------|
| Phone field | PhoneWidget | custom widget |
| Form layout | Wizard (3 steps) | custom template |
| ... | ... | ... |

### From Phase 2 (Planning)
| Decision | Value |
|----------|-------|
| Styling approach | mui-grid |
| Columns (Personal Info) | mobile:1 / tablet:2 / desktop:3 |
| ... | ... |

### From Phase 2.5 (Technical Choices)
| Decision | Value | Default? |
|----------|-------|----------|
| Schema version | Draft-07 | yes |
| Validator | ajv8 | yes |
| Validation timing | onSubmit | yes |
| HTML5 validation | disabled | changed |
| Submission pattern | async-loading | yes |
| Form wrapper | full-width | changed |
| ... | ... | ... |

### Custom Components to Generate
| Type | Component | For Field |
|------|-----------|-----------|
| Widget | PhoneWidget | phoneNumber |
| Field | DateRangeField | employmentDates |
| Template | WizardTemplate | form layout |
| Template | StepIndicator | wizard progress |
```

After the summary, ask:

> "This is what I'll generate. Approve to see the code preview, or change any decision."

Wait for approval before proceeding to Step 5.

---

## Step 5 — Generate Artifacts

Generate the following files based on the FormPlan, technical choices, and enhancement selections. Show each file's content in chat with inline comments BEFORE writing any files. Use the confirmed `outputPath` from session.json, or default to `src/forms/<FormName>/`.

### 5a. `schema.ts` — JSON Schema

```typescript
// schema.ts — JSON Schema Draft-07
// Generated by rjsf-agent. Use /rjsf-iterate to make changes.
import type { RJSFSchema } from '@rjsf/utils';

// Use explicit type annotation (: RJSFSchema) for type safety.
// See references/typescript-pitfalls.md § 3 for `satisfies` alternative.
export const schema: RJSFSchema = {
  title: '<Form Title from RequirementsBrief>',
  type: 'object',
  required: [/* array of required field keys */],
  properties: {
    // One entry per field from FormPlan.
    // For sections (nested groups), use:
    //   sectionKey: { type: 'object', title: '...', properties: { ... }, required: [...] }
    // For conditional fields (if/then/else):
    //   Use top-level if/then/else when the condition applies to one field.
    //   Use schema.dependencies for cascading selects (country → province).
    // For array fields:
    //   fieldKey: { type: 'array', items: { type: 'object', properties: { ... } }, minItems: 0 }
    //
    // IMPORTANT: For enum fields, ALWAYS use oneOf with title for human-readable labels:
    //   fieldKey: { type: 'string', oneOf: [{ const: 'value', title: 'Display Label' }] }
    //   See references/visual-parity-rules.md Rule 3.
  }
};
```

Apply the schema type mapping from `references/rjsf-schema-patterns.md` to every field in the FormPlan.

**Enum humanization (MANDATORY — see `references/visual-parity-rules.md` Rule 3):**
For every field with `enum` values, check if ANY value contains underscores, hyphens, camelCase, or abbreviations. If so, replace `enum` with `oneOf` using human-readable `title` values:

```typescript
// ❌ BAD — renders as "prefer_not_to_say" in the UI
gender: { type: 'string', enum: ['male', 'female', 'other', 'prefer_not_to_say'] }

// ✅ GOOD — renders as "Prefer not to say" in the UI
gender: {
  type: 'string',
  oneOf: [
    { const: 'male', title: 'Male' },
    { const: 'female', title: 'Female' },
    { const: 'other', title: 'Other' },
    { const: 'prefer_not_to_say', title: 'Prefer not to say' },
  ]
}
```

### 5b. `uiSchema.ts` — UI Schema

```typescript
// uiSchema.ts
import type { UiSchema } from '@rjsf/utils';
import type { <FormName>Data } from './types';

// Type the UiSchema with the form data type for key validation:
export const uiSchema: UiSchema<<FormName>Data> = {
  'ui:order': [/* field keys in display order from FormPlan */],
  // Per-field entries. Examples:
  // firstName:  { 'ui:placeholder': 'Enter first name', 'ui:autofocus': true },
  // bio:        { 'ui:widget': 'textarea', 'ui:options': { rows: 5 } },
  // role:       { 'ui:widget': 'radio' },
  // avatar:     { 'ui:widget': 'file', 'ui:options': { accept: 'image/*' } },
  // For custom widgets: fieldKey: { 'ui:widget': 'PhoneWidget' }
  // For custom fields:  fieldKey: { 'ui:field': 'DateRangeField' }
  // For custom templates: 'ui:ObjectFieldTemplate': WizardTemplate (set in index.tsx instead)
};
```

Assign `ui:order`, `ui:placeholder`, `ui:widget`, `ui:field`, `ui:options`, `ui:help` based on the FormPlan layout decisions and uiSchema hints columns.

**Radio inline (MANDATORY — see `references/visual-parity-rules.md` Rule 4):**
For every radio button field with ≤5 options where each option label is ≤30 characters, set `'ui:options': { inline: true }` to render horizontally. This matches the prototype layout.

```typescript
// ✅ Gender with 4 short options → inline
gender: { 'ui:widget': 'radio', 'ui:options': { inline: true } }
```

### 5c. `types.ts` — TypeScript Types

**CRITICAL: Derive types from schema, never independently.** Every property in `types.ts` must correspond 1:1 to a property in `schema.ts`. Follow the type mapping rules in `references/rjsf-type-contracts.md` § 9–10.

```typescript
// types.ts — TypeScript interfaces derived from schema
// Generated by rjsf-agent. Must match schema.ts properties 1:1.
//
// Rules enforced (see references/rjsf-type-contracts.md § 10):
// 1. Fields in schema `required` → non-optional. Others → `?` optional.
// 2. Enum fields → string literal union types, never bare `string`.
// 3. Conditional fields (if/then/else) → always optional (`?`).
// 4. Array items with type:'object' → dedicated exported interface.
// 5. Nested objects → dedicated exported interface.
// 6. number/integer → `number`. string → `string`. boolean → `boolean`.

export interface <FormName>Data {
  // One property per root-level schema property.
  // Required fields: no `?` suffix.
  // Optional fields: `?` suffix.
  // Enum fields: use string literal union, e.g., status: 'active' | 'inactive';
  // Conditional fields: always optional, e.g., companyName?: string;
  // Nested objects: reference sub-interface, e.g., address: AddressInfo;
  // Arrays: reference item interface, e.g., contacts: ContactItem[];
}

// One interface per nested object or array item:
export interface <SectionName> {
  // Properties matching the nested schema object 1:1
}

// One interface per array item type:
export interface <ArrayItemName> {
  // Properties matching items.properties 1:1
}
```

### 5d. `index.tsx` — Form Component

```tsx
// index.tsx — Main form component
import React, { useState } from 'react';
// Theme import — use value from session.json rjsfTheme:
// @rjsf/core → import Form from '@rjsf/core';
// @rjsf/mui  → import Form from '@rjsf/mui';
// @rjsf/antd → import Form from '@rjsf/antd';
// @rjsf/bootstrap → import Form from '@rjsf/bootstrap';
import Form from '<rjsf-theme-package>';
// Validator: use technicalChoices.validator to pick import
//   "ajv8" → import validator from '@rjsf/validator-ajv8';
//   "yup"  → import { customizeValidator } from '@rjsf/validator-yup';
import validator from '@rjsf/validator-ajv8';
import type { IChangeEvent, ErrorSchema } from '@rjsf/utils';
import { schema } from './schema';
import { uiSchema } from './uiSchema';
import type { <FormName>Data } from './types';
// Import custom components — auto-populated from FormPlan Customization Assessment.
// Only include imports for components in requiredWidgets/requiredFields/requiredTemplates (Step 1.12).
// Do NOT include commented-out imports for components that aren't needed.
// import { PhoneWidget } from './widgets/PhoneWidget';
// import { DateRangeField } from './fields/DateRangeField';
// import { WizardTemplate } from './templates/WizardTemplate';

// Register ONLY the custom components identified in the Customization Assessment.
// If no custom widgets/fields/templates are needed, omit the prop entirely from <Form>.
const widgets = {
  // e.g., phone: PhoneWidget — only if PhoneWidget is in requiredWidgets
};

const fields = {
  // e.g., dateRange: DateRangeField — only if DateRangeField is in requiredFields
};

const templates = {
  // e.g., ObjectFieldTemplate: WizardTemplate — only if WizardTemplate is in requiredTemplates
};

interface <FormName>Props {
  /** Pre-populated form data for edit mode. Pass undefined for create mode. */
  formData?: Partial<<FormName>Data>;
  onSubmit: (data: <FormName>Data) => void | Promise<void>;
  onError?: (errors: unknown) => void;
}

export function <FormName>({ formData, onSubmit, onError }: <FormName>Props) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  // Use ErrorSchema<FormDataType> for typed server error mapping (see rjsf-type-contracts.md § 7):
  const [serverErrors, setServerErrors] = useState<ErrorSchema<<FormName>Data>>({});

  // --- VALIDATION STRATEGY 1: Schema-Driven (single-page form) ---
  // JSON Schema handles: required fields, minLength/maxLength, pattern, format, min/max, enum.
  // Do NOT duplicate these rules in customValidate — it causes double error messages.
  //
  // ONLY add customValidate when cross_field_validation: true in RequirementsBrief:
  // import type { CustomValidator } from '@rjsf/utils';
  // const customValidate: CustomValidator<<FormName>Data> = (formData, errors) => {
  //   if (formData?.endDate && formData?.startDate && formData.endDate < formData.startDate) {
  //     errors.endDate!.addError('End date must be after start date');
  //   }
  //   return errors;
  // };

  // Use IChangeEvent<FormDataType> for typed submit handler:
  const handleSubmit = async (data: IChangeEvent<<FormName>Data>) => {
    if (!data.formData) return; // formData can be undefined in IChangeEvent
    const submittedData = data.formData;
    setStatus('loading');
    try {
      await onSubmit(submittedData);
      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      // Server error mapping: map field-level errors back to RJSF extraErrors
      if (err && typeof err === 'object' && 'fieldErrors' in err) {
        const fieldErrors = (err as { fieldErrors: Record<string, string> }).fieldErrors;
        const errorSchema: Record<string, { __errors: string[] }> = {};
        for (const [field, msg] of Object.entries(fieldErrors)) {
          // Support dot-notation paths: 'section.field' → errorSchema.section.field
          const parts = field.split('.');
          let target: Record<string, unknown> = errorSchema;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!target[parts[i]]) target[parts[i]] = {};
            target = target[parts[i]] as Record<string, unknown>;
          }
          (target as Record<string, { __errors: string[] }>)[parts[parts.length - 1]] = { __errors: [msg] };
        }
        setServerErrors(errorSchema);
      }
      onError?.(err);
    }
  };

  if (status === 'success') {
    return <div role="status" aria-live="polite">Form submitted successfully.</div>;
  }

  // Card wrapper — replace className with the variant matching session.json stylingApproach:
  //   tailwind:        className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md p-8"
  //   css-modules:     className={styles.formCard}  (add to FormGrid.module.css:
  //                      .formCard { max-width: 640px; margin: 0 auto; background: #fff;
  //                        border-radius: 12px; box-shadow: 0 2px 12px rgba(0,0,0,.1); padding: 32px; })
  //   plain-css/scss:  className="rjsf-form-card"   (add same rules to your stylesheet)
  //   mui-grid:        <Paper elevation={2} sx={{ p: 4, borderRadius: 2, maxWidth: 640, mx: 'auto' }}>
  //   antd-grid:       <Card style={{ maxWidth: 640, margin: '0 auto' }}>
  //   bootstrap-grid:  className="card p-4 shadow-sm mx-auto" style={{ maxWidth: 640 }}
  //   bare:            style={{ maxWidth: 640, margin: '0 auto', background: '#fff',
  //                      borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,.1)', padding: 32 }}
  //
  // VISUAL PARITY: Match the prototype's visual style. Read prototype/prototype.html
  // (loaded in Step 1) and replicate its section card styling, spacing, and layout
  // in the React output. The prototype's .section class (border, border-radius, padding),
  // .field spacing, and grid layout represent the client-approved design.
  return (
    <div className="rjsf-form-card">
      {status === 'loading' && <div role="status" aria-live="polite">Submitting…</div>}
      {status === 'error'   && <div role="alert" style={{ color: '#dc2626', marginBottom: 16 }}>Submission failed. Please check the errors below.</div>}
      {/* IMPORTANT: The submit button must live INSIDE <Form> (rendered by RJSF's default submit
          template or a custom template). Placing <button type="submit"> OUTSIDE <Form> bypasses
          RJSF validation entirely — required fields will not be checked on submit. */}
      {/* ALWAYS pass the form data type as a generic to Form for type safety: */}
      <Form<<FormName>Data>
        schema={schema}
        uiSchema={uiSchema}
        validator={validator}
        formData={formData}
        widgets={widgets}
        fields={fields}
        templates={templates}
        extraErrors={serverErrors}
        // --- Props driven by technicalChoices (Phase 2.5) ---
        // noHtml5Validate: technicalChoices.html5Validation === false → noHtml5Validate={true}
        noHtml5Validate={true}  // Set from technicalChoices.html5Validation
        // omitExtraData: technicalChoices.omitExtraData === true → omitExtraData={true}
        omitExtraData={false}  // Set from technicalChoices.omitExtraData
        // liveValidate: technicalChoices.validationTiming === "live" → liveValidate={true}
        // (omit prop if "onSubmit" or "onBlur")
        onSubmit={handleSubmit}
        // --- Error display: set from RequirementsBrief error_display flag ---
        //   "inline" → showErrorList={false}
        //   "both"   → showErrorList="top"
        //   "top"    → showErrorList="top" + custom FieldTemplate
        showErrorList={false}
        // customValidate — include ONLY if cross_field_validation: true
      />
    </div>
  );
}
```

### 5d-1. `rjsf-overrides.css` — Base CSS Overrides (MANDATORY)

**Always generate this file.** RJSF's default rendering has centered labels, no section borders, inconsistent spacing, and unstyled buttons. This stylesheet fixes all of these to match the prototype.

See `references/visual-parity-rules.md` Rule 2 for the full CSS content. Generate the stylesheet adapted to the project's styling approach:

- **`css-modules`** → `RjsfOverrides.module.css` imported in `index.tsx`
- **`plain-css`** → `rjsf-overrides.css` imported in `index.tsx`
- **`scss`** → `rjsf-overrides.scss` imported in `index.tsx`
- **`tailwind`** → Apply equivalent Tailwind classes directly in JSX (no separate file)
- **`mui-grid`** → Apply `sx` prop overrides on MUI components
- **`bare`** → Inline styles on wrapper elements

**Key overrides that MUST be included:**
1. Left-align all labels (`text-align: left`)
2. Consistent input sizing (min-height 44px, padding, border-radius)
3. Focus ring styling (blue outline)
4. Error field border (red)
5. Help text styling (small, gray)
6. Error message styling (small, red)
7. Button right-alignment
8. Section fieldset border + border-radius + padding

Import in `index.tsx`:
```tsx
import './rjsf-overrides.css';  // or the appropriate import for styling approach
```

### 5d-2. `templates/SectionTemplate.tsx` — Grid Layout Template (MANDATORY for multi-column forms)

**Always generate this for any form with 2+ column sections.** Add `ObjectFieldTemplate: SectionTemplate` to the Form's `templates` prop even if the FormPlan's Customization Assessment didn't list a custom ObjectFieldTemplate.

See `references/visual-parity-rules.md` Rule 1 for the full component code. The template must:
1. Read column count from a config object (populated from the FormPlan)
2. Render fields in a CSS grid with the correct column count
3. Support full-width fields that span all columns
4. Apply section card styling (border, border-radius, padding)
5. Render section title as a styled legend/heading
6. Be responsive (collapse to 1 column on mobile)

```tsx
// In index.tsx, always register:
const templates = {
  ObjectFieldTemplate: SectionTemplate,
  // ... other templates
};
```

---

### 5e. Custom Widgets

For each custom Widget listed in the FormPlan Customization Assessment, create `widgets/<ComponentName>.tsx` following the WidgetProps interface from `references/rjsf-widget-api.md`. Include full implementation — not a stub. Reference the PhoneWidget example in that file as a pattern for masked/compound inputs.

**Type safety requirements (see `references/rjsf-type-contracts.md`):**
- Import types: `import type { WidgetProps, RJSFSchema, FormContextType } from '@rjsf/utils';`
- Use typed props: `export function MyWidget(props: WidgetProps<<FormName>Data>) { ... }`
- NEVER use bare `WidgetProps` without the generic parameter.

### 5f. Custom Fields

For each custom Field listed in the Customization Assessment, create `fields/<ComponentName>.tsx` following the FieldProps interface. Include full implementation.

**Type safety requirements:**
- Import types: `import type { FieldProps } from '@rjsf/utils';`
- Use typed props with the field's data type: `export function DateRangeField(props: FieldProps<DateRange>) { ... }`
- Create and export a dedicated interface for the field's data shape.

### 5g. Custom Templates

For each custom Template listed in the Customization Assessment, create `templates/<ComponentName>.tsx` following the relevant template interface (ObjectFieldTemplateProps, ArrayFieldTemplateProps, or FieldTemplateProps).

**Type safety requirements:**
- Import types: `import type { ObjectFieldTemplateProps, RJSFSchema, FormContextType } from '@rjsf/utils';`  (or the relevant template props type)
- Use typed props: `export function MyTemplate(props: ObjectFieldTemplateProps<<FormName>Data>) { ... }`
- NEVER use bare template props without the generic parameter.

### 5h. Responsive Grid CSS

For every `ObjectFieldTemplate` generated (including section-level templates), emit responsive CSS using the column spec from the FormPlan. Use the approach that matches `session.json → stylingApproach`.

**`css-modules`** — create `FormGrid.module.css` alongside `index.tsx`:

```css
/* FormGrid.module.css — mobile-first responsive grid */
.grid { display: grid; gap: 16px 24px; }

/* Default: 1-column (mobile) */
.cols1, .cols2, .cols3, .cols4 { grid-template-columns: 1fr; }

/* Tablet: ≥640px */
@media (min-width: 640px) {
  .cols2 { grid-template-columns: repeat(2, 1fr); }
  .cols3 { grid-template-columns: repeat(2, 1fr); }
  .cols4 { grid-template-columns: repeat(2, 1fr); }
}

/* Desktop: ≥1024px */
@media (min-width: 1024px) {
  .cols3 { grid-template-columns: repeat(3, 1fr); }
  .cols4 { grid-template-columns: repeat(4, 1fr); }
}

.colFull { grid-column: 1 / -1; }

/* Touch targets: ensure interactive elements are ≥44px tall on all screen sizes */
input, select, textarea, button {
  min-height: 44px;
}
```

Import and use in templates:
```tsx
import styles from '../FormGrid.module.css';
// Apply: <div className={`${styles.grid} ${styles.cols2}`}>
// Full-width field: <div className={styles.colFull}>
```

**`tailwind`** — no separate stylesheet; use responsive utility classes in JSX:

```tsx
// Column count → Tailwind class map
const gridClass: Record<number, string> = {
  1: 'grid grid-cols-1 gap-4',
  2: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  3: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
  4: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4',
};
// Full-width field: add className="col-span-full"
// Touch targets are handled by the theme's base styles; verify min-h-[44px] on inputs/buttons.
```

**`plain-css`** — write the same rules as `css-modules` into `<FormName>.css` and import it in `index.tsx`.

**`bare`** — use `auto-fit` inline (no stylesheet required; collapses automatically):

```tsx
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px 24px' }}>
```

**`scss`** — same breakpoints as `css-modules` but using SCSS nesting. Create `FormGrid.module.scss`:

```scss
// FormGrid.module.scss — mobile-first
.grid {
  display: grid;
  gap: 16px 24px;
  grid-template-columns: 1fr; // mobile default

  &.cols2, &.cols3, &.cols4 {
    @media (min-width: 640px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  &.cols3 {
    @media (min-width: 1024px) {
      grid-template-columns: repeat(3, 1fr);
    }
  }
  &.cols4 {
    @media (min-width: 1024px) {
      grid-template-columns: repeat(4, 1fr);
    }
  }
}

.colFull { grid-column: 1 / -1; }

input, select, textarea, button { min-height: 44px; }
```

Import and use identically to the `css-modules` pattern: `import styles from '../FormGrid.module.scss'`.

**`mui-grid`** (`@rjsf/mui`) — use MUI's `Box` component with the `sx` breakpoint object. MUI breakpoints: `xs` = all screens (mobile default), `sm` = ≥600px (tablet), `lg` = ≥1200px (desktop):

```tsx
import Box from '@mui/material/Box';

// Column count from FormPlan → sx gridTemplateColumns map
const muiCols: Record<number, object> = {
  1: { xs: '1fr' },
  2: { xs: '1fr', sm: 'repeat(2, 1fr)' },
  3: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
  4: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
};

// Usage in ObjectFieldTemplate:
<Box sx={{ display: 'grid', gridTemplateColumns: muiCols[columns], gap: '16px 24px' }}>
  {properties.map((prop) => (
    <Box key={prop.name} sx={{ gridColumn: fullWidthFields.includes(prop.name) ? '1 / -1' : undefined }}>
      {prop.content}
    </Box>
  ))}
</Box>
```

Touch targets are handled by MUI's theme defaults — no extra `min-height` needed.

**`antd-grid`** (`@rjsf/antd`) — use Ant Design `Row` + `Col` with responsive span props. Ant Design span is out of 24:

```tsx
import { Row, Col } from 'antd';

// Column count from FormPlan → Col span values
// xs (mobile): always 24 (full width)
// sm (≥576px): 12 for 2-col, 12 for 3-col (falls back to 2-col at tablet)
// lg (≥992px): 12 for 2-col, 8 for 3-col, 6 for 4-col
const antdSpan: Record<number, { xs: number; sm: number; lg: number }> = {
  1: { xs: 24, sm: 24, lg: 24 },
  2: { xs: 24, sm: 12, lg: 12 },
  3: { xs: 24, sm: 12, lg: 8 },
  4: { xs: 24, sm: 12, lg: 6 },
};

// Usage in ObjectFieldTemplate:
<Row gutter={[16, 16]}>
  {properties.map((prop) => {
    const span = fullWidthFields.includes(prop.name)
      ? { xs: 24, sm: 24, lg: 24 }
      : antdSpan[columns];
    return (
      <Col key={prop.name} xs={span.xs} sm={span.sm} lg={span.lg}>
        {prop.content}
      </Col>
    );
  })}
</Row>
```

**`bootstrap-grid`** (`@rjsf/bootstrap`) — use Bootstrap responsive column classes. Bootstrap breakpoints: default (mobile) → `col-12`; `sm` = ≥576px; `lg` = ≥992px:

```tsx
// Column count from FormPlan → Bootstrap col class
const bsCols: Record<number, string> = {
  1: 'col-12',
  2: 'col-12 col-sm-6',
  3: 'col-12 col-sm-6 col-lg-4',
  4: 'col-12 col-sm-6 col-lg-3',
};

// Usage in ObjectFieldTemplate:
<div className="row g-3">
  {properties.map((prop) => (
    <div
      key={prop.name}
      className={fullWidthFields.includes(prop.name) ? 'col-12' : bsCols[columns]}
    >
      {prop.content}
    </div>
  ))}
</div>
```

**`chakra`** (Chakra UI with `@rjsf/core`) — use Chakra's `SimpleGrid` with a responsive `columns` array. Chakra breakpoints (default theme): `base` = mobile, `sm` = ≥480px, `md` = ≥768px, `lg` = ≥992px:

```tsx
import { SimpleGrid } from '@chakra-ui/react';

// Column count from FormPlan → Chakra responsive columns object
const chakraCols: Record<number, object> = {
  1: { base: 1 },
  2: { base: 1, md: 2 },
  3: { base: 1, md: 2, lg: 3 },
  4: { base: 1, md: 2, lg: 4 },
};

// Full-width fields: wrap in a Box with gridColumn="1 / -1"
import { Box } from '@chakra-ui/react';

// Usage in ObjectFieldTemplate:
<SimpleGrid columns={chakraCols[columns]} spacing={4}>
  {properties.map((prop) => (
    fullWidthFields.includes(prop.name)
      ? <Box key={prop.name} gridColumn="1 / -1">{prop.content}</Box>
      : <Box key={prop.name}>{prop.content}</Box>
  ))}
</SimpleGrid>
```

> Only generate `chakra` code when `stylingApproach === "chakra"` in session.json — the developer must have confirmed Chakra UI is a project dependency during Phase 2.

> Apply responsive rules only when `responsive: true` in the RequirementsBrief. If `responsive: false`, a single fixed column value is acceptable for all approaches.

---

### 5i. Error Display Configuration

Read the `error_display` flag from the RequirementsBrief. Configure the `<Form>` component's error behavior accordingly:

#### `error_display: "inline"` (default / recommended)

Set `showErrorList={false}` on the `<Form>` component. Errors appear only below each invalid field via RJSF's built-in FieldTemplate. This is the cleanest option and matches the prototype's visual style.

#### `error_display: "both"`

Set `showErrorList="top"` on the `<Form>` component (or omit the prop — this is RJSF's default). Errors appear both in a summary list at the top of the form AND below each invalid field. Use this only when the user explicitly requested it.

#### `error_display: "top"`

Set `showErrorList="top"` on the `<Form>` component AND generate a custom `FieldTemplate` that suppresses inline error rendering:

```tsx
// templates/CleanFieldTemplate.tsx — hides inline field errors (errors shown in top summary only)
import React from 'react';
import type { FieldTemplateProps, RJSFSchema, FormContextType } from '@rjsf/utils';

export function CleanFieldTemplate({
  id, label, required, children, errors, help, description, hidden,
}: FieldTemplateProps) {
  if (hidden) return <div style={{ display: 'none' }}>{children}</div>;
  return (
    <div className="field-wrapper">
      {label && (
        <label htmlFor={id}>
          {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
        </label>
      )}
      {description}
      {children}
      {/* Inline errors intentionally suppressed — shown in top ErrorList only */}
      {help}
    </div>
  );
}
```

Register in `index.tsx` templates: `FieldTemplate: CleanFieldTemplate`.

> **If `error_display` is absent in the RequirementsBrief**, default to `"inline"` (`showErrorList={false}`). This prevents the common complaint of duplicate error messages making the UI look messy.

---

### 5j. Edge Case Handlers

Apply ONLY the handlers whose flag is `true` in the RequirementsBrief Edge Case Flags. Skip all others.

---

#### `async_options: true`

Generate a fetch hook inside the relevant custom Widget (or wrap the field in a custom Widget if it doesn't already have one):

```typescript
const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
const [loadingOptions, setLoadingOptions] = useState(false);
const watchedValue = props.formContext?.<parentFieldKey>;

useEffect(() => {
  if (!watchedValue) return;
  const controller = new AbortController();
  setLoadingOptions(true);
  fetch(`/api/<endpoint>?<param>=${encodeURIComponent(watchedValue)}`, { signal: controller.signal })
    .then(r => r.json())
    .then((data: { value: string; label: string }[]) => {
      setOptions(data);
      setLoadingOptions(false);
    })
    .catch((err) => {
      if (err.name !== 'AbortError') setLoadingOptions(false);
    });
  return () => controller.abort();
}, [watchedValue]);
```

Pass the parent field's current value via `formContext` in the Form component.

---

#### `async_field_validation: true`

Add a debounced blur handler inside the relevant custom Widget:

```typescript
const [asyncError, setAsyncError] = useState('');
const debounceRef = useRef<ReturnType<typeof setTimeout>>();
useEffect(() => () => clearTimeout(debounceRef.current), []);

const handleBlur = (id: string, value: unknown) => {
  clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(async () => {
    try {
      const res = await fetch(`/api/check-<field>?value=${encodeURIComponent(String(value))}`);
      if (!res.ok) return;
      const { available } = await res.json();
      setAsyncError(available ? '' : '<Field> is already taken');
    } finally {
      // error state is set above; no additional action needed
    }
  }, 400);
  props.onBlur(id, value);
};
```

Render `{asyncError && <p role="alert">{asyncError}</p>}` below the input.

---

#### `draft_save: true`

Add localStorage draft persistence to `index.tsx`:

```typescript
const DRAFT_KEY = '<FormName>_draft';

// In the component body, replace the formData prop usage with:
const [localFormData, setLocalFormData] = useState<Partial<<FormName>Data>>(() => {
  try { return JSON.parse(localStorage.getItem(DRAFT_KEY) ?? '{}'); } catch { return {}; }
});
// Merge with any formData prop passed in (prop wins on conflict):
const mergedFormData = { ...localFormData, ...formData };

// Use IChangeEvent<T> — see references/typescript-pitfalls.md § 10
const handleChange = (event: IChangeEvent<<FormName>Data>) => {
  if (!event.formData) return;
  setLocalFormData(event.formData);
  // Guard against QuotaExceededError (e.g. large file uploads base64-encoded into form data).
  // Strategy: clear the stale draft and retry once; if still failing, skip silently so the
  // form remains fully usable — draft persistence is best-effort, not load-bearing.
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(event.formData));
  } catch (err) {
    if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
      try {
        localStorage.removeItem(DRAFT_KEY);
        localStorage.setItem(DRAFT_KEY, JSON.stringify(event.formData));
      } catch {
        console.warn('[rjsf-agent] Draft save skipped: localStorage unavailable or quota exceeded.');
      }
    }
  }
};
```

Add `onChange={handleChange} formData={mergedFormData}` to the `<Form>` component.

---

#### `view_mode: true`

Create a companion `<FormName>View.tsx` in the same output directory:

```tsx
// <FormName>View.tsx — read-only display of submitted form data
import React from 'react';
import type { <FormName>Data } from './types';

interface <FormName>ViewProps {
  data: <FormName>Data;
}

export function <FormName>View({ data }: <FormName>ViewProps) {
  return (
    // Mobile-first: single column by default; side-by-side label/value at ≥640px.
    // Use a className from FormGrid.module.css (or the equivalent for your styling approach)
    // instead of an inline gridTemplateColumns to support responsive breakpoints.
    // CSS Modules example: <dl className={`${styles.grid} ${styles.cols2}`}>
    // Tailwind example:    <dl className="grid grid-cols-1 sm:grid-cols-[max-content_1fr] gap-2 gap-x-6">
    // Bare (fallback):     gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
    <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px 24px' }}>
      {/* Generate one <dt>/<dd> pair per field from the FormPlan */}
      {/* Example: */}
      {/* <dt style={{ fontWeight: 500 }}>First Name</dt><dd>{data.firstName ?? '—'}</dd> */}
    </dl>
  );
}
```

---

#### `i18n: true`

Create `translations.ts` in the output directory:

```typescript
// translations.ts — All user-facing strings in the form
// Add one locale object per required language.
export const en: Record<string, string> = {
  // For each field from FormPlan:
  // '<fieldKey>.label': '<Field Label>',
  // '<fieldKey>.placeholder': '<Placeholder>',
  // '<fieldKey>.help': '<Help text>',
  // '<fieldKey>.required': 'This field is required',
  // '<fieldKey>.minLength': 'Must be at least {min} characters',
};

// Add additional locale objects (e.g. export const np = { ... }) per language from requirements.
export type TranslationKey = keyof typeof en;
```

---

#### `print_export: true`

Add a print button to `index.tsx`:

```tsx
<button type="button" onClick={() => window.print()} className="rjsf-print-trigger">
  Print / Export PDF
</button>
```

Create `<FormName>.print.css` alongside `index.tsx`:

```css
@media print {
  .rjsf-print-trigger { display: none; }
  button[type="submit"] { display: none; }
  input, select, textarea {
    border: none;
    box-shadow: none;
    -webkit-appearance: none;
  }
}
```

---

#### `array_reorder: true`

Create `templates/SortableArrayTemplate.tsx`:

```tsx
// templates/SortableArrayTemplate.tsx — drag-to-reorder array items
import React from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ArrayFieldTemplateProps, ArrayFieldTemplateItemType } from '@rjsf/utils';

export function SortableArrayTemplate({
  items,
  canAdd,
  onAddClick,
  title,
}: ArrayFieldTemplateProps) {
  const ids = items.map((_, i) => String(i));

  return (
    <fieldset>
      <legend>{title}</legend>
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={({ active, over }) => {
          if (over && active.id !== over.id) {
            const from = Number(active.id);
            const to   = Number(over.id);
            items[from].onReorderClick(from, to)(new MouseEvent('click'));
          }
        }}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {items.map((item, i) => (
            <SortableItem key={item.key} id={String(i)} item={item} />
          ))}
        </SortableContext>
      </DndContext>
      {canAdd && (
        <button type="button" onClick={onAddClick}>
          + Add Item
        </button>
      )}
    </fieldset>
  );
}

interface SortableItemProps {
  id: string;
  item: ArrayFieldTemplateProps['items'][0];
}

function SortableItem({ id, item }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}>
      <span
        {...attributes}
        {...listeners}
        style={{ cursor: 'grab', marginRight: 8, userSelect: 'none' }}
        aria-label="Drag to reorder"
      >
        ⠿
      </span>
      {item.children}
      {item.hasRemove && (
        <button type="button" onClick={item.onDropIndexClick(item.index)}>
          Remove
        </button>
      )}
    </div>
  );
}
```

Register in `index.tsx` templates: `ArrayFieldTemplate: SortableArrayTemplate`.

---

#### `nested_arrays: true`

For any array field whose items contain another array field, create `templates/FlatArrayTemplate.tsx`:

```tsx
// templates/FlatArrayTemplate.tsx — renders inner arrays as a simple comma-separated tag list
// to avoid deep nesting complexity in RJSF.
import React from 'react';
import type { ArrayFieldTemplateProps, ArrayFieldTemplateItemType } from '@rjsf/utils';

export function FlatArrayTemplate({ items, canAdd, onAddClick, title }: ArrayFieldTemplateProps) {
  return (
    <div>
      <strong>{title}</strong>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '8px 0' }}>
        {items.map((item, i) => (
          <span key={item.key} style={{ background: '#e5e7eb', padding: '2px 8px', borderRadius: 4 }}>
            {item.children}
            {item.hasRemove && (
              <button type="button" onClick={item.onDropIndexClick(item.index)} style={{ marginLeft: 4 }}>
                ×
              </button>
            )}
          </span>
        ))}
      </div>
      {canAdd && <button type="button" onClick={onAddClick}>+ Add</button>}
    </div>
  );
}
```

Apply this template to the inner array via uiSchema: `innerArrayKey: { 'ui:ArrayFieldTemplate': FlatArrayTemplate }`.

---

#### `computed_fields: true`

> **Note:** If both `draft_save` and `computed_fields` flags are true, merge their `handleChange` bodies into a single handler that both persists to localStorage AND computes derived values. Do not define two separate `handleChange` functions.

For each computed field identified in the FormPlan, add a `useEffect` to `index.tsx` that watches the source fields and updates the computed field value:

```typescript
// Computed field: <fieldKey> = <expression involving other fields>
// Use IChangeEvent<T> — see references/typescript-pitfalls.md § 11
const [currentFormData, setCurrentFormData] = useState<Partial<<FormName>Data>>(formData ?? {});

const handleChange = (event: IChangeEvent<<FormName>Data>) => {
  if (!event.formData) return;
  const updated = { ...event.formData };
  // Example: total = quantity * unitPrice
  if (typeof updated.quantity === 'number' && typeof updated.unitPrice === 'number') {
    (updated as <FormName>Data).total = updated.quantity * updated.unitPrice;
  }
  setCurrentFormData(updated);
};
```

Add `onChange={handleChange} formData={currentFormData}` to the `<Form>` component. Add `readonly: true` to the computed field's schema entry so RJSF renders it as non-editable.

---

#### `role_based: true`

Add a `role` prop to `index.tsx` and apply conditional uiSchema overrides:

```tsx
interface <FormName>Props {
  formData?: Partial<<FormName>Data>;
  onSubmit: (data: <FormName>Data) => void | Promise<void>;
  onError?: (errors: unknown) => void;
  /** User role — controls which fields are visible/editable */
  role?: string;
}

// Inside the component, compute role-based uiSchema overrides:
import type { UiSchema } from '@rjsf/utils';

const roleUiSchema = React.useMemo((): UiSchema<<FormName>Data> => {
  if (role === 'admin') return uiSchema;
  // Non-admin: hide admin-only fields
  return {
    ...uiSchema,
    adminNotes: { 'ui:widget': 'hidden' },
  };
}, [role]);
```

Pass `uiSchema={roleUiSchema}` to the Form component.

---

#### `masked_input: true`

For each masked field identified in the FormPlan (phone number, credit card, ID format), create a custom widget at `widgets/MaskedWidget.tsx`:

```tsx
// widgets/MaskedWidget.tsx — formatted input with a mask pattern
import React, { useRef } from 'react';
import type { WidgetProps, RJSFSchema, FormContextType } from '@rjsf/utils';

interface MaskedWidgetOptions {
  /** Mask pattern. Use '9' for digit, 'A' for letter, '*' for any. Example: '+977-99-9999999' */
  mask?: string;
  placeholder?: string;
}

export function MaskedWidget({ id, value, onChange, onBlur, onFocus, disabled, readonly, options, label, required, rawErrors }: WidgetProps) {
  const opts = options as MaskedWidgetOptions;
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strip non-digit/letter characters to get clean value for schema
    const cleaned = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
    onChange(cleaned === '' ? undefined : cleaned);
  };

  return (
    <div>
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={typeof value === 'string' ? value : ''}
        placeholder={opts.placeholder ?? opts.mask ?? ''}
        disabled={disabled}
        readOnly={readonly}
        onChange={handleChange}
        onBlur={(e) => onBlur(id, e.target.value)}
        onFocus={(e) => onFocus(id, e.target.value)}
        aria-required={required}
        aria-invalid={rawErrors && rawErrors.length > 0}
      />
      {rawErrors?.map((err, i) => (
        <p key={i} role="alert" style={{ color: '#dc2626', fontSize: '0.875rem' }}>{err}</p>
      ))}
    </div>
  );
}
```

Register in `index.tsx`: `widgets: { MaskedWidget }`.
Configure in uiSchema: `fieldKey: { 'ui:widget': 'MaskedWidget', 'ui:options': { mask: '+977-99-9999999' } }`.

---

#### `rich_text: true`

For each rich text field, create `widgets/RichTextWidget.tsx`:

```tsx
// widgets/RichTextWidget.tsx — WYSIWYG editor wrapper
// NOTE: Install a rich text library before use. This uses a basic contentEditable approach.
// For production, replace with a proper library (e.g. @tiptap/react, react-quill).
import React from 'react';
import type { WidgetProps, RJSFSchema, FormContextType } from '@rjsf/utils';

export function RichTextWidget({ id, value, onChange, onBlur, disabled, readonly, label, required, rawErrors }: WidgetProps) {
  return (
    <div>
      <div
        id={id}
        contentEditable={!disabled && !readonly}
        suppressContentEditableWarning
        role="textbox"
        aria-label={label}
        aria-required={required}
        aria-multiline="true"
        style={{
          minHeight: 120,
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: 6,
          fontFamily: 'inherit',
        }}
        // SECURITY: sanitize value before rendering to prevent XSS.
        // Install DOMPurify: npm install dompurify @types/dompurify
        // Then: import DOMPurify from 'dompurify'; and use DOMPurify.sanitize(value)
        dangerouslySetInnerHTML={{ __html: typeof value === 'string' ? value : '' /* TODO: wrap with DOMPurify.sanitize() */ }}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        onBlur={(e) => onBlur(id, (e.target as HTMLDivElement).innerHTML)}
      />
      {rawErrors?.map((err, i) => (
        <p key={i} role="alert" style={{ color: '#dc2626', fontSize: '0.875rem' }}>{err}</p>
      ))}
      <p style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: 4 }}>
        Rich text editor — for production, replace RichTextWidget with a full library (Tiptap, Quill, etc.)
      </p>
    </div>
  );
}
```

Register in `index.tsx`: `widgets: { RichTextWidget }`.
Configure in uiSchema: `fieldKey: { 'ui:widget': 'RichTextWidget' }`.

---

#### `file_upload_server: true`

For file fields that must POST to a server endpoint (rather than base64 encoding), create `widgets/FileUploadWidget.tsx`:

```tsx
// widgets/FileUploadWidget.tsx — uploads file to server and stores returned URL/ID in form data
import React, { useState, useRef } from 'react';
import type { WidgetProps, RJSFSchema, FormContextType } from '@rjsf/utils';

export function FileUploadWidget({ id, value, onChange, disabled, readonly, options, required, rawErrors, label }: WidgetProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const endpoint = (options as { endpoint?: string }).endpoint ?? '/api/upload';
  const abortRef = useRef<AbortController>();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    abortRef.current?.abort(); // cancel any in-flight upload
    const controller = new AbortController();
    abortRef.current = controller;
    setUploading(true);
    setUploadError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(endpoint, { method: 'POST', body: fd, signal: controller.signal });
      if (!res.ok) throw new Error(`Upload failed: ${res.statusText}`);
      const { url } = await res.json() as { url: string };
      onChange(url);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        id={id}
        type="file"
        disabled={disabled || readonly || uploading}
        onChange={handleFileChange}
        aria-required={required}
        aria-label={label}
      />
      {uploading && <p role="status" aria-live="polite">Uploading…</p>}
      {uploadError && <p role="alert" style={{ color: '#dc2626' }}>{uploadError}</p>}
      {typeof value === 'string' && value && (
        <p style={{ fontSize: '0.875rem', color: '#16a34a' }}>Uploaded: {value}</p>
      )}
      {rawErrors?.map((err, i) => (
        <p key={i} role="alert" style={{ color: '#dc2626', fontSize: '0.875rem' }}>{err}</p>
      ))}
    </div>
  );
}
```

Register in `index.tsx`: `widgets: { FileUploadWidget }`.
Configure in uiSchema: `fieldKey: { 'ui:widget': 'FileUploadWidget', 'ui:options': { endpoint: '/api/files/upload' } }`.

---

#### `tab_layout: true`

Create `templates/TabTemplate.tsx`:

```tsx
// templates/TabTemplate.tsx — renders top-level object properties as tabs
import React, { useState } from 'react';
import type { ObjectFieldTemplateProps, RJSFSchema, FormContextType } from '@rjsf/utils';

export function TabTemplate({ properties, title }: ObjectFieldTemplateProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <h2>{title}</h2>
      {/* Tab bar */}
      <div role="tablist" style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e5e7eb' }}>
        {properties.map((prop, i) => (
          <button
            key={prop.name}
            id={`tab-${prop.name}`}
            role="tab"
            type="button"
            aria-selected={activeTab === i}
            aria-controls={`panel-${prop.name}`}
            onClick={() => setActiveTab(i)}
            style={{
              padding: '8px 20px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === i ? 600 : 400,
              borderBottom: activeTab === i ? '2px solid #2563eb' : '2px solid transparent',
              marginBottom: -2,
              color: activeTab === i ? '#2563eb' : 'inherit',
            }}
          >
            {prop.content.props.schema?.title ?? prop.name}
          </button>
        ))}
      </div>
      {/* Tab panels */}
      {properties.map((prop, i) => (
        <div
          key={prop.name}
          id={`panel-${prop.name}`}
          role="tabpanel"
          aria-labelledby={`tab-${prop.name}`}
          hidden={activeTab !== i}
          style={{ padding: '20px 0' }}
        >
          {prop.content}
        </div>
      ))}
    </div>
  );
}
```

Register in `index.tsx` templates: `ObjectFieldTemplate: TabTemplate`.

---

#### `multi_step: true`

When `multi_step: true` in the RequirementsBrief, generate a multi-step wizard. This **replaces** the standard `index.tsx` with a wizard controller that uses **Validation Strategy 2** (see `references/validation-strategy.md`):

- Renders one step at a time using **per-step sub-schemas** (NOT the full schema)
- **Validates each step's required fields** via `formRef.current?.validateForm()` before advancing — this validates ONLY the current step's sub-schema, not the entire form
- Places the submit button inside `<Form>` so RJSF validates the final step on submit
- Shows a styled step indicator (active / completed / upcoming states)
- Accumulates field values across steps in `allData` state (single source of truth)
- If `cross_field_validation: true` AND related fields span different steps → adds cross-step validation in `handleSubmit()` on the final step (see `references/validation-strategy.md` § Cross-Step Validation)

---

**A — Split the schema by step**

Read the Step Map from `form-plan.md`. For each step, create a sub-schema with only that step's fields and their `required` constraints. Add this constant near the top of `index.tsx` (below the schema import):

```typescript
import type { RJSFSchema } from '@rjsf/utils';

// Per-step sub-schemas derived from the Step Map in form-plan.md.
// Each sub-schema is a subset of the root schema restricted to that step's fields.
// RJSF will validate ONLY these fields when formRef.current.validateForm() is called.
const stepSchemas: RJSFSchema[] = [
  {
    // Step 1: <step title from Step Map>
    type: 'object',
    title: '<step title>',
    required: [/* only the required field keys that belong to this step */],
    properties: {
      // Copy each property from schema.ts that belongs to this step.
      // Example: fullName: schema.properties.fullName,
    },
  },
  // Repeat for every step in the Step Map.
];

// Per-step uiSchema slices — copy only the relevant keys from uiSchema.ts.
const stepUiSchemas: UiSchema[] = [
  { /* uiSchema entries for step 1 fields */ },
  // Repeat for every step.
];

const stepTitles = stepSchemas.map(s => ({ title: s.title as string }));
```

---

**B — Generate `templates/StepIndicator.tsx`**

```tsx
// templates/StepIndicator.tsx — step progress bar with active / done / upcoming states
import React from 'react';

interface StepIndicatorProps {
  steps: { title: string }[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div
      role="tablist"
      aria-label="Form progress"
      style={{ display: 'flex', borderBottom: '2px solid #e5e7eb', marginBottom: 24 }}
    >
      {steps.map((step, i) => {
        const isDone   = i < currentStep;
        const isActive = i === currentStep;
        return (
          <div
            key={step.title}
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? 'step' : undefined}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? '#2563eb' : isDone ? '#16a34a' : '#9ca3af',
              borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
              marginBottom: -2,
              userSelect: 'none',
              cursor: 'default',
            }}
          >
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 700,
                background: isActive ? '#2563eb' : isDone ? '#16a34a' : '#e5e7eb',
                color: isActive || isDone ? '#fff' : '#6b7280',
                flexShrink: 0,
              }}
            >
              {isDone ? '✓' : i + 1}
            </span>
            {step.title}
          </div>
        );
      })}
    </div>
  );
}
```

---

**C — Replace `index.tsx` with the multi-step wizard variant**

```tsx
// index.tsx — Multi-step wizard form (generated when multi_step: true)
import React, { useState, useRef } from 'react';
import Form from '<rjsf-theme-package>';
import validator from '@rjsf/validator-ajv8';
import type { UiSchema, IChangeEvent, ErrorSchema } from '@rjsf/utils';
import { StepIndicator } from './templates/StepIndicator';
import type { <FormName>Data } from './types';
// stepSchemas, stepUiSchemas, stepTitles — defined above in schema section
// import { PhoneWidget } from './widgets/PhoneWidget';

const widgets = {
  // PhoneWidget,
};

interface <FormName>Props {
  formData?: Partial<<FormName>Data>;
  onSubmit: (data: <FormName>Data) => void | Promise<void>;
  onError?: (errors: unknown) => void;
}

export function <FormName>({ formData: initialData, onSubmit, onError }: <FormName>Props) {
  const [currentStep, setCurrentStep] = useState(0);
  // allData accumulates field values across all steps.
  const [allData, setAllData] = useState<Partial<<FormName>Data>>(initialData ?? {});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [serverErrors, setServerErrors] = useState<ErrorSchema<<FormName>Data>>({});
  // formRef is required for programmatic step validation via validateForm().
  const formRef = useRef<InstanceType<typeof Form>>(null);

  const isFirst = currentStep === 0;
  const isLast  = currentStep === stepSchemas.length - 1;

  // Use IChangeEvent<T> — see references/typescript-pitfalls.md § 14
  const handleChange = (event: IChangeEvent<Partial<<FormName>Data>>) => {
    if (!event.formData) return;
    // Merge current step's data into accumulated data without losing other steps' values.
    setAllData(prev => ({ ...prev, ...event.formData }));
  };

  // Validate current step's required fields before advancing.
  // validateForm() runs RJSF validation against the current step's sub-schema only.
  // If any required field is empty, RJSF renders inline errors and this returns false.
  const handleNext = async () => {
    const isValid = await formRef.current?.validateForm();
    if (!isValid) return; // stay on current step; RJSF has already surfaced the errors
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => setCurrentStep(prev => prev - 1);

  // --- VALIDATION STRATEGY 2: Custom Per-Step (multi-step wizard) ---
  // Each step validates ONLY its own sub-schema via validateForm().
  // The final submit validates the last step via RJSF's onSubmit pipeline,
  // then runs cross-step validation (if cross_field_validation: true and fields span steps).
  //
  // DO NOT pass the full schema to <Form> — it would show errors for invisible fields.
  // DO NOT add customValidate for rules that JSON Schema already handles within a step.

  // Final submit — only reached from the last step.
  // type="submit" inside <Form> ensures RJSF validates the last step before this fires.
  const handleSubmit = async (data: IChangeEvent<<FormName>Data>) => {
    if (!data.formData) return; // formData can be undefined in IChangeEvent
    const finalData = { ...allData, ...data.formData } as <FormName>Data;

    // Cross-step validation (only if cross_field_validation: true AND fields span steps):
    // const crossStepErrors: string[] = [];
    // if (finalData.endDate && finalData.startDate && finalData.endDate <= finalData.startDate) {
    //   crossStepErrors.push('End date (Step 3) must be after start date (Step 1)');
    // }
    // if (crossStepErrors.length > 0) {
    //   setFormLevelErrors(crossStepErrors);  // display as form-level error on final step
    //   return;
    // }

    setStatus('loading');
    try {
      await onSubmit(finalData);
      setStatus('success');
    } catch (err: unknown) {
      setStatus('error');
      if (err && typeof err === 'object' && 'fieldErrors' in err) {
        const fieldErrors = (err as { fieldErrors: Record<string, string> }).fieldErrors;
        const errorSchema: Record<string, { __errors: string[] }> = {};
        for (const [field, msg] of Object.entries(fieldErrors)) {
          const parts = field.split('.');
          let target: Record<string, unknown> = errorSchema;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!target[parts[i]]) target[parts[i]] = {};
            target = target[parts[i]] as Record<string, unknown>;
          }
          (target as Record<string, { __errors: string[] }>)[parts[parts.length - 1]] = { __errors: [msg] };
        }
        setServerErrors(errorSchema);
      }
      onError?.(err);
    }
  };

  if (status === 'success') {
    return <div role="status" aria-live="polite">Form submitted successfully.</div>;
  }

  // Card wrapper — apply stylingApproach variant (see single-page index.tsx comments above).
  return (
    <div className="rjsf-form-card">
      <StepIndicator steps={stepTitles} currentStep={currentStep} />

      {status === 'error' && (
        <div role="alert" style={{ color: '#dc2626', marginBottom: 16 }}>
          Submission failed. Please check the errors below.
        </div>
      )}

      {/* Form renders only the current step's sub-schema.
          Changing stepSchemas[currentStep] on each step means validateForm() only checks
          the fields visible on the current step — not the entire form. */}
      <Form
        ref={formRef}
        schema={stepSchemas[currentStep]}
        uiSchema={stepUiSchemas[currentStep]}
        validator={validator}
        formData={allData}
        widgets={widgets}
        onChange={handleChange}
        onSubmit={isLast ? handleSubmit : undefined}
        extraErrors={isLast ? serverErrors : {}}
        noHtml5Validate={false}
        omitExtraData={false}
        // --- Error display: same logic as single-page form (see 4i) ---
        showErrorList={false}  // Default: "inline" — change based on error_display flag
      >
        {/* Navigation buttons rendered INSIDE <Form>.
            - "Next →" uses type="button" + handleNext() which calls validateForm() explicitly.
            - "Submit" uses type="submit" so RJSF's onSubmit pipeline (including required-field
              checks) fires before handleSubmit is called.
            NEVER move these buttons outside <Form> — the submit button would bypass RJSF
            validation and allow empty required fields to pass through. */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
          {!isFirst && (
            <button
              type="button"
              onClick={handleBack}
              style={{
                padding: '9px 20px', border: '1px solid #d1d5db', borderRadius: 6,
                background: '#fff', cursor: 'pointer', fontWeight: 500, minHeight: 44,
              }}
            >
              ← Back
            </button>
          )}
          {!isLast && (
            <button
              type="button"
              onClick={handleNext}
              style={{
                marginLeft: 'auto', padding: '9px 20px', background: '#2563eb',
                color: '#fff', border: 'none', borderRadius: 6,
                cursor: 'pointer', fontWeight: 500, minHeight: 44,
              }}
            >
              Next →
            </button>
          )}
          {isLast && (
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{
                marginLeft: 'auto', padding: '9px 20px', background: '#2563eb',
                color: '#fff', border: 'none', borderRadius: 6,
                cursor: 'pointer', fontWeight: 500, minHeight: 44,
                opacity: status === 'loading' ? 0.7 : 1,
              }}
            >
              {status === 'loading' ? 'Submitting…' : 'Submit'}
            </button>
          )}
        </div>
      </Form>
    </div>
  );
}
```

Update the file tree shown in Step 4 to include multi_step artifacts when applicable:

```
├── templates/
│   ├── StepIndicator.tsx   (multi_step: true — step progress bar)
│   └── <other templates>
```

---

## Step 5.9 — Type Contract Verification

**Before showing the preview, verify all generated code against `references/rjsf-type-contracts.md` § 14 checklist:**

- [ ] `schema.ts` exports `const schema: RJSFSchema`
- [ ] `uiSchema.ts` exports `const uiSchema: UiSchema<<FormName>Data>`
- [ ] `types.ts` interfaces match schema properties 1:1 (type, optionality, enums)
- [ ] `index.tsx` uses `Form<<FormName>Data>` generic on the JSX element
- [ ] `index.tsx` uses `IChangeEvent<<FormName>Data>` for onSubmit handler
- [ ] `index.tsx` uses `ErrorSchema<<FormName>Data>` for serverErrors state
- [ ] All custom widgets use `WidgetProps<<FormName>Data>` (not bare `WidgetProps`)
- [ ] All custom fields use `FieldProps<FieldDataType>` with the correct sub-type
- [ ] All custom templates use their respective `*Props<<FormName>Data>` with generics
- [ ] `CustomValidator<<FormName>Data>` is used when customValidate is present
- [ ] `formData` from `IChangeEvent` is null-checked before use
- [ ] Conditional fields are marked optional (`?`) in TypeScript interfaces
- [ ] Array item objects have dedicated exported interfaces
- [ ] Enum fields use string literal union types, not bare `string`
- [ ] No `as` type assertions except where RJSF's own types require them
- [ ] All type imports use `import type` syntax (not value imports)

**TypeScript Pitfall Checklist (from `references/typescript-pitfalls.md`):**

- [ ] All `onSubmit`/`onChange` handlers use `IChangeEvent<FormDataType>`, not destructured `{ formData }`
- [ ] `formData` is null-checked before use in every handler (`if (!data.formData) return`)
- [ ] No bare `{ formData: unknown }` or `{ formData: any }` parameter types
- [ ] Draft save / computed field handlers use `IChangeEvent<T>`, not bare destructuring
- [ ] `schema.ts` uses `: RJSFSchema` type annotation (or `satisfies RJSFSchema`)
- [ ] All `@rjsf/*` package versions match (same major.minor) in any package.json reference
- [ ] Form ref uses `useRef<React.ElementRef<typeof Form>>` or `useRef<InstanceType<typeof Form>>`
- [ ] `mapServerErrors` returns `ErrorSchema<FormDataType>`, not `Record<string, any>`
- [ ] No `React.FC` used — use function declarations with typed props instead

**Visual Parity Checklist (from `references/visual-parity-rules.md`):**

- [ ] Base CSS overrides file generated (`rjsf-overrides.css` or equivalent)
- [ ] Custom ObjectFieldTemplate (`SectionTemplate.tsx`) generated with grid layout matching FormPlan columns
- [ ] All labels left-aligned (not centered)
- [ ] All enum fields use `oneOf` with human-readable `title` (no raw `enum` with snake_case values)
- [ ] Radio buttons with ≤5 short options have `ui:options.inline: true`
- [ ] Section cards have border, border-radius, padding
- [ ] Form wrapped in a card container with max-width
- [ ] Step indicator matches prototype style (if multi-step)
- [ ] Typography matches prototype (font sizes, weights, colors)
- [ ] Touch targets ≥44px on all inputs/buttons
- [ ] Next/Submit buttons right-aligned
- [ ] `rjsf-overrides.css` imported in `index.tsx`
- [ ] `SectionTemplate` registered as `ObjectFieldTemplate` in Form templates prop

If any item fails, fix the generated code before proceeding to Step 6.

---

## Step 6 — Full Preview

Show the complete file tree in chat:

```
Will write to <outputPath>/:
├── schema.ts
├── uiSchema.ts
├── types.ts
├── index.tsx
├── rjsf-overrides.css          (MANDATORY — base CSS overrides)
├── widgets/
│   └── <CustomWidgetName>.tsx   (if any — per Customization Assessment)
├── fields/
│   └── <CustomFieldName>.tsx    (if any)
└── templates/
    ├── SectionTemplate.tsx      (MANDATORY for multi-column forms — grid layout)
    └── <CustomTemplateName>.tsx  (if any)
```

Also show any edge-case files (e.g. `<FormName>View.tsx`, `translations.ts`, `<FormName>.print.css`, `SortableArrayTemplate.tsx`) if their flags are true.

Show each file's content in the chat with syntax highlighting.

Ask: "Ready to write these files? Confirm the output path: `<outputPath>/` (or specify a different path)."

---

## Step 7 — Write Files

On confirmation:
1. Create the output directory if it does not exist.
2. Write all files to the confirmed path.
3. Update `session.json`:
   - `phases["4"].status = "completed"`
   - `phases["4"].completedAt = <ISO timestamp>`
   - `phases["4"].artifactPath = "<outputPath>/index.tsx"`
   - `outputPath = "<confirmed path>"`
   - `currentPhase = 5`
   - Write the full session.json (not a partial merge).

---

## Step 8 — End-of-Phase Prompt

After writing, output:

> "Files written to `<outputPath>/`.
>
> **Next step:** Run `/rjsf-test` to generate tests for your form, or import it directly and start using it.
>
> To make changes later, run `/rjsf-iterate \"describe what to change\"`."
