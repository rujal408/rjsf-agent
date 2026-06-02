---
name: rjsf-execute
description: Phase 4 — generate all React/RJSF code: schema.ts, uiSchema.ts, types.ts, index.tsx, and custom components
allowed-tools: [Read, Write, Edit, Glob, Bash]
---

# RJSF Execution — Phase 4

**Trigger:** `/rjsf-execute` — or invoked automatically by `/rjsf-build` as Phase 4.

---

## Step 1 — Read Session & Artifacts

1. Resolve the active session path (see `references/session-pattern.md` Section 0). Let `sessionDir` = `.rjsf/sessions/{formName}/`. Read `{sessionDir}/session.json`.
2. Confirm `phases["3"].status` is `"completed"` or `"awaiting_client_approval"`. If neither: stop and say: "Please confirm client approval of the prototype first. Once they approve, tell me 'client approved' to continue."
3. Verify `{sessionDir}/form-plan.json` exists. If missing: "form-plan.json not found. Regenerate the plan with `/rjsf-plan`."
4. Read `{sessionDir}/form-plan.md` for human context and review.
5. Read `{sessionDir}/prototype.html` as the visual reference.
6. If `phases["1.5"].status` is `"completed"`, read `{sessionDir}/enhanced-brief.md` — specifically the `## Enhancement Choices` and `## Customization Summary` sections. Extract all visual polish decisions (section grouping style, label positioning, required field indicators, help text display, error display style, submit button style, empty array states). These will be applied in Step 7.5. If `enhanced-brief.md` does not exist or Phase 1.5 was skipped, proceed without it — use sensible defaults.

**Do NOT bulk-load reference files.** The CLI generates code that already embeds correct types, patterns, and styles. Only read specific reference files when needed for custom component implementation (Step 6).

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

**No MUI Grid / Ant Design / Bootstrap / Tailwind / Chakra grid files** — the SectionTemplate uses inline styles for the grid. If the developer needs approach-specific grid code, the CLI can be extended later or the template can be manually adjusted.

---

## Step 6 — Complete Stub Files (LLM-DRIVEN)

For each file marked `[STUB]` in the CLI output:

1. Read the stub file
2. Read `references/rjsf-widget-api.md` for the specific component type (WidgetProps, FieldProps, or template props)
3. Read `references/typescript-pitfalls.md` for type safety patterns
4. Implement the component body — this is where LLM creativity is needed

**Key rules for custom widgets:**
- Use `WidgetProps<FormNameData>` with the generic parameter (never bare `WidgetProps`)
- Match visual density from the SectionTemplate (same colors, padding, border-radius)
- Meet 44px minimum touch target height
- Include `aria-required` and `aria-invalid` attributes
- Handle `rawErrors` display

**Key rules for custom fields:**
- Use `FieldProps<FieldDataType>` with the specific sub-type
- Create and export a dedicated interface for the field's data shape

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
> **Next step:** Run `/rjsf-test` to generate tests for your form, or import it directly and start using it.
>
> To make changes later, run `/rjsf-iterate "describe what to change"`.
