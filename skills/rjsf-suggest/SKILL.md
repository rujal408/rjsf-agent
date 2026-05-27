---
name: rjsf-suggest
description: Phase 1.5 — analyze requirements and proactively suggest UI/UX enhancements using widgets, fields, templates, and layout options. Presents A/B/C choices for every complex decision.
argument-hint: []
allowed-tools: [Read, Write, Glob]
---

# RJSF Feature Suggestions — Phase 1.5

**Trigger:** `/rjsf-suggest` — or invoked automatically by `/rjsf-build` after Phase 1 completes.

After gathering raw requirements, proactively analyze the form and suggest UI/UX enhancements the developer may not have considered. Present every suggestion as A/B/C options so the developer makes informed choices — not yes/no guesses.

---

## Step 1 — Read Session & Artifacts

1. Read `.rjsf/session.json`.
2. Read `.rjsf/requirements-brief.md` (RequirementsBrief from Phase 1).
3. Read `references/customization-decision-tree.md` for widget vs field vs template decisions.
4. Read `references/rjsf-schema-patterns.md` for available widget types.
5. Read `references/rjsf-widget-api.md` for WidgetProps, FieldProps, template interfaces.

**Guard clause:** If `phases["1"].status` is not `"completed"`, stop and tell the developer:

> "Phase 1 must be completed first. Run `/rjsf-requirements`."

**Resume check:** If `phases["1.5"].status` is `"completed"`:
- Read and display the existing `.rjsf/enhanced-brief.md`.
- Ask: "Phase 1.5 is already complete. Use these enhancements or redo suggestions?"
- If reuse: set `currentPhase = 2` and stop (advise running `/rjsf-plan`).
- If redo: reset `phases["1.5"].status` to `"pending"` and proceed to Step 2.

---

## Step 2 — Analyze RequirementsBrief for Enhancement Opportunities

Evaluate each field and section against the tables below. For every match, queue a suggestion for Step 3.

### Field-Level Enhancement Triggers

| If the field is... | Suggest options for... |
|---------------------|------------------------|
| A plain text input for phone, SSN, credit card, or zip code | Custom masked-input widget with format preview vs plain input |
| A text input for email or URL | Input with real-time format validation indicator vs plain input |
| A long text field (notes, description, bio) | Rich text editor widget vs auto-resizing textarea vs plain textarea |
| A date field | Date picker widget vs native date input vs date range field (if paired) |
| A select with 5+ static options | Searchable autocomplete widget vs grouped dropdown vs standard select |
| A select whose options depend on another field | Cascading async select with loading states vs two independent selects |
| A file upload field | Drag-and-drop upload widget with preview vs basic file input |
| A numeric field (price, quantity, rating) | Slider widget vs stepper vs plain number input |
| A boolean field | Toggle switch widget vs checkbox vs radio (Yes/No) |
| A color value | Color picker widget vs text hex input |
| Multiple related inputs (start/end date, address parts, name prefix/first/last) | Compound custom field (single label + error) vs separate individual fields |
| A password field with confirmation | Password with strength meter widget + confirm field vs two plain password inputs |
| An array of simple strings (tags, emails, skills) | Tag/chip input widget vs standard array with text inputs |

### Form-Level Enhancement Triggers

| If the form has... | Suggest options for... |
|---------------------|------------------------|
| 8+ fields in a single section | Multi-step wizard vs accordion sections vs single long page |
| 3+ sections | Tab layout vs stacked sections vs wizard steps |
| Nested arrays (items with sub-items) | Tag/chip input vs inline table vs full nested form |
| Array fields with 3+ sub-fields per item | Card-style array template vs table rows vs expandable/collapsible rows |
| Array fields where order matters | Drag-to-reorder template (@dnd-kit) vs up/down buttons vs fixed order |
| Required fields alongside many optional ones | Progressive disclosure (show optional on demand) vs all fields visible |
| Repetitive field groups (e.g., multiple contacts) | Repeatable section template with add/remove/clone |
| Read-only data mixed with editable fields | Split layout (summary + editable) vs all fields with read-only toggle |
| Long forms used on mobile | Bottom-anchored sticky submit button vs scroll-to-top submit |
| Forms with complex validation | Inline validation on blur vs validate on submit vs live validation |

### Visual Polish Triggers

| If the form needs... | Suggest options for... |
|----------------------|------------------------|
| Section grouping | Bordered card sections vs flat divider lines vs color-banded headers |
| Field labels | Floating labels (inside input) vs top-aligned labels vs left-aligned (horizontal) |
| Required field indicators | Asterisk (*) on required vs "(optional)" tag on optional vs color highlight |
| Help text | Inline below field vs tooltip icon (?) vs expandable help accordion |
| Error display | Inline below field only vs top summary + inline vs toast notification |
| Submit button | Full-width primary button vs right-aligned vs split (Save Draft + Submit) |
| Empty state for arrays | Illustrated empty state with CTA vs simple "No items" text |

---

## Step 3 — Present Suggestions as Numbered A/B/C Options

Group all suggestions by category (Field Enhancements, Form Layout, Visual Polish). Present them in a single message using this format for each suggestion:

### Format

```
### [Category Name]

**[N]. [Field/Section Name] — [What this improves]**

Current spec: [what the brief says]
RJSF can do better here. Choose an approach:

  A) **[Option name]** — [1-sentence description].
     Best for: [when to use this option].
     RJSF: [which extension point — widget / field / template / uiSchema only]

  B) **[Option name]** — [1-sentence description].
     Best for: [when to use this option].
     RJSF: [extension point]

  C) **Keep as-is** — [Standard behavior, no customization].
     Best for: [simplicity / minimal scope / tight deadline].
     RJSF: built-in

  Recommendation: [A or B] — [reason tied to the form's purpose and user persona from the brief]
```

### Rules for Generating Suggestions

1. **Always include a "Keep as-is" option** (usually C) — never force customization.
2. **Always include a recommendation** with reasoning based on the form's purpose and user persona.
3. **Always name the RJSF extension point** (widget, field, template, uiSchema) so the developer knows the technical cost.
4. **Skip suggestions where the current spec is already optimal** — don't pad with unnecessary choices.
5. **Limit to 12 suggestions maximum** — prioritize highest-impact enhancements. If more than 12 triggers match, group minor ones under a "Quick Wins" section with single-line recommendations.
6. **Number suggestions sequentially** across all categories (1, 2, 3... not restarting per category).

### Example Output

```
## Feature Suggestions for Loan Application Form

Based on your requirements brief, here are UI/UX enhancements RJSF supports.
Pick your preferred approach for each — or type "all defaults" to accept every recommendation.

---

### Field Enhancements

**1. Phone Number — Input formatting & validation**

Current spec: text input, required, type "tel"

  A) **Masked Input Widget** — Auto-formats as (___) ___-____ while typing.
     Prevents invalid characters, shows format hint.
     Best for: public-facing forms where input accuracy matters.
     RJSF: custom widget (WidgetProps)

  B) **Phone Widget (country + number)** — Separate country code dropdown +
     formatted number field, stored as "+1|4155552671".
     Best for: international forms with varied phone formats.
     RJSF: custom widget (WidgetProps)

  C) **Keep as plain text input** — Standard tel input, no formatting.
     Best for: internal tools where phone format isn't critical.
     RJSF: built-in

  Recommendation: B — your form serves international applicants, so country
  code support prevents ambiguous numbers.

---

**2. Employment Dates — Related date inputs**

Current spec: separate startDate and endDate text fields

  A) **Date Range Field** — Start and end date side-by-side under one label
     with built-in "end must be after start" validation.
     Best for: any paired date input — cleaner than two separate fields.
     RJSF: custom field (FieldProps)

  B) **Calendar Range Picker Widget** — Visual calendar where users click
     start and end on the same calendar view.
     Best for: booking/scheduling forms where visual date context matters.
     RJSF: custom widget (WidgetProps)

  C) **Keep as separate date inputs** — Two independent native date fields.
     Best for: when dates are not strongly related or validation isn't needed.
     RJSF: built-in

  Recommendation: A — employment dates are always a range, and the built-in
  cross-validation saves a customValidate rule.

---

### Form Layout

**3. Form Structure — 14 fields across 3 sections**

Current spec: single-page form

  A) **Multi-step Wizard** — One section per step with Back/Next navigation
     and per-step validation. Progress indicator at top.
     Best for: onboarding flows, applications, sequential completion.
     RJSF: custom template (ObjectFieldTemplateProps)

  B) **Accordion Sections** — All sections visible but collapsed by default.
     Users expand one section at a time.
     Best for: forms where users jump between sections or review before submit.
     RJSF: custom template (ObjectFieldTemplateProps)

  C) **Tab Layout** — Horizontal tabs, one section per tab. All accessible
     without scrolling.
     Best for: settings pages, profile forms with independent sections.
     RJSF: custom template (ObjectFieldTemplateProps)

  D) **Keep as single page** — All fields stacked vertically.
     Best for: short forms or when all fields must be visible at once.
     RJSF: built-in

  Recommendation: A — loan applications benefit from guided step-by-step
  progression so users don't skip required sections.

---

### Visual Polish

**4. Error Display — Validation error presentation**

Current spec: RJSF default (inline + top summary)

  A) **Inline only** — Errors appear below each invalid field. Clean, focused.
     Best for: most forms — users see errors exactly where they need to fix.
     RJSF: uiSchema configuration

  B) **Top summary + inline** — Red error list at top AND below each field.
     Best for: long forms where the top summary helps users see all issues.
     RJSF: uiSchema configuration

  C) **Top summary only** — Errors listed at top, none below fields.
     Best for: compact forms, but harder to locate specific field issues.
     RJSF: uiSchema configuration

  Recommendation: A — inline-only is cleaner and RJSF's default dual display
  feels redundant on wizard forms where each step has few fields.
```

### End of Suggestions

After all suggestions, add:

> **Reply with your choices (e.g., "1B, 2A, 3A, 4A") or describe adjustments.**
> Type **"all defaults"** to accept every recommendation.
> Type **"skip"** to keep the original brief unchanged and go straight to planning.

---

## Step 4 — Collect Responses and Apply

1. Wait for the developer's response.
2. Parse their choices:
   - **Numbered choices** (e.g., "1B, 2A, 3A"): apply each selected option.
   - **"all defaults"**: apply every recommendation.
   - **"skip"**: leave the brief unchanged, mark phase complete, proceed to Phase 2.
   - **Natural language adjustments**: interpret and map to the closest options.
3. For each chosen enhancement, update the RequirementsBrief:
   - Update the field's `Type` and `Notes` columns in the Sections & Fields table.
   - Update relevant Edge Case Flags (`masked_input`, `rich_text`, `array_reorder`, etc.).
   - Update Layout Intent if form structure changed (wizard, tabs, accordion).
   - Add new entries to Conditional Logic if progressive disclosure was chosen.

---

## Step 5 — Widget/Field/Template Summary

After applying choices, present a compact technical summary:

```
## Customization Summary

**Widgets** (custom input controls):
  - PhoneWidget — country code + masked number input [suggestion 1B]
  - FileUploadWidget — drag-and-drop with thumbnail preview [suggestion 5A]

**Fields** (compound inputs under one label):
  - DateRangeField — start + end date with cross-validation [suggestion 2A]

**Templates** (layout control):
  - WizardTemplate — multi-step navigation with per-step validation [suggestion 3A]
  - CardArrayItemTemplate — bordered card per array item [suggestion 6A]

**uiSchema only** (no custom code needed):
  - Error display: inline only [suggestion 4A]
  - Labels: top-aligned [suggestion 7A]

**Standard RJSF** (no customization):
  - firstName, lastName, email, age — built-in widgets
```

Ask: "This is what will be built. Approve to continue, or adjust any choices?"

---

## Step 6 — Save Enhanced Brief

Once the developer approves:

1. **Write the enhanced brief.** Create `.rjsf/enhanced-brief.md` containing:
   - The original RequirementsBrief content with all chosen enhancements applied inline.
   - A new `## Enhancement Choices` section at the bottom listing every suggestion number, the chosen option letter, and the RJSF extension point.
   - The Customization Summary from Step 5.

2. **Also update `.rjsf/requirements-brief.md`** in-place with the enhanced field types, flags, and layout changes — so that Phase 2 reads the enhanced version directly.

3. **Update `.rjsf/session.json`:**
   - Set `phases["1.5"].status = "completed"`.
   - Set `phases["1.5"].completedAt` to the current ISO 8601 timestamp.
   - Set `phases["1.5"].artifactPath` to `".rjsf/enhanced-brief.md"`.
   - Set `currentPhase = 2`.
   - Write the full session.json object (not a partial merge).

---

## Step 7 — End-of-Phase Prompt

After saving, display:

> Enhancements applied and saved to `.rjsf/enhanced-brief.md`.
> Requirements brief updated with your choices.
>
> **Next step:** Run `/rjsf-plan` to design the form structure and layout, or `/rjsf-build` to continue automatically.
