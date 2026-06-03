---
name: rjsf-requirements
description: Phase 1 — gather and clarify client form requirements, produce a structured RequirementsBrief
argument-hint: ["requirements text"] [--from file1.md file2.md ...] [--defaults]
allowed-tools: [Read, Write, Glob, Bash]
---

# RJSF Requirements Gathering — Phase 1

**Trigger:** Invoked by `/rjsf-requirements` directly, or by `/rjsf-build` as Phase 1.

---

## Step 1 — Read Session

Resolve the active session path. Let `sessionDir` = `.rjsf/sessions/{formName}/`. Read `{sessionDir}/session.json`.

- **File does not exist:** This is a fresh start. Proceed to Step 2.
- **`phases["1"].status` is `"completed"`:**
  - Read and display the existing `{sessionDir}/requirements-brief.md` in chat.
  - Ask: "Phase 1 is already complete. Use this requirements brief or redo Phase 1?"
  - If the user wants to reuse it, set `currentPhase = 2` and stop (advise running `/rjsf-plan`).
  - If the user wants to redo, reset `phases["1"].status` to `"pending"` and proceed to Step 2.
- **`phases["1"].status` is `"in_progress"`:**
  - Load `{sessionDir}/requirements-brief.md` if it exists and display it.
  - Ask: "I found an in-progress requirements brief. Want to continue (I'll ask the remaining clarifying questions) or start fresh?"
  - If the user wants to continue: re-display the brief, then resume Step 4 (ask all clarifying questions whose topics are not already covered in the partial brief).
  - If the user wants to start fresh: delete `{sessionDir}/requirements-brief.md`, reset `phases["1"].status` to `"pending"`, and proceed from Step 2.
- **Otherwise (status is `"pending"` or field is absent):**
  - Set `phases["1"].status` to `"in_progress"` and `phases["1"].startedAt` to the current ISO 8601 timestamp.
  - Proceed fresh to Step 2.

---

## Step 2 — Read Input

Accept the client's form requirements in one of these ways:

1. **Inline text:** Text provided directly after the command (e.g., `/rjsf-requirements We need a patient intake form with …`).
2. **File flag — single file:** A `--from <path>` flag pointing to a text or markdown file (e.g., `/rjsf-requirements --from docs/requirements.md`). Read the file at the given path.
3. **File flag — multiple files:** Multiple paths after `--from` (e.g., `/rjsf-requirements --from docs/fields.md docs/rules.md docs/layout.md`). Read all files and concatenate their contents in order, separated by `\n---\n`.
4. **File flag — directory:** A `--from <directory>` flag pointing to a folder (e.g., `/rjsf-requirements --from docs/form-specs/`). Use Glob to find all `*.md` and `*.txt` files in that directory (non-recursive), read each, and concatenate in alphabetical order separated by `\n---\n`.
5. **File flag — glob pattern:** A `--from <glob>` pattern (e.g., `/rjsf-requirements --from "docs/**/*.md"`). Use Glob to resolve matches, read each, and concatenate in alphabetical order.
6. **Neither provided:** Ask the user: "Please paste your form requirements, or provide a file path with `--from <path>` (supports multiple files, directories, and glob patterns)."

**Determining input mode:** After reading the input, classify it:

- **Short input** (under ~500 words, fewer than ~10 fields described): Use **Interactive Mode** — proceed to Step 3, then Step 4-Interactive.
- **Large input** (500+ words OR 10+ fields OR input came from file(s)): Use **Document Mode** — proceed to Step 3, then Step 3.5, then Step 4-Document.

The `--defaults` flag may be passed alongside any input mode. When present, any clarifying question not answerable from the input should be auto-resolved using the sensible defaults listed in Step 4 rather than asked to the user. The agent will note which defaults were applied in the coverage report.

Do not proceed to Step 3 until input is received.

---

## Step 3 — Extract Structure

Parse the input and extract the following elements. Infer sensible defaults where the input is ambiguous; flag any gaps to be resolved in Step 4.

- **Form title** — the name of the form.
- **Purpose** — who fills the form and why (one sentence).
- **User persona** — the type of user submitting the form (e.g., "patient", "admin", "applicant").
- **Sections** — logical groupings of fields (use a single default section if none are specified).
- **Fields** — for each field, capture:
  - `name` — the field identifier.
  - `type` — data type / widget hint (e.g., string, number, boolean, date, select, file, textarea).
  - `required` — whether the field is mandatory.
  - `validation` — any rules mentioned (min/max, pattern, format, etc.).
  - `options` — enumerated choices if applicable.
- **Conditional logic** — any "show X when Y equals Z" rules.
- **Layout hints** — any mentions of tabs, steps, columns, or ordering.

**Additionally (for all modes):** Scan the input for any information that answers the 23 clarifying questions listed in Step 4. For each question, record one of:
- **Answered** — the input explicitly or strongly implies an answer. Record the extracted answer and the source text that supports it.
- **Partially answered** — the input hints at an answer but is ambiguous. Record the best guess and flag for confirmation.
- **Not covered** — the input says nothing about this topic.

---

## Step 3.5 — Coverage Analysis (Document Mode only)

**Skip this step if using Interactive Mode.**

Present a structured coverage report to the user. This is the key orchestration step that prevents tedious one-by-one questioning for large documents.

### Format:

```
## 📋 Document Analysis Complete

**Source:** <file name(s) or "inline text"> — <word count> words, <field count> fields extracted

### Structure Extracted
- **Form title:** <title>
- **Purpose:** <purpose>
- **Sections:** <count> sections, <total field count> fields
- **Conditional rules:** <count> rules found
- **Layout hints:** <summary>

### Clarifying Questions — Auto-Resolved from Document

| # | Topic | Extracted Answer | Source |
|---|-------|-----------------|--------|
| 1 | RJSF theme | @rjsf/mui | "uses Material UI components" (line 12) |
| 2 | Form type | Multi-step wizard | "Step 1: Personal Info, Step 2: Address" (line 24) |
| … | … | … | … |

### Clarifying Questions — Needs Your Input

<Grouped by category, not one-by-one. See grouping below.>

**🔧 Technical Behavior** (questions 3, 4, 6, 7, 8)
3. Edit mode — pre-populate from existing data? 
4. Draft saving / auto-save?
6. Any field options loaded from API?
7. Any fields validated live against API on blur?
8. Server returns field-level errors after submission?

**📐 Layout & Display** (questions 15, 21, 22, 23)
…

**🔄 Advanced Features** (questions 10, 11, 12, 16, 17, 18, 19)
…

> Reply with answers to the numbered questions above, or type **"defaults for all"** to use sensible defaults, or **"defaults except 3, 6"** to answer only specific ones.
```

### Question grouping categories:

- **Core Setup** (Q1, Q2): Theme, form type — always ask if not answered.
- **Technical Behavior** (Q3, Q4, Q5, Q6, Q7, Q8, Q9): Edit mode, draft save, role-based, async options, async validation, server errors, cross-field validation.
- **Layout & Display** (Q15, Q20, Q21, Q22, Q23): Tabs vs stacked, accessibility, responsive, error display, UI reference.
- **Advanced Features** (Q10, Q11, Q12, Q13, Q14, Q16, Q17, Q18, Q19): Nested arrays, computed fields, reorder, file upload, view mode, i18n, masked input, rich text, print/PDF.

### Handling the user's reply:

- **"defaults for all"** or **"use defaults"**: Apply the default answer for every unanswered question (see defaults in Step 4). Proceed to Step 5.
- **"defaults except N, M, …"**: Ask only the listed question numbers, apply defaults for the rest.
- **Numbered answers** (e.g., "3: yes, 6: yes — /api/countries for country field, 8: no"): Record answers, apply defaults for any remaining unanswered questions, proceed.
- **Corrections to auto-resolved answers**: If the user says "Actually Q2 should be single-page", update the extracted answer. Re-display only the changed rows for confirmation.
- **Follow-up questions**: If the user's answers raise new questions (e.g., "yes, draft save" → "Save to localStorage or server endpoint?"), ask the follow-up immediately before proceeding.

---

## Step 4 — Clarifying Questions

### Step 4-Interactive (Short input / Interactive Mode)

Ask these questions **one at a time**. Skip any question that was already answered unambiguously in the input. Wait for the user's answer before asking the next question.

### Step 4-Document (Large input / Document Mode)

**This step is reached only after Step 3.5.** By this point, most questions are either auto-resolved or answered by the user's batch reply. Handle only:
- Questions the user explicitly answered in Step 3.5 that need follow-up clarification.
- Questions where the user's answer was ambiguous and needs one more exchange.

Ask remaining questions in a single grouped message (not one-by-one). If no questions remain, proceed directly to Step 5.

### The 23 Clarifying Questions (with defaults)

Each question below includes a **default** in brackets. When `--defaults` is passed or the user says "defaults for all", use these values.

1. Which RJSF theme will this form use? (`@rjsf/core`, `@rjsf/mui`, `@rjsf/antd`, `@rjsf/bootstrap`) **[default: `@rjsf/mui`]**
2. Should this be a **multi-step wizard** or a **single-page form**? **[default: single-page if ≤2 sections, multi-step if ≥3 sections]**
3. Does the form need an **edit mode** (pre-populate fields from existing data)? **[default: no]**
4. Is **draft saving / auto-save** required? **[default: no]**
5. Are any fields **dependent on the user's role or permissions** (shown/hidden/locked based on role)? **[default: no]**
6. Are any field **options loaded from an API** at runtime? **[default: no, unless input mentions API endpoints]**
7. Are any fields **validated live against an API on blur** (e.g., username availability check)? **[default: no]**
8. Will the **server return field-level errors** after form submission that must be mapped back to fields? **[default: no]**
9. Are there any **cross-field validation rules** (e.g., end date must be after start date)? **[default: no, unless input describes such rules]**
10. Are there any **nested arrays** (e.g., a list of line items, each with sub-fields)? **[default: no, unless input describes repeating groups]**
11. Are there any **computed / derived fields** whose value is calculated from other fields? **[default: no]**
12. Does any array need **item reordering** (drag-and-drop or up/down controls)? **[default: no]**
13. For **file uploads**: should files be sent directly to a server endpoint, or encoded as base64 in the form payload? **[default: base64 if file fields exist, skip if no file fields]**
14. Is a **read-only view mode** needed (same form rendered as non-editable)? **[default: no]**
15. Should sections be displayed as **tabs** or as **stacked sections** on a single page? **[default: stacked sections]**
16. Is **multi-language / i18n** required? If yes, which languages? **[default: no]**
17. Are there any **masked or formatted input fields** (e.g., phone number, credit card, currency)? **[default: no, unless input mentions phone/credit card/SSN formats]**
18. Are there any **rich text / WYSIWYG fields**? **[default: no]**
19. Is a **print or PDF export** action required? **[default: no]**
20. Are there any **accessibility requirements** beyond RJSF defaults (e.g., WCAG AA compliance, specific ARIA labels)? **[default: RJSF defaults only]**
21. Will this form be used on **mobile or tablet devices**? (yes / no / yes, primarily mobile — affects whether multi-column layouts collapse to 1-column on small screens and whether touch-target sizing is applied) **[default: yes, responsive]**
22. How should **validation errors** be displayed? RJSF shows errors both below each field AND in a summary at the top by default — this can look messy. Options:
    - **A) Inline only** (recommended) — errors appear below each invalid field only. Clean, focused.
    - **B) Top summary + inline** — a red error list at the top of the form AND errors below each field. More visible, but can feel redundant.
    - **C) Top summary only** — errors listed at the top, none below fields. Compact, but harder for users to find which field has an issue.
    **[default: A — inline only]**
23. Do you have a **UI prototype, mockup, or design file** to reference for the form's visual style? (optional — provide a file path or URL, or skip if none available. The agent will use it to match the final form's look & feel more closely.) **[default: none]**

---

## Step 5 — Produce RequirementsBrief

Once all relevant questions have been answered, compile the following document. Use the exact markdown structure shown below.

```markdown
# Requirements Brief: <Form Title>

## Purpose
<One sentence: who fills this form and why.>

## RJSF Theme
<theme name>

## Sections & Fields

### <Section Name>
| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| <name> | <type> | Yes/No | <rules> | <notes> |

## Conditional Logic
- Show `<fieldA>` when `<fieldB>` equals `<value>`
(list all conditions; write "None" if there are no conditions)

## Layout Intent
- Form type: single-page / multi-step / tabs
- <other layout notes>

## Edge Case Flags
- async_options: true/false — <which fields>
- cross_field_validation: true/false — <which rules>
- multi_step: true/false — <how many steps>
- edit_mode: true/false
- role_based: true/false — <which fields>
- draft_save: true/false
- async_field_validation: true/false — <which fields>
- server_error_mapping: true/false
- nested_arrays: true/false — <which fields>
- computed_fields: true/false — <which fields>
- array_reorder: true/false — <which arrays>
- file_upload_server: true/false
- view_mode: true/false
- tab_layout: true/false
- i18n: true/false — <languages>
- masked_input: true/false — <which fields>
- rich_text: true/false — <which fields>
- print_export: true/false
- responsive: true/false — <mobile / tablet / both>
- error_display: inline | both | top — <user preference for validation error placement>
- ui_reference: <file path or URL> | none — <optional external design mockup to match>
```

---

## Step 6 — Show, Confirm, Save

1. Display the RequirementsBrief in chat (rendered markdown).
2. Ask: "Does this capture everything correctly? Any changes before we move to planning?"
3. If the user requests changes: apply them directly to the RequirementsBrief (word changes, field corrections, flag changes). If they request new sections or major structural additions, re-run Step 3 with the updated input, then re-run Step 5, then re-display and re-confirm. Repeat until the user explicitly approves.
4. On explicit approval, perform the following writes:

   **a. Write the artifact:**
   Write the RequirementsBrief markdown to `{sessionDir}/requirements-brief.md`. Create the session directory if it does not exist.

   **b. Create or update `{sessionDir}/session.json`:**
   - Set `version` to `"2.0.0"` (if initializing).
   - Set `formName` to a PascalCase version of the form title (e.g., "Patient Intake Form" → `"PatientIntakeForm"`).
   - Set `rjsfTheme` to the answer from clarifying question 1.
   - Set `phases["1"].status` to `"completed"`.
   - Set `phases["1"].completedAt` to the current ISO 8601 timestamp.
   - Set `phases["1"].artifactPath` to `"requirements-brief.md"`.
   - Set `currentPhase` to `2`.
   - Leave all other phase entries at `"pending"` with `null` timestamps and artifact paths (initialize them if the file was not previously present).
   - Write the full session object (not a partial merge).

---

## Step 7 — End-of-Phase Prompt

After saving, display the following message:

> Requirements captured and saved to `{sessionDir}/requirements-brief.md`.
>
> **Next step:** Run `/rjsf-suggest` to get UI/UX enhancement suggestions, or `/rjsf-build` to continue automatically.
