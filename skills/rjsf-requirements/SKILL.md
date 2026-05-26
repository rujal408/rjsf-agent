# RJSF Requirements Gathering — Phase 1

**Trigger:** Invoked by `/rjsf-requirements` directly, or by `/rjsf-build` as Phase 1.

---

## Step 1 — Read Session

Check for `.rjsf/session.json` in the project root (see `references/session-pattern.md` for the full schema and read/write rules).

- **File does not exist:** This is a fresh start. Proceed to Step 2.
- **`phases["1"].status` is `"completed"`:**
  - Read and display the existing `.rjsf/requirements-brief.md` in chat.
  - Ask: "Phase 1 is already complete. Use this requirements brief or redo Phase 1?"
  - If the user wants to reuse it, set `currentPhase = 2` and stop (advise running `/rjsf-plan`).
  - If the user wants to redo, reset `phases["1"].status` to `"pending"` and proceed to Step 2.
- **`phases["1"].status` is `"in_progress"`:**
  - Load `.rjsf/requirements-brief.md` if it exists and display it.
  - Ask: "I found an in-progress requirements brief. Want to continue (I'll ask the remaining clarifying questions) or start fresh?"
  - If the user wants to continue: re-display the brief, then resume Step 4 (ask all clarifying questions whose topics are not already covered in the partial brief).
  - If the user wants to start fresh: delete `.rjsf/requirements-brief.md`, reset `phases["1"].status` to `"pending"`, and proceed from Step 2.
- **Otherwise (status is `"pending"` or field is absent):**
  - Set `phases["1"].status` to `"in_progress"` and `phases["1"].startedAt` to the current ISO 8601 timestamp.
  - Proceed fresh to Step 2.

---

## Step 2 — Read Input

Accept the client's form requirements in one of these ways:

1. **Inline text:** Text provided directly after the command (e.g., `/rjsf-requirements We need a patient intake form with …`).
2. **File flag:** A `--from <path>` flag pointing to a text or markdown file (e.g., `/rjsf-requirements --from docs/requirements.txt`). Read the file at the given path.
3. **Neither provided:** Ask the user: "Please paste your form requirements, or provide a file path with `--from <path>`."

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

---

## Step 4 — Clarifying Questions

Ask these questions **one at a time**. Skip any question that was already answered unambiguously in the input. Wait for the user's answer before asking the next question.

1. Which RJSF theme will this form use? (`@rjsf/core`, `@rjsf/mui`, `@rjsf/antd`, `@rjsf/bootstrap`)
2. Should this be a **multi-step wizard** or a **single-page form**?
3. Does the form need an **edit mode** (pre-populate fields from existing data)?
4. Is **draft saving / auto-save** required?
5. Are any fields **dependent on the user's role or permissions** (shown/hidden/locked based on role)?
6. Are any field **options loaded from an API** at runtime?
7. Are any fields **validated live against an API on blur** (e.g., username availability check)?
8. Will the **server return field-level errors** after form submission that must be mapped back to fields?
9. Are there any **cross-field validation rules** (e.g., end date must be after start date)?
10. Are there any **nested arrays** (e.g., a list of line items, each with sub-fields)?
11. Are there any **computed / derived fields** whose value is calculated from other fields?
12. Does any array need **item reordering** (drag-and-drop or up/down controls)?
13. For **file uploads**: should files be sent directly to a server endpoint, or encoded as base64 in the form payload?
14. Is a **read-only view mode** needed (same form rendered as non-editable)?
15. Should sections be displayed as **tabs** or as **stacked sections** on a single page?
16. Is **multi-language / i18n** required? If yes, which languages?
17. Are there any **masked or formatted input fields** (e.g., phone number, credit card, currency)?
18. Are there any **rich text / WYSIWYG fields**?
19. Is a **print or PDF export** action required?
20. Are there any **accessibility requirements** beyond RJSF defaults (e.g., WCAG AA compliance, specific ARIA labels)?

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
```

---

## Step 6 — Show, Confirm, Save

1. Display the RequirementsBrief in chat (rendered markdown).
2. Ask: "Does this capture everything correctly? Any changes before we move to planning?"
3. If the user requests changes: apply them directly to the RequirementsBrief (word changes, field corrections, flag changes). If they request new sections or major structural additions, re-run Step 3 with the updated input, then re-run Step 5, then re-display and re-confirm. Repeat until the user explicitly approves.
4. On explicit approval, perform the following writes:

   **a. Write the artifact:**
   Write the RequirementsBrief markdown to `.rjsf/requirements-brief.md`. Create the `.rjsf/` directory if it does not exist.

   **b. Create or update `.rjsf/session.json`:**
   - Set `version` to `"1.0.0"` (if initializing).
   - Set `formName` to a PascalCase version of the form title (e.g., "Patient Intake Form" → `"PatientIntakeForm"`).
   - Set `rjsfTheme` to the answer from clarifying question 1.
   - Set `phases["1"].status` to `"completed"`.
   - Set `phases["1"].completedAt` to the current ISO 8601 timestamp.
   - Set `phases["1"].artifactPath` to `".rjsf/requirements-brief.md"`.
   - Set `currentPhase` to `2`.
   - Leave all other phase entries at `"pending"` with `null` timestamps and artifact paths (initialize them if the file was not previously present).
   - Write the full session object (not a partial merge).

---

## Step 7 — End-of-Phase Prompt

After saving, display the following message:

> Requirements captured and saved to `.rjsf/requirements-brief.md`.
>
> **Next step:** Run `/rjsf-plan` to design the form structure and layout, or `/rjsf-build` to continue automatically.
