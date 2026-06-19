---
name: rjsf-template
description: Create, list, or configure RJSF templates (object, array, array-item, field, base-input, title, description, error-list) with responsive grid support
argument-hint: create|list|grid <templateType>
allowed-tools: [Read, Write, Edit, Glob, Bash]
---

# RJSF Template — Manage Form Templates

**Trigger:** `/rjsf-template <subcommand> [args]`

Session-aware commands for creating and managing RJSF templates. Templates control how groups of fields, array items, and structural elements are rendered and arranged — including responsive grid layouts.

---

## Subcommands

| Subcommand | Usage | Description |
|------------|-------|-------------|
| `create` | `/rjsf-template create <type>` | Generate a custom template of the specified type |
| `list` | `/rjsf-template list` | List all registered templates (built-in and custom) |
| `grid` | `/rjsf-template grid [section]` | Configure responsive grid layout for a section's ObjectFieldTemplate |

---

## RJSF Template Types Reference

Every template type serves a distinct role in the form's rendering tree. Understanding which template controls what is essential for choosing the right one.

| Type key | RJSF prop | Component receives | What it controls |
|----------|-----------|-------------------|------------------|
| `object` | `ObjectFieldTemplate` | `ObjectFieldTemplateProps` | Layout of fields within an object — sections, grid columns, field ordering, section titles/descriptions |
| `array` | `ArrayFieldTemplate` | `ArrayFieldTemplateProps` | Array container: the wrapper around all items, add-item button placement, empty state, item count display |
| `array-item` | `ArrayFieldItemTemplate` | `ArrayFieldItemTemplateProps` | Individual array item: card/row wrapper, remove/move-up/move-down/copy buttons, drag handle, item index |
| `field` | `FieldTemplate` | `FieldTemplateProps` | Wrapper around every single field: label + input + help text + error messages, label positioning |
| `base-input` | `BaseInputTemplate` | `WidgetProps` | The base `<input>` element: styling, size, adornments, focus ring, disabled state |
| `title` | `TitleFieldTemplate` | `TitleFieldTemplateProps` | How section/field titles are rendered: heading level, icon, divider line, badge |
| `description` | `DescriptionFieldTemplate` | `DescriptionFieldTemplateProps` | How description text is rendered: plain text, styled box, collapsible, markdown support |
| `error-list` | `ErrorListTemplate` | `ErrorListProps` | Top-level validation error summary: alert box, scrollable list, dismissable banner |

### When to Use Each Template

```
Form
├── ErrorListTemplate ← top-level error summary (one per form)
│
├── ObjectFieldTemplate ← section layout, grid (one per object/section)
│   │
│   ├── FieldTemplate ← label + input + help + error (one per field)
│   │   │
│   │   ├── TitleFieldTemplate ← field/section title
│   │   ├── DescriptionFieldTemplate ← field/section description
│   │   └── BaseInputTemplate ← the <input> element itself
│   │
│   └── ArrayFieldTemplate ← array container (one per array field)
│       │
│       ├── ArrayFieldItemTemplate ← per-item wrapper (one per array item)
│       │   └── ObjectFieldTemplate ← sub-fields within each item (recursive)
│       │
│       └── [Add Item Button]
```

### Template Decision Guide

| I want to... | Use template type |
|--------------|-------------------|
| Arrange fields in a responsive grid (2-3 columns) | `object` |
| Group fields into bordered/shaded sections | `object` |
| Change how array items look (cards, table rows, inline) | `array-item` |
| Add drag-to-reorder to array items | `array-item` |
| Customize the "Add item" button or empty state | `array` |
| Change label position (top, left, floating) | `field` |
| Add a character counter or input adornment | `base-input` |
| Style section headings with icons or dividers | `title` |
| Make descriptions collapsible or render markdown | `description` |
| Replace the default error list with a toast/banner | `error-list` |

---

## Preamble — Session Resolution (all subcommands)

1. Read `.rjsf/active-session` to get the active form name. If the file does not exist: stop and say: "No active session. Run `/rjsf-new <FormName>` first."
2. Let `sessionDir` = `.rjsf/sessions/{formName}/`. Read `{sessionDir}/session.json`.
3. Read `session.json` to get `outputPath`, `rjsfTheme`, and `stylingApproach`.
4. **Guard clause:** If `outputPath` is null or `phases["4"].status` is not `"completed"`: stop and say: "No generated form found. Run `/rjsf-form` first to generate the form."
5. Read `references/frontend-design-audit.md` — use principles #4 (Consistency), #12 (Structure), #13 (Accessibility), and #14 (Perceptibility) when generating templates.

---

## Subcommand: `create`

### Step 1 — Parse Template Type

The developer must specify one of the 8 template types: `object`, `array`, `array-item`, `field`, `base-input`, `title`, `description`, `error-list`.

If no type is provided, show the Template Decision Guide table above and ask: "Which template type do you need?"

If the type is invalid, show the valid types and stop.

### Step 2 — Read Context

1. Read all files at `{outputPath}/`: `schema.ts`, `uiSchema.ts`, `types.ts`, `index.tsx`.
2. Use Glob to check if `{outputPath}/templates/` exists. If yes, read existing template files to avoid naming conflicts.
3. Read `references/rjsf-widget-api.md` for the exact props interface of the chosen template type.
4. Read the matching design patterns file based on the theme (same logic as Phase 4 Step 1.7):
   - `@rjsf/mui` → `references/design-examples/mui-design-patterns.md`
   - `@rjsf/chakra-ui` → `references/design-examples/chakra-design-patterns.md`
   - `stylingApproach: "tailwind"` → `references/design-examples/daisyui-design-patterns.md`
   - All others → `references/design-examples/core-css-design-patterns.md`

### Step 3 — Collect Template Requirements

Ask questions specific to the template type:

#### For `object` template:
| Question | Options |
|----------|---------|
| "Which section(s) should this template apply to?" | List sections from schema, or "all sections" |
| "Grid layout?" | "Yes — I'll configure columns" / "No — vertical stack" |
| "Section grouping style?" | "Bordered cards" / "Flat dividers" / "Color-banded headers" / "No grouping" |
| "Section title style?" | "Large heading" / "Small uppercase label" / "With icon" / "Hidden" |

#### For `array` template:
| Question | Options |
|----------|---------|
| "Which array field?" | List array fields from schema |
| "Empty state style?" | "Illustrated with icon + CTA button" / "Simple text" / "Hidden until add" |
| "Add button placement?" | "Below items" / "Header right" / "Floating action button" |
| "Show item count?" | "Yes — badge in header" / "No" |
| "Maximum items limit?" | Number or "unlimited" |

#### For `array-item` template:
| Question | Options |
|----------|---------|
| "Which array field?" | List array fields from schema |
| "Item layout?" | "Card (bordered)" / "Table row" / "Inline (side-by-side)" / "Accordion (collapsible)" |
| "Action buttons?" | Multi-select: "Remove" / "Move up/down" / "Drag to reorder" / "Duplicate" |
| "Grid layout for sub-fields?" | "Yes — configure columns" / "No — vertical stack" |
| "Item numbering?" | "Numbered (1, 2, 3)" / "No numbering" |

#### For `field` template:
| Question | Options |
|----------|---------|
| "Label position?" | "Top-aligned (default)" / "Left-aligned (horizontal form)" / "Floating inside input" |
| "Required indicator?" | "Asterisk (*) on required" / '"(optional)" on optional' / "Color highlight on required" |
| "Error display?" | "Below field (inline)" / "Tooltip on hover" / "Icon + text" |
| "Help text?" | "Below field (static)" / "Tooltip icon (?)" / "Expandable" |

#### For `base-input` template:
| Question | Options |
|----------|---------|
| "Input size?" | "Small (32px)" / "Medium (40px)" / "Large (48px)" |
| "Focus style?" | "Ring (outline)" / "Border color change" / "Underline only" |
| "Adornments?" | "None" / "Left icon" / "Right icon" / "Prefix text" / "Suffix text" |
| "Disabled style?" | "Grayed out" / "Read-only with background" |

#### For `title` template:
| Question | Options |
|----------|---------|
| "Heading level?" | "h2" / "h3" / "h4" |
| "Decoration?" | "Bottom border" / "Left accent bar" / "Background band" / "None" |
| "Icon?" | "Yes — specify icon" / "No" |

#### For `description` template:
| Question | Options |
|----------|---------|
| "Style?" | "Plain muted text" / "Info box (bordered)" / "Collapsible details" |
| "Position?" | "Below title" / "Above fields" |

#### For `error-list` template:
| Question | Options |
|----------|---------|
| "Style?" | "Alert banner (dismissable)" / "Scrollable list" / "Toast notifications" |
| "Behavior?" | "Always visible" / "Show on submit only" / "Auto-dismiss after 5s" |
| "Click to field?" | "Yes — error text links to field" / "No" |

### Step 4 — Generate Template Component

Generate the template file following these rules:

1. **File location:** `{outputPath}/templates/{TemplateName}.tsx`
   - Naming convention: `SectionTemplate.tsx` (object), `{ArrayName}ArrayTemplate.tsx` (array), `{ArrayName}ItemTemplate.tsx` (array-item), `CustomFieldTemplate.tsx` (field), `CustomBaseInputTemplate.tsx` (base-input), `CustomTitleTemplate.tsx` (title), `CustomDescriptionTemplate.tsx` (description), `CustomErrorListTemplate.tsx` (error-list)

2. **Import the correct props type** from `@rjsf/utils`:
   ```typescript
   import type { ObjectFieldTemplateProps } from '@rjsf/utils';
   // or: ArrayFieldTemplateProps, ArrayFieldItemTemplateProps,
   //     FieldTemplateProps, WidgetProps (for BaseInput),
   //     TitleFieldTemplateProps, DescriptionFieldTemplateProps, ErrorListProps
   ```

3. **Do NOT import React** — the JSX transform handles it.

4. **Use `import type` for type-only imports.**

5. **Match the styling approach** from session.json:
   - `css-modules` → create a companion `.module.css` file
   - `scss` → create a companion `.module.scss` file
   - `tailwind` → use Tailwind utility classes inline
   - `plain-css` → create a companion `.css` file
   - `mui-grid` / `@rjsf/mui` → use MUI `Box`, `Paper`, `Grid`, `sx` props
   - `chakra-grid` / `@rjsf/chakra-ui` → use Chakra `Box`, `SimpleGrid`, style props
   - `bootstrap-grid` / `@rjsf/bootstrap-4` → use Bootstrap grid classes
   - Other UI library themes → use that library's components

6. **For grid-enabled templates** (`object`, `array-item` with sub-fields):
   - Use CSS Grid or the framework's grid system
   - Support responsive breakpoints: mobile (1 col default), tablet (≥640px), desktop (≥1024px)
   - Apply per-field width classes: `full` (span all columns), `half` (span 50%), `quarter` (span 25%)
   - Read field widths from `uiSchema` via `ui:options.width` or from the template's hardcoded config

7. **Accessibility requirements** (from design audit principle #13):
   - `aria-required` on required fields (for `field` template)
   - `aria-invalid` on error fields (for `field` template)
   - `aria-describedby` linking help text and errors to fields
   - Focus indicators visible (for `base-input` template)
   - Touch targets ≥ 44px for buttons (for `array-item` template action buttons)
   - `role="alert"` on error containers (for `error-list` template)

### Step 5 — Show Diff Preview

Show the complete generated template file and any companion CSS file.

Show the registration change needed in `index.tsx`:

```diff
  <Form
    schema={schema}
    uiSchema={uiSchema}
+   templates={{
+     ObjectFieldTemplate: SectionTemplate,
+     // or: ArrayFieldTemplate, ArrayFieldItemTemplate, etc.
+   }}
  />
```

Also show any `uiSchema.ts` changes if the template requires per-field configuration (e.g., width hints).

Ask: "Apply these changes? Reply 'yes' to write."

### Step 6 — Write and Register

On confirmation:

1. Write the template file to `{outputPath}/templates/{TemplateName}.tsx`.
2. Write companion CSS file if applicable.
3. Add the import and registration in `index.tsx`:
   - Import the template component
   - Add to the `templates` prop on the `<Form>` component
4. Update `uiSchema.ts` if per-field configuration is needed.
5. Update `{sessionDir}/session.json`: set `lastModified` to current ISO timestamp.
6. Append to `{sessionDir}/form-plan.md` changelog:

```markdown
### <ISO timestamp> — Created <type> template: `<TemplateName>`
- Type: <templateType>, Styling: <stylingApproach>
- Files created: templates/<TemplateName>.tsx, <companion CSS if any>
- Files modified: index.tsx (registration)
```

### Step 7 — Post-Create Guidance

Output:

> "Template `<TemplateName>` created at `<outputPath>/templates/<TemplateName>.tsx`.
>
> Registered in `index.tsx` as `templates.{rjsfPropName}`.
>
> Next steps:
> - `/rjsf-template grid` — configure responsive column layout (if object template)
> - `/rjsf-template list` — verify all template registrations
> - `/rjsf-field list` — check field widths work with the new grid"

---

## Subcommand: `list`

### Step 1 — Scan Templates

1. Read `{outputPath}/index.tsx` and extract the `templates` prop passed to `<Form>`.
2. Use Glob to find all files in `{outputPath}/templates/`.
3. For each template, determine:
   - Template type (from the props type it uses)
   - File path
   - Whether it's registered in `index.tsx`
   - Whether it has grid/responsive layout

### Step 2 — Display

```
## Templates in <FormName>

### Registered Templates (in index.tsx)
| Type | RJSF Prop | Component | File | Grid? |
|------|-----------|-----------|------|-------|
| object | ObjectFieldTemplate | SectionTemplate | templates/SectionTemplate.tsx | 3-col desktop |
| array-item | ArrayFieldItemTemplate | ContactItemTemplate | templates/ContactItemTemplate.tsx | 2-col |

### Built-in (RJSF defaults — no custom override)
| Type | RJSF Prop | Status |
|------|-----------|--------|
| array | ArrayFieldTemplate | Using default |
| field | FieldTemplate | Using default |
| base-input | BaseInputTemplate | Using default |
| title | TitleFieldTemplate | Using default |
| description | DescriptionFieldTemplate | Using default |
| error-list | ErrorListTemplate | Using default |

### Unregistered Files (exist but not imported in index.tsx)
| File | Likely type |
|------|-------------|
| (none, or list any orphaned template files) |
```

---

## Subcommand: `grid`

### Step 1 — Identify Target

If a section name is provided (`/rjsf-template grid <section>`), target that section. If no section is provided, list all sections and ask: "Which section's grid layout do you want to configure? Or type 'all' for all sections."

### Step 2 — Show Current Grid Config

Read the ObjectFieldTemplate (or SectionTemplate) and display the current layout:

```
## Current Grid Layout: <SectionName>

| Breakpoint | Columns | CSS |
|------------|---------|-----|
| Mobile (default) | 1 | grid-template-columns: 1fr |
| Tablet (≥640px) | 2 | grid-template-columns: repeat(2, 1fr) |
| Desktop (≥1024px) | 3 | grid-template-columns: repeat(3, 1fr) |

### Field Widths
| Field | Current Width | Grid Span |
|-------|---------------|-----------|
| firstName | half | 1 col |
| lastName | half | 1 col |
| email | full | all cols |
| bio | full | all cols |
| phone | quarter | 1 col |
```

### Step 3 — Collect New Layout

Ask:

> "New column layout:
>
> A) **1 column** — all breakpoints (simple vertical stack)
> B) **2 columns** — mobile: 1, tablet+desktop: 2
> C) **3 columns** — mobile: 1, tablet: 2, desktop: 3
> D) **4 columns** — mobile: 1, tablet: 2, desktop: 4
> E) **Custom** — specify columns per breakpoint
>
> Current: <current config>"

If "Custom": ask for mobile, tablet, and desktop column counts separately.

Then for each field, ask if the current width (full/half/quarter) should change. Show the full field list with current widths and let the developer override any.

### Step 4 — Generate and Apply

1. Update the ObjectFieldTemplate's grid CSS:
   - **CSS Modules/SCSS/Plain CSS:** Update the `.formGrid` class with new `grid-template-columns` and media queries
   - **Tailwind:** Update grid utility classes (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`)
   - **MUI:** Update `Grid` container `columns` and item `xs`/`sm`/`md`/`lg` props
   - **Chakra:** Update `SimpleGrid` `columns` responsive object
   - **Bootstrap:** Update `col-12 col-sm-6 col-lg-4` class combinations

2. Update field width classes/props for any changed fields.

3. Show the diff and ask for confirmation before writing.

4. Write changes, update session.json and changelog.

### Step 5 — Verify

After applying, output the new layout in a visual representation:

```
## New Layout Preview: <SectionName>

### Desktop (≥1024px) — 3 columns
┌──────────────┬──────────────┬──────────────┐
│ firstName    │ lastName     │ phone        │
├──────────────┴──────────────┴──────────────┤
│ email (full width)                         │
├──────────────┬──────────────┬──────────────┤
│ city         │ state        │ zip          │
├──────────────┴──────────────┴──────────────┤
│ bio (full width)                           │
└────────────────────────────────────────────┘

### Mobile (default) — 1 column
┌────────────────────────────────────────────┐
│ firstName                                  │
├────────────────────────────────────────────┤
│ lastName                                   │
├────────────────────────────────────────────┤
│ phone                                      │
├────────────────────────────────────────────┤
│ email                                      │
└────────────────────────────────────────────┘
```

> "Grid layout updated. Run `/rjsf-field list` to verify field widths."
