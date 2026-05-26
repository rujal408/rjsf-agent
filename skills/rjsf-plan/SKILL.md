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

**Guard clause:** If `phases["1"].status` in `session.json` is not `"completed"`, stop and tell the developer:

> "Phase 1 must be completed first. Run `/rjsf-requirements`."

Do not proceed until Phase 1 is complete.

---

## Step 2 — Ask Styling Preference (if not already in session.json)

Check `session.json` for a `stylingApproach` key. If it is absent or empty, ask the developer:

> "Which styling approach for generated components?
>
> A) CSS Modules (.module.css)
> B) Tailwind CSS utility classes
> C) Plain CSS (single .css file)
> D) No styles — bare structure only"

Wait for the developer's answer, then save it to `session.json` under the key `stylingApproach` using these canonical values:

| Choice | Value saved |
|--------|-------------|
| A | `"css-modules"` |
| B | `"tailwind"` |
| C | `"plain-css"` |
| D | `"bare"` |

Write the full `session.json` object back to disk (not a partial merge) after saving `stylingApproach`.

If `stylingApproach` already exists in `session.json`, skip this step and proceed with the saved value.

---

## Step 3 — Layout Decisions Per Section

For each section defined in the RequirementsBrief, apply the heuristics from `references/layout-principles.md` to decide:

### Column Count Rules
- 1–2 fields in the section → **1 column**
- 3–4 fields → **2 columns**
- 5 or more fields → **3 columns**
- Multi-step form → apply these rules independently to each step; do not share column counts across steps

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
**Columns:** <1 | 2 | 3>

| Field | Schema type | Widget | uiSchema hints | Custom? |
|-------|-------------|--------|----------------|---------|
```

---

## Step 4 — Customization Assessment

Using `references/customization-decision-tree.md`, evaluate every field and produce the following section for the FormPlan.

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
| 1 | <step_key> | <step title> | <comma-separated field names> | <yes / no> |
```

- **Key** — camelCase identifier for the step, e.g. `personalInfo`
- **Fields** — all fields visible in that step
- **Validates on Next** — `yes` if clicking "Next" triggers validation of the current step's fields before advancing; `no` if validation is deferred to final submit

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
   - Set `currentPhase = 3`
   - Set `phases["2"].completedAt` to the current ISO 8601 timestamp.
   - Set `phases["2"].artifactPath` to `".rjsf/form-plan.md"`.
   - Write the full session.json object (not a partial merge).

---

## Step 8 — End-of-Phase Prompt

After saving, output:

> "Form plan saved to `.rjsf/form-plan.md`.
>
> **Next step:** Run `/rjsf-prototype` to generate the client prototype, or `/rjsf-build` to continue automatically."
