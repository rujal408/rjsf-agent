---
name: rjsf-widget
description: Create or list custom RJSF widgets (WidgetProps-based input controls) in the active form session
argument-hint: create|list <widgetName>
allowed-tools: [Read, Write, Edit, Glob, Bash]
---

# RJSF Widget — Manage Custom Widgets

**Trigger:** `/rjsf-widget <subcommand> [args]`

Session-aware commands for creating and managing custom RJSF widgets. A widget is a React component that replaces the default input control for a single field — e.g., a masked phone input, a color picker, a star rating, or a tag/chip input.

---

## Subcommands

| Subcommand | Usage | Description |
|------------|-------|-------------|
| `create` | `/rjsf-widget create <WidgetName>` | Generate a custom widget component |
| `list` | `/rjsf-widget list` | List built-in and custom widgets in the active form |

---

## When to Use a Widget vs Field vs Template

| I want to... | Use |
|--------------|-----|
| Replace a single input control (text → phone mask, text → color picker) | **Widget** (`WidgetProps`) |
| Combine multiple inputs under one label (date range, address block) | **Field** — use `/rjsf-field add` with a compound type |
| Change how a group of fields is laid out (grid, sections, cards) | **Template** — use `/rjsf-template create` |

---

## Built-in RJSF Widgets Reference

These widgets are available out of the box with any RJSF theme. No custom code needed.

| Widget name | Schema type | HTML element | Set via |
|-------------|-------------|--------------|---------|
| `text` | string | `<input type="text">` | default |
| `email` | string (format: email) | `<input type="email">` | `ui:widget: "email"` |
| `password` | string | `<input type="password">` | `ui:widget: "password"` |
| `textarea` | string | `<textarea>` | `ui:widget: "textarea"` |
| `date` | string (format: date) | `<input type="date">` | `ui:widget: "date"` |
| `datetime` | string (format: date-time) | `<input type="datetime-local">` | `ui:widget: "datetime"` |
| `color` | string (format: color) | `<input type="color">` | `ui:widget: "color"` |
| `uri` | string (format: uri) | `<input type="url">` | `ui:widget: "uri"` |
| `updown` | number/integer | `<input type="number">` | default |
| `range` | number/integer | `<input type="range">` | `ui:widget: "range"` |
| `radio` | string (enum) | `<input type="radio">` group | `ui:widget: "radio"` |
| `select` | string (enum) | `<select>` | default for 5+ options |
| `checkbox` | boolean | `<input type="checkbox">` | default |
| `checkboxes` | array (enum items) | multiple checkboxes | `ui:widget: "checkboxes"` |
| `hidden` | any | `<input type="hidden">` | `ui:widget: "hidden"` |
| `file` | string (format: data-url) | `<input type="file">` | `ui:widget: "file"` |

---

## Preamble — Session Resolution (all subcommands)

1. Read `.rjsf/active-session` to get the active form name. If the file does not exist: stop and say: "No active session. Run `/rjsf-new <FormName>` first."
2. Let `sessionDir` = `.rjsf/sessions/{formName}/`. Read `{sessionDir}/session.json`.
3. Read `session.json` to get `outputPath`, `rjsfTheme`, and `stylingApproach`.
4. **Guard clause:** If `outputPath` is null: stop and say: "No output path set. Run `/rjsf-new <FormName>` to create a session with scaffolded files."
5. Verify `{outputPath}/schema.ts` exists. If not: stop and say: "Form files not found at `<outputPath>/`. Run `/rjsf-new <FormName>` to scaffold the initial files."
6. Read `references/frontend-design-audit.md` — use principles #5 (Error Prevention), #11 (Affordances), #13 (Accessibility), and #15 (Tolerance) when building widgets.

---

## Subcommand: `create`

### Step 1 — Parse Widget Name

The widget name must be PascalCase ending with `Widget` (e.g., `PhoneWidget`, `ColorPickerWidget`, `StarRatingWidget`).

- If the name doesn't end with `Widget`, append it: `Phone` → `PhoneWidget`.
- If the name is not PascalCase, convert it: `phone-widget` → `PhoneWidget`.
- Check `{outputPath}/widgets/` for naming conflicts. If a file with this name exists: "Widget `<name>` already exists at `widgets/<name>.tsx`. Edit it directly or choose a different name."

### Step 2 — Collect Widget Requirements

Ask the developer:

| Question | Purpose |
|----------|---------|
| "Which field(s) will use this widget?" | To determine the schema type and validate compatibility. List fields from schema.ts. |
| "What should it do that the built-in widget can't?" | To understand the custom behavior needed. |
| "Does it need external dependencies?" | E.g., react-input-mask, react-select, react-datepicker. Note: the developer must install these themselves. |

Based on the target field's schema type, determine the `value` and `onChange` types:

| Schema type | `props.value` type | `props.onChange(val)` type |
|-------------|-------------------|--------------------------|
| `string` | `string \| undefined` | `string` |
| `number` / `integer` | `number \| undefined` | `number` |
| `boolean` | `boolean \| undefined` | `boolean` |
| `string` (enum) | `string \| undefined` | `string` |
| `array` | `any[] \| undefined` | `any[]` |

### Step 3 — Read API Reference

Read `references/rjsf-widget-api.md` for the complete `WidgetProps` interface.

Read the matching design patterns file (same logic as Phase 4 Step 1.7):
- `@rjsf/mui` → `references/design-examples/mui-design-patterns.md`
- `@rjsf/chakra-ui` → `references/design-examples/chakra-design-patterns.md`
- `stylingApproach: "tailwind"` → `references/design-examples/daisyui-design-patterns.md`
- All others → `references/design-examples/core-css-design-patterns.md`

### Step 4 — Generate Widget Component

Generate `{outputPath}/widgets/{WidgetName}.tsx` following these rules:

#### Structure

```typescript
import { useState, useCallback } from 'react';
import type { WidgetProps } from '@rjsf/utils';
import type { FormNameData } from '../types';
// Framework imports based on styling approach:
// MUI: import { TextField, InputAdornment } from '@mui/material';
// Chakra: import { Input, InputGroup } from '@chakra-ui/react';
// etc.

// Companion CSS import if css-modules/scss/plain-css:
// import styles from './WidgetName.module.css';

function WidgetName(props: WidgetProps<FormNameData>) {
  const {
    id,
    value,
    required,
    disabled,
    readonly,
    autofocus,
    onChange,
    onBlur,
    onFocus,
    rawErrors,
    schema,
    uiSchema,
    placeholder,
  } = props;

  const hasError = rawErrors && rawErrors.length > 0;

  // Widget implementation here

  return (
    // JSX with proper accessibility attributes
  );
}

export default WidgetName;
```

#### Mandatory Rules

1. **Do NOT import React** — the JSX transform handles it.
2. **Use `import type` for type-only imports.**
3. **Always parameterize generics:** `WidgetProps<FormNameData>`, not bare `WidgetProps`.
4. **Always destructure these props:** `id`, `value`, `required`, `disabled`, `readonly`, `onChange`, `rawErrors`.
5. **Always call `props.onChange(newValue)`** to update the form — never manage state independently.
6. **Handle `undefined` value:** `const displayValue = value ?? '';`
7. **Handle `onBlur`/`onFocus`:** Call `props.onBlur(id, value)` and `props.onFocus(id, value)` to trigger RJSF's blur/focus validation.

#### Accessibility Requirements (Design Audit Principle #13)

Every custom widget MUST include:

| Attribute | When | Implementation |
|-----------|------|---------------|
| `id={id}` | Always | RJSF passes a unique ID — use it on the main input |
| `aria-required={required}` | Always | Reflect the required prop |
| `aria-invalid={hasError}` | Always | True when `rawErrors` has entries |
| `aria-describedby` | When errors or help text exist | Point to the error/help element ID |
| `disabled={disabled}` | Always | Reflect the disabled prop |
| `readOnly={readonly}` | Always | Reflect the readonly prop |
| `autoFocus={autofocus}` | Always | Reflect the autofocus prop |
| Minimum height | Always | 44px touch target (design audit #13) |
| Focus indicator | Always | Visible focus ring or border change |

#### Error Display

If `rawErrors` has entries, render them below the input:

```tsx
{hasError && (
  <div id={`${id}__error`} role="alert" className="field-error">
    {rawErrors.map((error, i) => (
      <p key={i}>{error}</p>
    ))}
  </div>
)}
```

#### Styling Rules

Match the styling approach from session.json:

| Approach | CSS Strategy |
|----------|-------------|
| `css-modules` | Create `widgets/{WidgetName}.module.css`, import as `styles` |
| `scss` | Create `widgets/{WidgetName}.module.scss`, import as `styles` |
| `tailwind` | Use utility classes inline: `className="rounded-md border ..."` |
| `plain-css` | Create `widgets/{WidgetName}.css`, import directly |
| `mui-grid` / `@rjsf/mui` | Use MUI components (`TextField`, `InputAdornment`, etc.) with `sx` props |
| `chakra-grid` / `@rjsf/chakra-ui` | Use Chakra components (`Input`, `InputGroup`, etc.) with style props |
| `bootstrap-grid` / `@rjsf/bootstrap-4` | Use Bootstrap classes (`form-control`, `input-group`, etc.) |

### Step 5 — Show Diff Preview

Show:

1. **New file:** `widgets/{WidgetName}.tsx` — full content
2. **New file (if CSS):** `widgets/{WidgetName}.module.css` — full content
3. **`uiSchema.ts` change:** adding `ui:widget` for the target field(s)
4. **`index.tsx` change:** importing the widget and adding to `widgets` prop

```diff
+ import WidgetName from './widgets/WidgetName';

  <Form
    schema={schema}
    uiSchema={uiSchema}
+   widgets={{
+     WidgetName: WidgetName,
+   }}
  />
```

Also show the `uiSchema.ts` change:

```diff
  fieldName: {
+   'ui:widget': 'WidgetName',
    'ui:placeholder': '...',
  },
```

Ask: "Apply these changes? Reply 'yes' to write."

### Step 6 — Write and Register

On confirmation:

1. Create `{outputPath}/widgets/` directory if it doesn't exist.
2. Write `{outputPath}/widgets/{WidgetName}.tsx`.
3. Write companion CSS file if applicable.
4. Edit `index.tsx`: add import and `widgets` prop registration.
5. Edit `uiSchema.ts`: add `ui:widget` for each target field.
6. Update `{sessionDir}/session.json`: set `lastModified` to current ISO timestamp.
7. Append to `{sessionDir}/form-plan.md` changelog:

```markdown
### <ISO timestamp> — Created custom widget: `<WidgetName>`
- For field(s): <fieldName(s)>
- Styling: <stylingApproach>
- Files created: widgets/<WidgetName>.tsx, <companion CSS if any>
- Files modified: index.tsx (registration), uiSchema.ts (ui:widget)
```

### Step 7 — Post-Create Guidance

Output:

> "Widget `<WidgetName>` created at `<outputPath>/widgets/<WidgetName>.tsx`.
>
> Registered for field(s): `<fieldName(s)>`.
>
> Next steps:
> - Test the widget in your app to verify the custom behavior
> - `/rjsf-widget list` — verify widget registration
> - `/rjsf-test` — regenerate tests to cover the custom widget"

If the widget requires external dependencies:

> "**Note:** This widget uses `<package>`. Install it:
> ```bash
> npm install <package>
> ```"

---

## Subcommand: `list`

### Step 1 — Scan Widgets

1. Read `{outputPath}/uiSchema.ts` and find all `ui:widget` entries.
2. Use Glob to find all files in `{outputPath}/widgets/`.
3. Read `{outputPath}/index.tsx` to find the `widgets` prop registration.
4. Cross-reference to identify: registered custom widgets, unregistered widget files, and fields using built-in widgets.

### Step 2 — Display

```
## Widgets in <FormName>

### Custom Widgets (in widgets/ directory)
| Widget | File | Used by field(s) | Registered? |
|--------|------|-------------------|-------------|
| PhoneWidget | widgets/PhoneWidget.tsx | phone | yes |
| FileUploadWidget | widgets/FileUploadWidget.tsx | resume, avatar | yes |

### Built-in Widgets (RJSF defaults)
| Field | Schema Type | Widget | Set via |
|-------|-------------|--------|---------|
| firstName | string | text | default |
| email | string (format: email) | email | ui:widget |
| role | string (enum, 3 options) | radio | ui:widget |
| bio | string | textarea | ui:widget |
| age | integer | updown | default |
| newsletter | boolean | checkbox | default |

### Unregistered Files (exist but not imported)
| File | Status |
|------|--------|
| (none, or list orphaned widget files) |

**Total:** <N> fields, <M> using custom widgets, <K> using built-in
```

---

## Common Widget Patterns

When generating widgets, use these proven patterns as starting points. Adapt to the developer's requirements and styling approach.

### Masked Input (phone, SSN, credit card, zip)
- Use `react-input-mask` or manual formatting
- Display formatted value, store raw digits
- Show format hint as placeholder: `(___) ___-____`
- Accept multiple input formats (design audit #15 — Tolerance)

### Searchable Autocomplete (5+ options)
- Use the theme's autocomplete component (MUI Autocomplete, Chakra Select, etc.)
- Support keyboard navigation
- Show loading state during async search
- Filter options client-side for static lists

### Tag/Chip Input (array of strings)
- Render entered values as removable chips/tags
- Add on Enter or comma
- Prevent duplicates
- Show count badge

### Date Picker
- Use native `<input type="date">` or the theme's date picker
- Support manual text entry alongside picker
- Format display per locale

### File Upload with Preview
- Drag-and-drop zone with visual feedback
- Thumbnail preview for images
- File size/type validation before upload
- Progress bar during upload

### Toggle Switch (boolean)
- Visual on/off toggle instead of checkbox
- Clear label for both states
- Accessible: proper role="switch" and aria-checked
