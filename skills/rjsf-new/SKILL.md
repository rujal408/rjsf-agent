---
name: rjsf-new
description: Create a new RJSF form session — asks for theme, styling, output path, and scaffolds empty form files ready for step-by-step building
argument-hint: <FormName>
allowed-tools: [Read, Write, Glob, Bash]
---

# RJSF New — Create a Form Session

**Trigger:** `/rjsf-new <FormName>`

Creates a new form session, asks for theme and styling preferences, scaffolds empty form files (schema.ts, uiSchema.ts, types.ts, index.tsx), and sets it as the active session. After creation, use the builder commands (`/rjsf-field`, `/rjsf-template`, `/rjsf-widget`) to build the form step by step.

---

## Step 1 — Validate Input

The user must provide a form name argument. If no argument is given:

> "Usage: `/rjsf-new <FormName>` (e.g., `/rjsf-new UserRegistrationForm`)"

Stop here.

### PascalCase Enforcement

The form name **must** be PascalCase (e.g., `UserRegistrationForm`, `PaymentForm`).

- If the input is already PascalCase, use it as-is.
- If the input is not PascalCase (e.g., `user-registration-form`, `user_registration_form`, `userRegistrationForm`, `payment form`), auto-convert it:
  - Split on hyphens, underscores, spaces, or camelCase word boundaries.
  - Capitalize the first letter of each segment.
  - Join without separators.
  - Inform the user of the conversion: `"Converted to PascalCase: <ConvertedName>"`

---

## Step 2 — Check for Name Conflicts

Check if the directory `.rjsf/sessions/<FormName>/` already exists.

If it exists:

> "A session for **<FormName>** already exists. Use `/rjsf-switch <FormName>` to switch to it, or choose a different name."

Stop here.

---

## Step 3 — Ask RJSF Theme

Ask the developer to choose the UI framework for the form:

> "Which UI framework for **<FormName>**?
>
> A) **MUI (Material UI)** — `@rjsf/mui` — Google Material Design components
> B) **Ant Design** — `@rjsf/antd` — Alibaba's enterprise UI components
> C) **Chakra UI** — `@rjsf/chakra-ui` — Accessible component library
> D) **Fluent UI** — `@rjsf/fluent-ui` — Microsoft's design system
> E) **Semantic UI** — `@rjsf/semantic-ui` — User-friendly styling
> F) **Bootstrap 4** — `@rjsf/bootstrap-4` — Classic responsive framework
> G) **Core (no UI library)** — `@rjsf/core` — Plain HTML, bring your own CSS
>
> Choose A–G:"

Wait for the developer's response. Map to:

| Choice | `rjsfTheme` value |
|--------|-------------------|
| A | `@rjsf/mui` |
| B | `@rjsf/antd` |
| C | `@rjsf/chakra-ui` |
| D | `@rjsf/fluent-ui` |
| E | `@rjsf/semantic-ui` |
| F | `@rjsf/bootstrap-4` |
| G | `@rjsf/core` |

---

## Step 4 — Determine Styling Approach

**If `rjsfTheme` is a UI library theme** (A–F), auto-set the styling approach — the library ships its own grid system:

| Theme | `stylingApproach` | Tell developer |
|-------|-------------------|----------------|
| `@rjsf/mui` | `mui-grid` | "Using MUI Box/Grid with `sx` breakpoint props." |
| `@rjsf/antd` | `antd-grid` | "Using Ant Design Row/Col with responsive span props." |
| `@rjsf/chakra-ui` | `chakra-grid` | "Using Chakra UI SimpleGrid/Box for responsive layout." |
| `@rjsf/fluent-ui` | `fluent-grid` | "Using Fluent UI Stack for responsive layout." |
| `@rjsf/semantic-ui` | `semantic-grid` | "Using Semantic UI Grid for responsive layout." |
| `@rjsf/bootstrap-4` | `bootstrap-grid` | "Using Bootstrap responsive grid classes." |

**If `rjsfTheme` is `@rjsf/core`** (G), ask the developer:

> "Which styling approach for generated components?
>
> A) **CSS Modules** (.module.css)
> B) **SCSS** (.module.scss or .scss)
> C) **Tailwind CSS** utility classes
> D) **Plain CSS** (single .css file)
> E) **No styles** — bare structure only"

Map to:

| Choice | `stylingApproach` value |
|--------|------------------------|
| A | `css-modules` |
| B | `scss` |
| C | `tailwind` |
| D | `plain-css` |
| E | `bare` |

---

## Step 5 — Ask Output Path

Ask the developer where to generate the form files:

> "Where should the form files be generated?
>
> Default: `src/forms/<FormName>`
>
> Enter a custom path or press Enter for default:"

If the developer provides a path, use it. If they accept the default (empty response, "default", "yes", etc.), use `src/forms/<FormName>`.

Validate the path:
- Must be a relative path (not absolute)
- Must not be inside `.rjsf/`
- Parent directory should exist (or will be created)

---

## Step 6 — Create Session Directory and session.json

1. Create `.rjsf/sessions/<FormName>/` directory.

2. Write `.rjsf/sessions/<FormName>/session.json`:

```json
{
  "version": "5.0.0",
  "formName": "<FormName>",
  "outputPath": "<outputPath>",
  "rjsfTheme": "<rjsfTheme>",
  "stylingApproach": "<stylingApproach>",
  "createdAt": "<ISO 8601 timestamp>",
  "lastModified": "<ISO 8601 timestamp>"
}
```

---

## Step 7 — Set Active Session

Write the form name (plain text, no trailing newline) to `.rjsf/active-session`.

---

## Step 8 — Scaffold Initial Form Files

Create the output directory and generate initial empty form files. These provide the starting structure that the builder commands (`/rjsf-field`, `/rjsf-template`, `/rjsf-widget`) will modify.

### 8a. Create output directory

```bash
mkdir -p <outputPath>
```

### 8b. Generate `schema.ts`

```typescript
import type { RJSFSchema } from '@rjsf/utils';

export const schema: RJSFSchema = {
  title: '<Form Title>',
  type: 'object',
  properties: {},
  required: [],
};
```

Where `<Form Title>` is derived from the PascalCase form name by inserting spaces before capitals (e.g., `UserRegistrationForm` → `User Registration Form`).

### 8c. Generate `uiSchema.ts`

```typescript
import type { UiSchema } from '@rjsf/utils';

export const uiSchema: UiSchema = {
  'ui:order': [],
};
```

### 8d. Generate `types.ts`

```typescript
export interface <FormName>Data {
  // Add fields with /rjsf-field add <fieldName>
}
```

### 8e. Generate `index.tsx`

The Form component varies by theme. Generate based on `rjsfTheme`:

**For `@rjsf/mui`:**
```typescript
import { useState } from 'react';
import Form from '@rjsf/mui';
import validator from '@rjsf/validator-ajv8';
import type { IChangeEvent } from '@rjsf/utils';
import { schema } from './schema';
import { uiSchema } from './uiSchema';
import type { <FormName>Data } from './types';

export default function <FormName>() {
  const [formData, setFormData] = useState<<FormName>Data>({} as <FormName>Data);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (data: IChangeEvent<<FormName>Data>) => {
    if (!data.formData) return;
    console.log('Form submitted:', data.formData);
    setSubmitted(true);
  };

  if (submitted) {
    return <div>Form submitted successfully.</div>;
  }

  return (
    <Form<<FormName>Data>
      schema={schema}
      uiSchema={uiSchema}
      formData={formData}
      onChange={(e) => setFormData(e.formData ?? ({} as <FormName>Data))}
      onSubmit={handleSubmit}
      validator={validator}
    />
  );
}
```

**For other themes**, replace the `import Form from '@rjsf/mui'` line with the matching theme package:
- `@rjsf/antd` → `import Form from '@rjsf/antd'`
- `@rjsf/chakra-ui` → `import Form from '@rjsf/chakra-ui'`
- `@rjsf/fluent-ui` → `import Form from '@rjsf/fluent-ui'`
- `@rjsf/semantic-ui` → `import Form from '@rjsf/semantic-ui'`
- `@rjsf/bootstrap-4` → `import Form from '@rjsf/bootstrap-4'`
- `@rjsf/core` → `import Form from '@rjsf/core'`

**TypeScript rules (mandatory):**
- Do NOT import React — JSX transform handles it
- Use `import type` for type-only imports
- Parameterize all RJSF generics: `Form<<FormName>Data>`, `IChangeEvent<<FormName>Data>`
- Null-check `formData`: `if (!data.formData) return;`

---

## Step 9 — Confirm

Display:

> "Created new session: **<FormName>**
>
> Session: `.rjsf/sessions/<FormName>/`
> Theme: `<rjsfTheme>` | Styling: `<stylingApproach>`
> Output: `<outputPath>/`
>
> Scaffolded files:
> ```
> <outputPath>/
> ├── schema.ts      (empty JSON Schema)
> ├── uiSchema.ts    (empty UI Schema)
> ├── types.ts       (empty TypeScript interface)
> └── index.tsx      (Form component with <rjsfTheme>)
> ```
>
> **Build your form step by step:**
> - `/rjsf-field add <name>` — add fields one by one
> - `/rjsf-template create <type>` — create templates (grid layout, array cards, etc.)
> - `/rjsf-widget create <name>` — build custom input widgets
> - `/rjsf-template grid` — configure responsive column layout
> - `/rjsf-field list` — see all fields at any time"
