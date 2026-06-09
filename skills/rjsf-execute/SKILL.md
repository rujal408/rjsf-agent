---
name: rjsf-execute
description: "[Internal] Phase 4 — generate all React/RJSF code: schema.ts, uiSchema.ts, types.ts, index.tsx, and custom components. Invoked by /rjsf-form."
allowed-tools: [Read, Write, Edit, Glob, Bash]
---

# RJSF Execution — Phase 4

**Trigger:** Invoked internally by `/rjsf-form` as Phase 4. Not a user-facing command — use `/rjsf-form` instead.

---

## Step 1 — Read Session & Artifacts

1. Resolve the active session path. Let `sessionDir` = `.rjsf/sessions/{formName}/`. Read `{sessionDir}/session.json`.
2. Confirm `phases["3"].status` is `"completed"` or `"awaiting_client_approval"`. If neither: stop and say: "Please confirm client approval of the prototype first. Once they approve, tell me 'client approved' to continue."
3. Verify `{sessionDir}/form-plan.json` exists. If missing: "form-plan.json not found. Regenerate the plan with `/rjsf-plan`."
4. Read `{sessionDir}/form-plan.md` for human context and review.
5. Read `{sessionDir}/prototype.html` as the visual reference.
6. If `phases["1.5"].status` is `"completed"`, read `{sessionDir}/enhanced-brief.md` — specifically the `## Enhancement Choices` and `## Customization Summary` sections. Extract all visual polish decisions (section grouping style, label positioning, required field indicators, help text display, error display style, submit button style, empty array states). These will be applied in Step 7.5. If `enhanced-brief.md` does not exist or Phase 1.5 was skipped, proceed without it — use sensible defaults.

7. **Read EXACTLY ONE design patterns file** based on the theme. Read ONLY the matching file — do NOT read the others:
   - `@rjsf/mui` → read `references/design-examples/mui-design-patterns.md`
   - `@rjsf/chakra-ui` or `stylingApproach: "chakra"` → read `references/design-examples/chakra-design-patterns.md`
   - `stylingApproach: "tailwind"` → read `references/design-examples/daisyui-design-patterns.md`
   - `@rjsf/antd` → read `references/design-examples/core-css-design-patterns.md` (Ant Design has built-in styling; use core patterns as structural reference)
   - `@rjsf/fluent-ui` → read `references/design-examples/core-css-design-patterns.md` (Fluent UI has built-in styling; use core patterns as structural reference)
   - `@rjsf/semantic-ui` → read `references/design-examples/core-css-design-patterns.md` (Semantic UI has built-in styling; use core patterns as structural reference)
   - `@rjsf/bootstrap-4` → read `references/design-examples/core-css-design-patterns.md` (Bootstrap has built-in styling; use core patterns as structural reference)
   - `@rjsf/core` (any styling) → read `references/design-examples/core-css-design-patterns.md`

8. **Read matching example form** from `examples/src/forms/` as a UI reference. Use Glob to check if examples exist, then read the one matching the selected theme:

   | Theme / Styling | Example directory |
   |---|---|
   | `@rjsf/mui` | `examples/src/forms/mui/` |
   | `@rjsf/chakra-ui` or `stylingApproach: "chakra"` | `examples/src/forms/chakra/` |
   | `stylingApproach: "tailwind"` | `examples/src/forms/daisyui/` |
   | `@rjsf/core` (css-modules, scss, plain-css, bare) | `examples/src/forms/core-css/` |
   | Any other theme (antd, fluent-ui, semantic-ui, bootstrap-4) | `examples/src/forms/mui/` (closest production-quality reference) |

   - Read all `.tsx` and `.ts` files in the matched directory (usually one form component).
   - Also read `examples/src/forms/shared-schema.ts` — it shows the canonical schema/uiSchema/types pattern shared across all examples.
   - Extract and note: component structure, section template pattern, grid layout approach, submit state machine, success/error UI, button styling, import conventions.
   - Use these patterns as a **visual and structural reference** when generating code — match the same component style, spacing, and UX quality. Do NOT copy verbatim; adapt to the current form's requirements.
   - If the example directory does not exist or contains no `.tsx` files, skip this step silently.

9. Read `references/frontend-design-audit.md` for the 15 design audit principles. This is used during Step 8 verification to ensure generated code meets usability, accessibility, and design quality standards.

**TOKEN BUDGET: Do NOT read any other reference files here.** The CLI generates code with correct types and patterns built in. Only read `references/rjsf-widget-api.md` later in Step 6 IF the form has custom widgets/fields. Only read `references/typescript-pitfalls.md` later in Step 6 IF you are writing custom component code.

---

## Step 2 — Mark Client Approval (if prototype was awaiting)

If `phases["3"].status` is `"awaiting_client_approval"` and the developer says "client approved", "yes", "approved", or similar:
- Set `phases["3"].status = "completed"`, `phases["3"].completedAt = <ISO timestamp>`.
- Write full session.json (not partial merge).
- Proceed to Step 3.

If `phases["3"].status` is already `"completed"`, skip this step.

---

## Step 3 — Check for Missing Flags

Scan the form-plan.json `edgeCaseFlags`. If ANY of the following flags are missing or ambiguous, ask the developer before proceeding — do NOT silently default:

| Flag | If missing, ask... |
|---|---|
| `errorDisplay` | "How should validation errors be displayed? A) Inline below fields only (recommended). B) Top summary + inline. C) Top summary only." |
| `responsive` | "Should this form be responsive for mobile/tablet? A) Yes. B) Desktop only." |
| `editMode` | "Does this form need an edit mode? A) Yes. B) No." |
| `draftSave` | "Should the form auto-save drafts to localStorage? A) Yes. B) No." |
| `serverErrorMapping` | "Will your server return field-level errors? A) Yes. B) No." |

Only ask about genuinely missing flags. Wait for answers before proceeding.

---

## Step 4 — Show Decisions Summary

Display a compact summary of ALL decisions that will affect generated output:

```
## Decisions Applied to Code Generation

### From Session
| Decision | Value |
|----------|-------|
| RJSF theme | <rjsfTheme> |
| Styling approach | <stylingApproach> |
| Validator | <validator> |

### From FormPlan
| Decision | Value |
|----------|-------|
| Sections | <count> sections |
| Multi-step | <yes/no> |
| Columns (per section) | <section>: mobile:<N>/tablet:<N>/desktop:<N> |

### Custom Components to Generate
| Type | Component | For Field |
|------|-----------|-----------|
| (from customization.widgets/fields/templates) |

### Edge Case Flags (true only)
| Flag | Value |
|------|-------|
| (list only true flags) |

### Visual Polish (from Phase 1.5)
| Decision | Chosen Style |
|----------|-------------|
| Section grouping | <bordered cards / flat dividers / color-banded headers / default> |
| Labels | <floating / top-aligned / left-aligned / default> |
| Required indicators | <asterisk on required / "(optional)" on optional / color highlight / default> |
| Help text | <inline below field / tooltip icon (?) / expandable accordion / default> |
| Submit button | <full-width primary / right-aligned / split Save Draft + Submit / default> |
| Empty array state | <illustrated with CTA / plain "No items" text / default> |

*(If Phase 1.5 was skipped, show "default" for all rows and note: "No Phase 1.5 enhancements — using RJSF defaults. Visual polish can be customized later via `/rjsf-iterate`.")*
```

Ask: "This is what I'll generate. Approve to proceed, or change any decision."

Wait for approval.

---

## Step 5 — Generate Scaffolding via CLI

### 5a. Dry run first

```bash
npx tsx tools/rjsf-cli/src/index.ts scaffold --session-dir {sessionDir} --output-dir {outputPath} --dry-run
```

Show the file tree to the developer. Confirm the output path.

### 5b. Generate files

```bash
npx tsx tools/rjsf-cli/src/index.ts scaffold --session-dir {sessionDir} --output-dir {outputPath}
```

The CLI generates:
- `templates/SectionTemplate.tsx` — visual skeleton with grid layout per section
- `rjsf-overrides.css` — base CSS fixes for RJSF defaults
- `FormGrid.module.css` (or equivalent per styling approach) — responsive grid
- `schema.ts` — JSON Schema with proper oneOf humanization for enums
- `uiSchema.ts` — widget assignments, inline radio, placeholders
- `types.ts` — TypeScript interfaces matching schema 1:1
- `index.tsx` — main form component with submit state machine
- Custom widget/field stubs (marked `[STUB]`) if customization was specified

### 5c. Apply design patterns polish

After the CLI generates the scaffolding, **enhance the generated files** using the design patterns reference (Step 1.7) and the example form (Step 1.8) as references. The CLI produces a functional baseline, but the design patterns and examples provide the polished, production-quality versions. Apply:

- **`rjsf-overrides.css`**: The CLI now generates **theme-aware CSS** — raw `input`/`select`/`textarea` selectors for `@rjsf/core` only, framework class selectors for UI library themes. **NEVER add raw element selectors when using MUI/Antd/Bootstrap/Chakra/Fluent/Semantic UI** — this breaks click/type interactions. If enhancing the CSS, use the design patterns file matching the theme.
- **`templates/SectionTemplate.tsx`**: Enhance with the section grouping style chosen in Phase 1.5 (or default to Style A: bordered cards). Use framework-specific components (e.g., `Box`/`Paper` for MUI, `Box`/`SimpleGrid` for Chakra, DaisyUI classes for Tailwind).
- **`index.tsx`**: Apply the form card wrapper, success/error alerts, and submit button style from the design patterns. Replace bare `<div>` wrappers with proper styled containers. Add animated alert transitions where the framework supports it.
- **Array templates**: If the form has arrays, use the empty state and array item card patterns from the design patterns file instead of bare RJSF defaults.
- **Step indicator**: If multi-step, use the step indicator component from the design patterns file.

Use the **Design Token Reference** table at the bottom of the patterns file for consistent colors, spacing, border-radius, and typography values across all files.

---

## Step 5.5 — TypeScript Error Prevention Rules (MANDATORY)

All code written in Steps 6, 7, and 7.5 MUST follow these rules. **Do NOT read `references/typescript-pitfalls.md` — the critical rules are inlined below.**

### Import Rules
- **Always use `import type` for type-only imports:** `import type { WidgetProps, FieldProps, RJSFSchema } from '@rjsf/utils'`
- **Never use `import type` for values used at runtime:** `import { useState } from 'react'` (NOT `import type`)
- **Do NOT import `React` unless explicitly using `React.xxx` (e.g., `React.createElement`).** Modern React with JSX transform (`jsx: 'react-jsx'`, used by Vite) does not require `import React`.
- **Named imports from generated files:** `import { schema } from './schema'` (value), `import type { MyFormData } from './types'` (type-only)

### Nullable / Optional Access Rules
- **Never use non-null assertion `!` on array index access.** Use `undefined` checks or nullish coalescing:
  ```typescript
  // BAD: parts[i]!
  // GOOD: const key = parts[i]; if (key === undefined) continue;
  // GOOD: const key = parts[i] ?? '';
  ```
- **Always null-check `formData` from RJSF events:** `if (!data.formData) return;`
- **Use `??` (nullish coalescing) instead of `||` for default values** when `0`, `''`, or `false` are valid values.
- **For optional chaining `?.`:** Only use on types that are actually nullable/optional. Do NOT use `?.` on non-nullable types — TypeScript will error.

### Type Safety Rules
- **Always parameterize RJSF generics:** `Form<MyFormData>`, `WidgetProps<MyFormData>`, `ErrorSchema<MyFormData>`, `UiSchema<MyFormData>`, `IChangeEvent<MyFormData>`
- **Initialize `ErrorSchema` state with cast:** `useState<ErrorSchema<T>>({} as ErrorSchema<T>)` — bare `{}` may not satisfy the type.
- **Use `CustomValidator<T>` for customValidate**, not `(formData: T, errors: ErrorSchema<T>) => ...`
- **Match schema ↔ interface types exactly:** `integer` → `number`, conditional fields → optional `?`, enums → string literal union

---

## Step 6 — Complete Stub Files (LLM-DRIVEN)

**If no `[STUB]` files exist in the CLI output, skip this entire step — do NOT read any reference files.**

For each file marked `[STUB]` in the CLI output:

1. Read the stub file
2. Read `references/rjsf-widget-api.md` (only now — not earlier) for the component type API
3. Implement the component body — this is where LLM creativity is needed

**Do NOT read `references/typescript-pitfalls.md` — the critical rules are already in Step 5.5 above.**

**Key rules for custom widgets:**
- Use `WidgetProps<FormNameData>` with the generic parameter (never bare `WidgetProps`)
- Do NOT add `import React from 'react'` — the JSX transform handles this
- Match visual density from the SectionTemplate (same colors, padding, border-radius)
- Meet 44px minimum touch target height
- Include `aria-required` and `aria-invalid` attributes
- Handle `rawErrors` display

**Key rules for custom fields:**
- Use `FieldProps<FieldDataType>` with the specific sub-type
- Create and export a dedicated interface for the field's data shape
- Do NOT add `import React from 'react'`

---

## Step 7 — Apply Edge Case Handlers (LLM-DRIVEN)

For each **true** flag in `edgeCaseFlags` that requires code changes to the generated `index.tsx`, read the file and apply targeted modifications:

| Flag | What to add |
|---|---|
| `draftSave` | Add localStorage persistence: `DRAFT_KEY`, `localFormData` state, `handleChange` with `localStorage.setItem`, merge with `formData` prop. Handle `QuotaExceededError`. |
| `computedFields` | Add `useEffect` or `handleChange` that computes derived field values. Set `readonly: true` in schema for computed fields. |
| `roleBased` | Add `role` prop, compute `roleUiSchema` with `useMemo` that hides admin-only fields for non-admin roles. |
| `viewMode` | Create companion `<FormName>View.tsx` with `<dl>` display of submitted data. |
| `i18n` | Create `translations.ts` with locale objects. |
| `printExport` | Add print button and `@media print` CSS. |
| `arrayReorder` | Create `SortableArrayTemplate.tsx` using `@dnd-kit`. Register in templates. |
| `multiStep` | Replace single-page index.tsx with wizard variant: per-step sub-schemas, `validateForm()` on Next, StepIndicator. |
| `crossFieldValidation` | Add `customValidate` function for cross-field rules (e.g., confirmPassword === password). |

**Do NOT add handlers for false flags.** Only modify the generated code for flags that are explicitly true.

For each handler, make targeted edits to the existing generated files — do not regenerate from scratch.

---

## Step 7.5 — Apply Visual Polish from Phase 1.5 (LLM-DRIVEN)

### THIS IS THE ONLY PHASE WHERE VISUAL POLISH IS APPLIED

Phase 1.5 visual polish decisions are intentionally NOT applied to the HTML prototype (Phase 3). The prototype is a plain structural preview for client sign-off. All visual polish from Phase 1.5 is applied HERE — to the real React/RJSF code — and nowhere else in the pipeline.

If `enhanced-brief.md` was read in Step 1, locate the `## Visual Polish Decisions` section (or the `## Enhancement Choices` section for visual polish entries). Apply each visual polish decision to the correct generated file. If Phase 1.5 was skipped, skip this step entirely.

For each visual polish category, make targeted edits to the already-generated files:

| Decision | Target File(s) | What to Apply |
|----------|----------------|---------------|
| **Section grouping** | `templates/SectionTemplate.tsx` | Bordered cards: wrap each section in a `<div>` with `border`, `border-radius`, `padding`, and optional `box-shadow`. Flat dividers: add `<hr>` or `border-bottom` between sections. Color-banded headers: add a colored top bar or background to section headings. |
| **Label positioning** | `rjsf-overrides.css` and/or `uiSchema.ts` | Floating labels: add CSS for `.field-label` with `position: absolute` transform pattern. Top-aligned: ensure `display: block` on labels (RJSF default). Left-aligned (horizontal): add `display: flex; align-items: center` on `.form-group` with fixed label width. |
| **Required indicators** | `rjsf-overrides.css` | Asterisk on required: style `.field-required::after { content: " *"; color: red }`. "(optional)" on optional: add `.field-optional::after { content: " (optional)"; color: gray; font-size: 0.85em }`. Color highlight: add left border or background tint to required fields. |
| **Help text display** | `uiSchema.ts`, `rjsf-overrides.css` | Inline below field: use `ui:help` property per field (RJSF default). Tooltip icon: add `ui:options.helpIcon: true` and style a `(?)` icon with CSS tooltip on hover/focus. Expandable accordion: wrap help text in a collapsible `<details>` element via CSS. |
| **Submit button style** | `index.tsx` | Full-width: add `width: 100%` to submit button. Right-aligned: wrap in `<div style={{ display: 'flex', justifyContent: 'flex-end' }}>`. Split buttons: render both "Save Draft" (secondary, calls `onSaveDraft`) and "Submit" (primary) buttons side by side. |
| **Empty array state** | `templates/SectionTemplate.tsx` or array template | Illustrated empty: add an empty-state `<div>` with an SVG/icon, descriptive text, and an "Add first item" CTA button. Plain text: use RJSF default "No items" message. |

**Rules:**
- Make targeted edits to existing generated files — do not regenerate from scratch.
- Match the styling approach from session (`css-modules`, `scss`, `plain-css`, `styled-components`, etc.) — do not mix approaches.
- Ensure visual polish matches the prototype's appearance. Cross-reference `prototype.html` if a decision seems ambiguous.
- If a decision conflicts with an edge case flag (e.g., error display chosen in both Step 3 and Phase 1.5), the developer's Step 3 answer takes precedence.

---

## Step 8 — Review & Verify

### Checklist

- [ ] All files from CLI output exist at `{outputPath}/`
- [ ] No `[STUB]` files remain unimplemented
- [ ] Custom components have full implementations (not just TODO placeholders)
- [ ] Edge case handlers are correctly integrated into index.tsx
- [ ] Schema sections match SectionTemplate column config (no orphaned fields)
- [ ] Enum fields use `oneOf` with human-readable `title` (CLI handles this automatically)
- [ ] Radio buttons with ≤5 short options have `ui:options.inline: true` (CLI handles this)
- [ ] `rjsf-overrides.css` is imported in index.tsx (CLI handles this)
- [ ] `SectionTemplate` is registered as `ObjectFieldTemplate` (CLI handles this)
- [ ] Every section with 3+ half-width fields uses ≥2 desktop columns
- [ ] Visual polish decisions from Phase 1.5 are reflected in generated CSS/templates/uiSchema (if Phase 1.5 was completed)
- [ ] Generated code matches prototype visual appearance for non-structural elements (section grouping, labels, help text, submit button)
- [ ] Design patterns from `references/design-examples/` applied: form card wrapper, polished CSS overrides, styled alerts, proper button bar, design tokens consistent across all files
- [ ] Input states are styled (hover, focus ring, error, disabled, placeholder) — not just default browser styling
- [ ] Submit button has proper loading state (spinner + disabled) and hover effects
- [ ] Success state shows a styled confirmation (not just plain text)
- [ ] Error alerts use styled, dismissable alert components (not bare `<div>` with inline color)
- [ ] Generated code follows the same component structure, submit state machine, and UI quality as the matching example form from `examples/src/forms/` (if example was read in Step 1.8)

### Design Audit Pass (from `references/frontend-design-audit.md`)
- [ ] **Visibility of System Status (#1):** Submit button has loading state; async fields show spinners; multi-step forms show progress indicator
- [ ] **Match System & Real World (#2):** Labels use domain-appropriate language; placeholders show realistic examples; date/number formats match user locale
- [ ] **User Control & Freedom (#3):** Back button in wizards preserves data; array items can be removed; cancel doesn't destroy entered data
- [ ] **Consistency (#4):** Required indicators are uniform; error message format is consistent; button hierarchy (primary/secondary) is maintained
- [ ] **Error Prevention (#5):** Formatted fields use masks or constrained inputs; date pickers used instead of free-text; disabled submit until required fields filled (if applicable)
- [ ] **Recognition Over Recall (#6):** Placeholder hints on all text fields; help text visible near complex fields; section headings describe required information
- [ ] **Flexibility & Efficiency (#7):** Tab order is logical; form supports keyboard-only operation; autofill-compatible input attributes (`name`, `type`)
- [ ] **Aesthetic & Minimalist Design (#8):** Conditional fields hidden until triggered; whitespace is balanced; no decorative elements without function
- [ ] **Error Recovery (#9):** Inline errors next to fields; first error field receives focus on submit failure; valid fields are not cleared on error
- [ ] **Accessibility (#13):** All fields have `<label>` elements; custom widgets have `aria-required`/`aria-invalid`; focus indicators are visible; touch targets >= 44px; color contrast meets WCAG AA
- [ ] **Perceptibility (#14):** Input text >= 16px; error states use color AND icon/text; section boundaries are visually distinct
- [ ] **Tolerance (#15):** Whitespace trimmed before validation; case-insensitive where appropriate (email); form not reset on single field error

Read any file that seems potentially wrong and fix issues before proceeding.

---

## Step 9 — Full Preview

Show the complete file tree in chat:

```
Written to <outputPath>/:
├── templates/
│   └── SectionTemplate.tsx
├── rjsf-overrides.css
├── FormGrid.module.css         (if css-modules/scss/plain-css)
├── widgets/
│   └── <CustomWidget>.tsx      (if any)
├── fields/
│   └── <CustomField>.tsx       (if any)
├── schema.ts
├── uiSchema.ts
├── types.ts
└── index.tsx
```

Show key file contents (schema.ts, index.tsx) if the developer wants to review.

---

## Step 10 — Update Session

1. Update `session.json`:
   - `phases["4"].status = "completed"`
   - `phases["4"].completedAt = <ISO timestamp>`
   - `phases["4"].artifactPath = "index.tsx"`
   - `outputPath = "<confirmed path>"`
   - `currentPhase = "5"`
   - Write full session.json (not partial merge).

2. Output:

> Files written to `<outputPath>/`.
>
> Phase 4 complete. Continuing pipeline...
