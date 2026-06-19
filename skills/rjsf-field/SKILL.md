---
name: rjsf-field
description: Add, list, edit, or remove fields in the active RJSF form session — updates schema, uiSchema, types, and templates
argument-hint: add|list|remove|edit <fieldName>
allowed-tools: [Read, Write, Edit, Glob, Bash]
---

# RJSF Field — Manage Form Fields

**Trigger:** `/rjsf-field <subcommand> [args]`

Granular, session-aware commands for managing individual fields in an RJSF form. Every change updates all affected files (schema.ts, uiSchema.ts, types.ts, index.tsx) and shows a diff before writing.

---

## Subcommands

| Subcommand | Usage | Description |
|------------|-------|-------------|
| `add` | `/rjsf-field add <fieldName>` | Add a new field to the active form |
| `list` | `/rjsf-field list` | List all fields with types, sections, and widgets |
| `remove` | `/rjsf-field remove <fieldName>` | Remove a field from all files |
| `edit` | `/rjsf-field edit <fieldName>` | Modify an existing field's type, validation, widget, or width |

---

## Preamble — Session Resolution (all subcommands)

1. Read `.rjsf/active-session` to get the active form name. If the file does not exist: stop and say: "No active session. Run `/rjsf-new <FormName>` first."
2. Let `sessionDir` = `.rjsf/sessions/{formName}/`. Read `{sessionDir}/session.json`.
3. Read `session.json` to get `outputPath`, `rjsfTheme`, and `stylingApproach`.
4. **Guard clause:** If `outputPath` is null or `phases["4"].status` is not `"completed"`: stop and say: "No generated form found. Run `/rjsf-form` first to generate the form, or use the full pipeline for initial form creation."
5. Read all generated files at `{outputPath}/`: `schema.ts`, `uiSchema.ts`, `types.ts`, `index.tsx`.
6. Read `references/frontend-design-audit.md` — use principles #5 (Error Prevention), #6 (Recognition Over Recall), and #13 (Accessibility) when configuring new fields.

---

## Subcommand: `add`

### Step 1 — Collect Field Details

If only the field name is provided, prompt the developer for each detail interactively. If the developer provides details inline (e.g., `/rjsf-field add phone --type=string --widget=tel --section=contact`), parse them directly.

Collect the following:

| Detail | Question | Default |
|--------|----------|---------|
| **Section** | "Which section should this field belong to?" (list existing sections from schema.ts) | First section |
| **Schema type** | "What data type? (string, number, integer, boolean, array, object)" | `string` |
| **Widget** | "Which widget?" (show options based on schema type — see Widget Table below) | Default for type |
| **Label** | "Display label?" | Auto-derived from camelCase field name |
| **Required** | "Is this field required? (yes/no)" | `no` |
| **Width** | "Field width in grid? (full, half, quarter)" | `half` |
| **Placeholder** | "Placeholder text?" | None |
| **Help text** | "Help text below the field?" | None |
| **Validation** | "Any validation rules?" (minLength, maxLength, pattern, min, max, format) | None |
| **Conditional** | "Show this field only when another field has a specific value? (yes/no)" | `no` |

#### Widget Table (by schema type)

| Schema type | Available widgets | Default |
|-------------|-------------------|---------|
| `string` | text, email, password, textarea, date, datetime, color, uri, tel, hidden | text |
| `string` (enum) | select, radio | select (≤4 options: radio) |
| `number` | updown, range | updown |
| `integer` | updown, range | updown |
| `boolean` | checkbox, select, radio | checkbox |
| `array` (enum items) | checkboxes, select (multi) | checkboxes |
| `array` (object items) | — (uses ArrayFieldTemplate) | — |

If the developer chooses a widget not in the built-in list, note it as a custom widget and inform: "This requires a custom widget. Run `/rjsf-widget create <WidgetName>` after adding the field."

### Step 2 — If Conditional, Collect Condition Details

If the developer said "yes" to conditional visibility:

| Detail | Question |
|--------|----------|
| **Trigger field** | "Which field controls visibility?" (list existing fields) |
| **Trigger value** | "Show this field when the trigger field equals what value?" |

The condition will be implemented as a JSON Schema `if/then` block or a `dependencies` entry.

### Step 3 — Generate Changes

Determine the exact changes needed in each file:

**`schema.ts`:**
- Add the field's property definition to the correct section object
- Add to `required` array if required
- If conditional: add `if/then` block or `dependencies` entry
- If enum: use `oneOf` with `{ const, title }` pairs for human-readable labels

**`uiSchema.ts`:**
- Add field entry with widget, placeholder, help text, and order
- Add `ui:widget` if not the default for the type
- Add `ui:placeholder` if provided
- Add `ui:help` if provided
- Add `ui:options` as needed (e.g., `{ rows: 5 }` for textarea, `{ inline: true }` for radio ≤5 options)
- Update `ui:order` array to include the new field

**`types.ts`:**
- Add the field to the TypeScript interface with the correct type
- Mark optional with `?` if not required
- Use string literal union for enum fields

**`index.tsx`** (if conditional):
- No direct changes needed — RJSF handles `if/then` and `dependencies` natively through schema

**Template files** (if the section uses a custom ObjectFieldTemplate):
- Verify the template's grid config includes the new field's width

### Step 4 — Show Diff Preview

For each affected file, show:

```
**schema.ts** — Adding field `<fieldName>` to section `<sectionName>`:

```diff
  properties: {
    existingField: { type: "string" },
+   <fieldName>: { type: "<type>", ... },
  }
```

```

Show all file diffs. Ask: "Apply these changes? Reply 'yes' to write, or tell me what to adjust."

### Step 5 — Write Changes

On confirmation:
1. Apply edits to each affected file using the Edit tool (not full rewrites).
2. Update `{sessionDir}/session.json`: set `lastModified` to current ISO timestamp.
3. Append to `{sessionDir}/form-plan.md` changelog:

```markdown
### <ISO timestamp> — Added field `<fieldName>` to section `<sectionName>`
- Type: <schemaType>, Widget: <widget>, Width: <width>, Required: <yes/no>
- Files changed: schema.ts, uiSchema.ts, types.ts
```

### Step 6 — Post-Add Guidance

Output:

> "Field `<fieldName>` added to `<outputPath>/`.
>
> Next steps:
> - `/rjsf-field list` — verify the field appears correctly
> - `/rjsf-widget create <WidgetName>` — if you chose a custom widget
> - `/rjsf-template grid` — to adjust the section's column layout
> - `/rjsf-test` — to regenerate tests covering the new field"

---

## Subcommand: `list`

### Step 1 — Parse All Fields

Read `schema.ts` and `uiSchema.ts`. For each field, extract:

| Property | Source |
|----------|--------|
| Field name | schema property key |
| Section | parent object key in schema |
| Schema type | `type` value |
| Widget | `ui:widget` from uiSchema, or default for type |
| Width | from template grid config or uiSchema |
| Required | presence in `required` array |
| Conditional | presence of `if/then` or `dependencies` referencing this field |
| Custom | whether it uses a custom widget, field, or template |

### Step 2 — Display as Table

```
## Fields in <FormName>

### Section: <SectionName>
| # | Field | Type | Widget | Width | Required | Conditional | Custom |
|---|-------|------|--------|-------|----------|-------------|--------|
| 1 | firstName | string | text | half | yes | — | — |
| 2 | email | string | email | half | yes | — | — |
| 3 | bio | string | textarea | full | no | — | — |
| 4 | role | string (enum) | select | half | yes | — | — |
| 5 | adminCode | string | text | half | no | role = "admin" | — |

### Section: <SectionName2>
...

**Total:** <N> fields across <M> sections
**Custom components:** <list or "none">
```

---

## Subcommand: `remove`

### Step 1 — Locate the Field

Search `schema.ts` for the field name. If not found: stop and say: "Field `<fieldName>` not found. Run `/rjsf-field list` to see all fields."

Identify:
- Which section contains the field
- Whether the field is in `required` array
- Whether any `if/then` or `dependencies` blocks reference it (as trigger or target)
- Whether a custom widget/field references it in uiSchema
- Whether any other field's conditional depends on this field

### Step 2 — Show Impact

```
## Removing `<fieldName>`

**Section:** <sectionName>
**Files affected:** schema.ts, uiSchema.ts, types.ts

**Warning:** <if other fields depend on this field conditionally>
  - Field `<otherField>` has a conditional dependency on `<fieldName>`.
    Removing it will also remove the conditional — `<otherField>` will become always visible.

**Custom component:** <if a custom widget exists for this field>
  - `widgets/<WidgetName>.tsx` will NOT be deleted (may be used elsewhere).
    Remove it manually if no longer needed.
```

Ask: "Proceed with removal? Reply 'yes' to apply."

### Step 3 — Apply Removal

1. Remove the field property from the schema section.
2. Remove from `required` array if present.
3. Remove or update `if/then`/`dependencies` blocks referencing this field.
4. Remove the field's entry from uiSchema.
5. Remove from `ui:order` array.
6. Remove the field from the TypeScript interface in types.ts.
7. Update `{sessionDir}/session.json`: set `lastModified` to current ISO timestamp.
8. Append removal to `{sessionDir}/form-plan.md` changelog.

### Step 4 — Confirm

> "Field `<fieldName>` removed from `<outputPath>/`.
>
> Run `/rjsf-field list` to verify. Run `/rjsf-test` to update tests."

---

## Subcommand: `edit`

### Step 1 — Locate and Show Current Config

Search `schema.ts` and `uiSchema.ts` for the field. Show current configuration:

```
## Current config for `<fieldName>`

| Property | Value |
|----------|-------|
| Section | <section> |
| Type | <schemaType> |
| Widget | <widget> |
| Width | <width> |
| Required | <yes/no> |
| Placeholder | <value or "none"> |
| Help text | <value or "none"> |
| Validation | <rules or "none"> |
| Conditional | <condition or "none"> |
```

### Step 2 — Collect Changes

Ask: "What would you like to change? You can modify any of: type, widget, width, required, placeholder, help text, validation, conditional, section."

The developer can specify one or multiple changes. Parse their response and validate:
- If changing type: warn about data compatibility (e.g., string → number may break existing data)
- If changing widget: verify the new widget is compatible with the schema type
- If changing section: this moves the field from one schema object to another

### Step 3 — Show Diff and Apply

Same as `add` Steps 4–5: show per-file diffs, wait for confirmation, write changes, update session.json and changelog.

> "Field `<fieldName>` updated in `<outputPath>/`.
>
> Run `/rjsf-test` to update tests if validation or type changed."
