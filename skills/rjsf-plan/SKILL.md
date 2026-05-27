---
name: rjsf-plan
description: Phase 2 — design form layout, widget choices, column structure, and identify custom components needed
allowed-tools: [Read, Write, Glob]
---

# RJSF Form Planning — Phase 2

**Trigger:** `/rjsf-plan` or invoked automatically by `/rjsf-build` as Phase 2

---

## Overview

Phase 2 takes the RequirementsBrief produced in Phase 1 and designs the full form structure: layout decisions per section, widget/field/template customization assessment, step map (if multi-step), async fields map, and a complete FormPlan document ready for prototype generation.

---

## Step 1 — Read Session & Artifacts

1. Read `.rjsf/session.json` using the format described in `references/session-pattern.md`.
2. Read `.rjsf/requirements-brief.md` produced by Phase 1.
3. Read `references/layout-principles.md` for column and widget layout heuristics.
4. Read `references/customization-decision-tree.md` for widget vs field vs template decisions.
5. Read `references/rjsf-schema-patterns.md` for the widget-to-schema-type mapping table used in Step 3.

**Guard clause:** If `phases["1"].status` is not `"completed"`, stop and say: "Phase 1 must be completed first. Run `/rjsf-requirements`."

**Phase 1.5 check:** If `phases["1.5"]` exists in session.json:
- If `phases["1.5"].status` is `"completed"`: read `.rjsf/enhanced-brief.md` as the primary requirements source (it contains the enhanced brief with the developer's UI/UX choices applied). Still read `.rjsf/requirements-brief.md` as a fallback if the enhanced brief is missing.
- If `phases["1.5"].status` is not `"completed"`: advise "Run `/rjsf-suggest` first for UI/UX enhancement suggestions, or proceed with the base requirements." Let the developer choose whether to skip or run Phase 1.5.

If `phases["1.5"]` does not exist in session.json (legacy sessions before Phase 1.5 was added), proceed with `.rjsf/requirements-brief.md` directly.

Do not proceed until Phase 1 is complete.

---

## Step 2 — Ask Styling Preference (if not already in session.json)

Check `session.json` for a `stylingApproach` key.

**If `stylingApproach` already exists in `session.json`**, skip this step and proceed with the saved value.

**If `rjsfTheme` is a UI library theme**, auto-set `stylingApproach` without asking — the library ships its own responsive grid system and a separate CSS approach is redundant:

| `rjsfTheme` value | Auto-set `stylingApproach` | Tell developer |
|---|---|---|
| `@rjsf/mui` | `"mui-grid"` | "Using MUI Box/Grid with `sx` breakpoint props for responsive layout — matches your MUI theme." |
| `@rjsf/antd` | `"antd-grid"` | "Using Ant Design Row/Col with responsive span props — matches your Ant Design theme." |
| `@rjsf/bootstrap` | `"bootstrap-grid"` | "Using Bootstrap responsive grid classes (col-12 col-sm-6 col-lg-4) — matches your Bootstrap theme." |

Write the auto-set value to `session.json` and proceed without asking.

**If `rjsfTheme` is `@rjsf/core`** (no built-in grid), ask the developer:

> "Which styling approach for generated components?
>
> A) CSS Modules (.module.css)
> B) SCSS (.module.scss or .scss)
> C) Tailwind CSS utility classes
> D) Plain CSS (single .css file)
> E) Chakra UI (SimpleGrid — only if Chakra UI is already a project dependency)
> F) No styles — bare structure only"

Wait for the developer's answer, then save it to `session.json` under the key `stylingApproach` using these canonical values:

| Choice | Value saved |
|--------|-------------|
| A | `"css-modules"` |
| B | `"scss"` |
| C | `"tailwind"` |
| D | `"plain-css"` |
| E | `"chakra"` |
| F | `"bare"` |

Write the full `session.json` object back to disk (not a partial merge) after saving `stylingApproach`.

---

## Step 3 — Layout Decisions Per Section

For each section defined in the RequirementsBrief, apply the heuristics from `references/layout-principles.md` to decide:

### Column Count Rules (Responsive Spec)

Generate a responsive column spec for every section — not a single fixed count. Default (mobile) is always 1 column; tablet (≥640px) and desktop (≥1024px) scale up based on field count.

| Field count in section | Mobile (default) | Tablet ≥640px | Desktop ≥1024px |
|---|---|---|---|
| 1–2 fields | 1 column | 1 column | 1 column |
| 3–4 fields | 1 column | 2 columns | 2 columns |
| 5–8 fields | 1 column | 2 columns | 3 columns |
| 9+ fields | 1 column | 2 columns | 3–4 columns |

- Multi-step form → apply these rules independently to each step; do not share column counts across steps.
- If `responsive: false` in the RequirementsBrief (desktop-only form), you may assign a single fixed column count without breakpoints.
- Full-width fields (`col-full`) always span all columns regardless of breakpoint.

### Widget Assignment Per Field
- Apply the widget table from `references/rjsf-schema-patterns.md` to assign the appropriate standard widget to each field.
- If the standard widget is insufficient for a field's UX requirements (e.g., needs custom styling, compound input, non-standard interaction), **mark that field for a custom Widget**.
- If multiple inputs must appear under a single label as one logical unit, **mark that field for a custom Field** (not just a widget).

### uiSchema Hints
For each field, assign relevant `uiSchema` properties where they add clarity or improve UX:
- `ui:order` — enforce field ordering within a section
- `ui:placeholder` — helpful hint text inside the input
- `ui:options` — widget-specific options (e.g., `rows` for textarea, `accept` for file upload)
- `ui:help` — supplemental help text shown below the field
- `ui:widget` — explicit widget override when schema type alone is ambiguous
- `ui:field` — explicit field override for custom Fields

Document layout decisions in the FormPlan as a table per section:

```markdown
### Section: <section name>
**Responsive cols:** mobile: 1 | tablet (≥640px): <N> | desktop (≥1024px): <N>

| Field | Schema type | Widget | uiSchema hints | Full-width? | Custom? |
|-------|-------------|--------|----------------|-------------|---------|
```

---

## Step 4 — Customization Assessment

Using `references/customization-decision-tree.md`, evaluate every field and produce the following section for the FormPlan.

**Phase 1.5 propagation check:** If `.rjsf/enhanced-brief.md` exists, read its "Enhancement Choices" section. For each enhancement that chose a custom widget, field, or template (not "keep as-is"), that component MUST appear in the Customization Assessment below. Cross-reference every enhancement choice and include it. If the decision tree would not normally require that component, add it anyway with "Why" = "Developer chose this in Phase 1.5 enhancement [N]".

### Output format

```markdown
## Customization Assessment

### Standard RJSF covers:
- <list each field name that requires no custom component>

### Custom components needed:

#### Widgets (single input control)
| Component name | Field | Why standard is insufficient | RJSF API |
|----------------|-------|------------------------------|----------|

#### Fields (multiple inputs under one label)
| Component name | Field | Why | RJSF API |
|----------------|-------|-----|----------|

#### Templates (group layout)
| Component name | Scope | Why | RJSF API |
|----------------|-------|-----|----------|
```

If, after applying the decision tree, no custom components are needed, write instead:

```markdown
## Customization Assessment

Standard RJSF covers all fields. No custom components required.
```

---

## Step 5 — Step Map (multi_step forms only)

Only include this section if the RequirementsBrief has `multi_step: true`.

Produce a step map listing every wizard step in order:

```markdown
## Step Map
| Step | Key | Title | Fields | Validates on Next |
|------|-----|-------|--------|-------------------|
| 1 | <step_key> | <step title> | <comma-separated field names> | yes |
```

- **Key** — camelCase identifier for the step, e.g. `personalInfo`
- **Fields** — all fields visible in that step
- **Validates on Next** — always `yes` for every step. Step-level validation before advancing is mandatory (see `references/validation-strategy.md` § Strategy 2). Each step gets its own sub-schema containing only that step's fields and required constraints. `formRef.current.validateForm()` validates only the current sub-schema on "Next" click. Deferring validation to final submit allows users to skip required fields without feedback. Never write `no` in this column.
- **Cross-step validation** — if `cross_field_validation: true` in the RequirementsBrief, check whether the related fields span different steps. If so, add a note in the Step Map: "Cross-step rule: [field A] (Step X) → [field B] (Step Y): [rule]". Phase 4 will implement this as a final validation pass in `handleSubmit()`.

---

## Step 6 — Async Fields Map (if async flags present)

Include this section if the RequirementsBrief has `async_options: true` or `async_field_validation: true`.

```markdown
## Async Fields
| Field | Async type | Trigger | Endpoint hint |
|-------|------------|---------|---------------|
| province | options from API | country value changes | GET /api/provinces?country={value} |
| username | field validation on blur | on blur | GET /api/users/check?username={value} |
```

- **Async type** — `"options from API"` (dynamic enum/oneOf) or `"field validation on blur"` (server-side validation)
- **Trigger** — what causes the async call (e.g., another field's value change, on blur, on submit)
- **Endpoint hint** — inferred REST endpoint with placeholder tokens; developer will confirm or correct in Phase 4

If neither flag is set, omit this section entirely.

---

## Step 7 — Produce FormPlan, Show, Save

### 7a. Assemble FormPlan

Combine all sections produced in Steps 3–6 into a single markdown document with this structure:

```markdown
# Form Plan: <Form Title from RequirementsBrief>

**Generated:** <today's date>
**Styling:** <stylingApproach value>
**Multi-step:** <yes | no>
**Responsive:** <yes | no — from RequirementsBrief responsive flag>

---

## Section Layout Decisions
<output from Step 3>

---

## Customization Assessment
<output from Step 4>

---

## Step Map
<output from Step 5, or omit if not multi-step>

---

## Async Fields
<output from Step 6, or omit if no async flags>
```

### 7b. Display in Chat

Show the full FormPlan to the developer in the chat window.

### 7c. Ask for Approval

Ask:

> "Does this plan look right? Any layout or component changes before we build the prototype?"

Wait for the developer's response. If they request changes, apply them and re-display the updated FormPlan. Repeat until the developer approves.

### 7d. Save on Approval

Once the developer approves:

1. Write the final FormPlan to `.rjsf/form-plan.md`.
2. Update `session.json`:
   - Set `phases["2"].status = "completed"`
   - Set `currentPhase = "2.5"`
   - Set `phases["2"].completedAt` to the current ISO 8601 timestamp.
   - Set `phases["2"].artifactPath` to `".rjsf/form-plan.md"`.
   - Initialize `phases["2.5"]` with status `"pending"` if it doesn't exist.
   - Write the full session.json object (not a partial merge).

---

## Step 8 — End-of-Phase Prompt

After saving, output:

> "Form plan saved to `.rjsf/form-plan.md`.
>
> **Next step:** Run `/rjsf-technical` to configure technical decisions, or `/rjsf-build` to continue automatically."
