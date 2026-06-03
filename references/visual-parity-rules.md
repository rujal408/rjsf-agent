# Visual Parity Rules

**Purpose:** Ensure the React/RJSF form generated in Phase 4 looks visually identical to the HTML prototype from Phase 3. RJSF's default rendering is single-column, centered, and unstyled — every generated form MUST include the overrides listed here.

> This is not optional. Skipping these rules produces ugly, unprofessional forms that don't match the client-approved prototype.

---

## Problem: RJSF Default Rendering vs Prototype

| Aspect | RJSF Default (bad) | Prototype (good) | Fix |
|--------|-------------------|-------------------|-----|
| Layout | Single column, stacked | Multi-column grid | Custom ObjectFieldTemplate with CSS grid |
| Labels | Centered above field | Left-aligned above field | CSS `text-align: left` |
| Section wrapper | No border, no padding | Bordered card with padding | Section wrapper CSS |
| Radio buttons | Vertical stack, centered | Horizontal inline | `ui:options.inline: true` |
| Enum labels | snake_case (`prefer_not_to_say`) | Human readable (`Prefer not to say`) | `oneOf` with `title` in schema |
| Field spacing | Tight, inconsistent | Consistent gap (16px/24px) | CSS grid gap |
| Form title | Unstyled | Bold, left-aligned, with subtitle | Wrapper component |
| Required indicator | RJSF default `*` | Colored `*` after label | FieldTemplate override |
| Help text | Below field, unstyled | Small gray text, below field | FieldTemplate CSS |
| Date/number fields | Full width | Constrained width | `max-width` on short fields |
| Next/Submit button | RJSF default, unstyled | Styled, right-aligned | Button template or CSS |

---

## Mandatory Rule 1: Always Generate a Custom ObjectFieldTemplate

**Every form with 2+ column sections MUST have a custom ObjectFieldTemplate.** This is the single most impactful fix. Without it, RJSF renders all fields in a single stacked column.

The template reads column configuration from the FormPlan and renders fields in a CSS grid.

```tsx
// templates/SectionTemplate.tsx — MANDATORY for multi-column layouts
import React from 'react';
import type { ObjectFieldTemplateProps } from '@rjsf/utils';

// Column config derived from FormPlan — one entry per section key.
// Phase 4 must populate this from the FormPlan's column spec.
const SECTION_COLUMNS: Record<string, number> = {
  // e.g., personalInfo: 2, addressInfo: 2, preferences: 1
};

// Fields that should span full width regardless of column count.
const FULL_WIDTH_FIELDS: Set<string> = new Set([
  // e.g., 'bio', 'description', 'terms'
]);

export function SectionTemplate(props: ObjectFieldTemplateProps) {
  const { title, description, properties, idSchema } = props;
  // Determine column count: use section config, fall back to 1
  const rawId = idSchema?.$id ?? 'root';
  const sectionKey = rawId.replace('root_', '').replace('root', '');
  const columns = SECTION_COLUMNS[sectionKey] ?? 1;

  return (
    <fieldset style={{
      border: '1px solid #e5e7eb',
      borderRadius: 12,
      padding: '20px 24px',
      marginBottom: 24,
      background: '#fff',
    }}>
      {title && (
        <legend style={{
          fontSize: '1.1rem',
          fontWeight: 600,
          color: '#1f2937',
          padding: '0 8px',
        }}>
          {title}
        </legend>
      )}
      {description && (
        <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: 16 }}>
          {description}
        </p>
      )}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: '16px 24px',
      }}>
        {properties.map((prop) =>
          prop.hidden ? null : (
            <div
              key={prop.name}
              style={{
                gridColumn: FULL_WIDTH_FIELDS.has(prop.name) ? '1 / -1' : undefined,
              }}
            >
              {prop.content}
            </div>
          )
        )}
      </div>
    </fieldset>
  );
}
```

**For responsive grids**, replace the inline styles with CSS classes using the project's styling approach (see `rjsf-execute` Step 5h). The inline version above is the minimum baseline.

---

## Mandatory Rule 2: Always Generate Base CSS Overrides

**CRITICAL: Theme-aware CSS generation.** The overrides stylesheet MUST be different depending on the RJSF theme:

- **`@rjsf/core`** → Apply raw `input`, `select`, `textarea` selectors (core renders plain HTML elements)
- **`@rjsf/mui`** → Use ONLY MUI class selectors (`.MuiOutlinedInput-root`, `.MuiFormControl-root`, etc.). **NEVER** apply raw `input`/`select`/`textarea` CSS — MUI wraps these in styled components and raw CSS breaks click/type interactions.
- **`@rjsf/antd`** → Use only Ant Design class selectors (`.ant-input`, `.ant-select`, etc.)
- **`@rjsf/bootstrap`** → Use only Bootstrap class selectors (`.form-control`, etc.)

**Why:** MUI/Antd/Bootstrap themes render `<input>` inside wrapper components that handle events, focus, and styling. Raw CSS on the inner `<input>` overrides the wrapper's padding/border/focus logic, causing fields to become unclickable or untypeable.

RJSF themes (especially `@rjsf/core`) need raw element overrides. MUI/Antd/Bootstrap do NOT.

```css
/* rjsf-overrides.css — MANDATORY base overrides to match prototype styling */

/* Fix: Left-align all labels (RJSF/MUI centers them by default) */
.rjsf label,
.rjsf .MuiFormLabel-root,
.rjsf .field-description,
.rjsf .control-label {
  text-align: left !important;
  display: block;
}

/* Fix: Left-align radio/checkbox group labels */
.rjsf .field-radio-group,
.rjsf .field-boolean,
.rjsf .MuiFormGroup-root {
  text-align: left;
}

/* Fix: Consistent field spacing */
.rjsf .form-group,
.rjsf .MuiFormControl-root {
  margin-bottom: 0; /* Grid gap handles spacing, not margins */
}

/* Fix: Input sizing and touch targets */
.rjsf input,
.rjsf select,
.rjsf textarea {
  min-height: 44px;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.95rem;
  width: 100%;
  box-sizing: border-box;
}

.rjsf input:focus,
.rjsf select:focus,
.rjsf textarea:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

/* Fix: Error field border */
.rjsf .has-error input,
.rjsf .has-error select,
.rjsf .field-error input,
.rjsf .field-error select {
  border-color: #dc2626;
}

/* Fix: Help text styling */
.rjsf .help-block,
.rjsf .field-description,
.rjsf .MuiFormHelperText-root {
  font-size: 0.8rem;
  color: #6b7280;
  margin-top: 4px;
}

/* Fix: Error message styling */
.rjsf .error-detail,
.rjsf .text-danger,
.rjsf .MuiFormHelperText-root.Mui-error {
  font-size: 0.8rem;
  color: #dc2626;
  margin-top: 4px;
}

/* Fix: Required asterisk color */
.rjsf .required {
  color: #dc2626;
}

/* Fix: Button alignment (right-align Next/Submit) */
.rjsf .form-actions,
.rjsf > .MuiBox-root:last-child {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

/* Fix: Remove RJSF's default error list at top (when showErrorList={false}) */
.rjsf .errors-header,
.rjsf .error-list {
  display: none;
}

/* Fix: Section title (fieldset legend) styling */
.rjsf fieldset {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 24px;
}

.rjsf fieldset > legend {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  padding: 0 8px;
}
```

**Import this stylesheet in `index.tsx`:**
```tsx
import './rjsf-overrides.css';
```

---

## Mandatory Rule 3: Humanize Enum Labels

**NEVER use raw `enum` values for radio buttons or select dropdowns.** Raw enum produces snake_case or camelCase labels that look unprofessional (e.g., `prefer_not_to_say`).

**Always use `oneOf` with `title` for human-readable labels:**

```typescript
// ❌ BAD — produces "prefer_not_to_say" as the visible label
gender: {
  type: 'string',
  title: 'Gender',
  enum: ['male', 'female', 'other', 'prefer_not_to_say']
}

// ✅ GOOD — produces "Prefer not to say" as the visible label
gender: {
  type: 'string',
  title: 'Gender',
  oneOf: [
    { const: 'male', title: 'Male' },
    { const: 'female', title: 'Female' },
    { const: 'other', title: 'Other' },
    { const: 'prefer_not_to_say', title: 'Prefer not to say' },
  ]
}
```

**Rule for Phase 4:** When generating `schema.ts`, scan every `enum` field. If ANY value contains underscores, hyphens, camelCase, or abbreviations, convert to `oneOf` with human-readable `title` values. Use title case: capitalize first letter of each word.

---

## Mandatory Rule 4: Radio Inline for Short Option Lists

Radio buttons should be **inline (horizontal)** when there are 2–5 options, and **vertical (stacked)** only when there are 6+ options or option text is very long (>30 chars).

**Always set in uiSchema:**
```typescript
// ✅ 4 options, short text → inline
gender: {
  'ui:widget': 'radio',
  'ui:options': { inline: true }
}

// ✅ 2 options → inline
agreeToTerms: {
  'ui:widget': 'radio',
  'ui:options': { inline: true }
}

// ✅ 8 options or long text → vertical (omit inline or set false)
detailedCategory: {
  'ui:widget': 'radio'
  // No inline: true — too many options
}
```

---

## Mandatory Rule 5: Constrain Short Field Widths

Date, number, ZIP code, and country code fields should NOT be full-width. Apply `max-width` constraints.

```css
/* Short field width constraints */
input[type="date"],
input[type="number"],
input[type="time"] {
  max-width: 280px;
}
```

Or via uiSchema `classNames`:
```typescript
dateOfBirth: {
  'ui:options': { style: { maxWidth: 280 } }
}
```

---

## Mandatory Rule 6: Form Card Wrapper

The entire form should be wrapped in a card container matching the prototype:

```tsx
<div style={{
  maxWidth: 720,
  margin: '0 auto',
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
  padding: '32px 40px',
}}>
  {/* Form title */}
  <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>
    {formTitle}
  </h1>
  <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: 24 }}>
    {formSubtitle}
  </p>

  {/* Step indicator (if multi-step) */}
  {/* <StepIndicator ... /> */}

  {/* Form */}
  <Form ... />
</div>
```

---

## Mandatory Rule 7: Match Prototype Typography

| Element | Font Size | Font Weight | Color |
|---------|-----------|-------------|-------|
| Form title | 1.5rem | 700 (bold) | #1f2937 |
| Form subtitle | 0.9rem | 400 | #6b7280 |
| Section title | 1.1rem | 600 (semi-bold) | #1f2937 |
| Field label | 0.875rem | 500 (medium) | #374151 |
| Help text | 0.8rem | 400 | #6b7280 |
| Error text | 0.8rem | 400 | #dc2626 |
| Input text | 0.95rem | 400 | #1f2937 |
| Placeholder | 0.95rem | 400 | #9ca3af |

---

## Mandatory Rule 8: Step Indicator Must Match Prototype

The prototype generates a specific step indicator style. The RJSF form's StepIndicator must match:

- Circular numbered dots (24px diameter)
- Connected with a horizontal line
- Active step: filled blue (#2563eb) with white number
- Completed step: filled green or blue with checkmark
- Upcoming: gray border (#e5e7eb) with gray number
- Horizontally centered above the form

---

## Phase 4 Checklist (Verify Before Writing Files)

After generating all code, verify these visual parity items:

- [ ] Custom ObjectFieldTemplate generated with grid layout matching FormPlan columns
- [ ] Base CSS overrides file generated (`rjsf-overrides.css` or equivalent)
- [ ] All labels left-aligned (not centered)
- [ ] All enum fields use `oneOf` with human-readable `title` (no raw `enum` for display)
- [ ] Radio buttons with ≤5 options have `ui:options.inline: true`
- [ ] Section cards have border, border-radius, padding
- [ ] Form wrapped in a card container with max-width
- [ ] Step indicator matches prototype style (if multi-step)
- [ ] Typography matches prototype (font sizes, weights, colors)
- [ ] Touch targets ≥44px on all inputs/buttons
- [ ] Next/Submit buttons right-aligned
- [ ] Short fields (date, number, zip) have constrained widths
- [ ] Error text is red, help text is gray, below the field
