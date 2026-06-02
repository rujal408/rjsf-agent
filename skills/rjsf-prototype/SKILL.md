---
name: rjsf-prototype
description: Phase 3 — generate a self-contained HTML prototype for client sign-off before any React code is written
allowed-tools: [Read, Write, Glob, Bash]
---

# RJSF Prototype Generation — Phase 3

**Trigger:** `/rjsf-prototype` — or invoked automatically by `/rjsf-build` as Phase 3.

---

## Step 1 — Read Session & Verify Prerequisites

1. Resolve the active session path (see `references/session-pattern.md` Section 0). Let `sessionDir` = `.rjsf/sessions/{formName}/`. Read `{sessionDir}/session.json`.
2. If `phases["2"].status` is not `"completed"`, stop and tell the user:
   > "Phase 2 (Planning) must be completed first. Run `/rjsf-plan`."
3. Verify `{sessionDir}/form-plan.json` exists (this is the CLI's input). If missing, tell the user:
   > "form-plan.json not found. Regenerate the plan with `/rjsf-plan` — it now outputs both form-plan.md and form-plan.json."
4. If `phases["3"].status` is `"awaiting_client_approval"` or `"completed"`:
   - Tell the user: "A prototype already exists at `{sessionDir}/prototype.html`. Regenerate it (overwrites existing file), or open the existing one for review?"
   - Wait for the user's choice. Only proceed to Step 2 if they choose to regenerate.

---

## Step 2 — Generate Prototype via CLI

### IMPORTANT: Prototype is a Plain Structural Preview

The HTML prototype exists for **client sign-off on structure, fields, and layout only**. It must NOT include any visual polish decisions from Phase 1.5 (section grouping style, label positioning, required field indicators, help text display, error display style, submit button style, empty array state). Those visual enhancements are applied exclusively during Phase 4 (React/RJSF code generation).

The prototype should show:
- Correct field types and labels (structural enhancements from Phase 1.5 ARE included — e.g., masked inputs, date pickers, autocomplete)
- Section layout and column structure from the form plan
- Conditional show/hide logic
- Multi-step navigation (if applicable)
- Required field markers (standard asterisk only)
- Basic default styling — clean, functional, unstyled beyond basic readability

Run the CLI tool from the plugin root:

```bash
npx tsx tools/rjsf-cli/src/index.ts prototype --session-dir {sessionDir}
```

Verify the command exits with code 0. If it fails, read the error message and diagnose:
- "form-plan.json not found" → Phase 2 needs to be re-run with the updated skill that outputs JSON
- "session.json not found" → wrong session directory path
- Validation errors → fix the form-plan.json and retry

---

## Step 3 — Review Generated Output

Read the generated `{sessionDir}/prototype.html` and verify:

1. **All sections** from form-plan.json are present with correct titles
2. **Column counts** match the FormPlan (e.g., Profile section uses `grid-2` if columns.desktop = 2)
3. **Field types** match (select vs radio vs text vs textarea)
4. **Required markers** (`*`) are on all required fields
5. **Conditional fields** have show/hide JS if conditionals exist in the plan
6. **Multi-step navigation** works (if multi_step is true): step dots, Back/Next/Submit buttons
7. **Full-width fields** (textarea, file upload) span the full grid with `col-full` class
8. **Per-field width enforcement**: sections with 3+ half-width fields use `grid-2` or higher

9. **No visual polish applied** — confirm the prototype does NOT include Phase 1.5 visual polish (custom section grouping styles, label positioning overrides, fancy required indicators, tooltip help text, custom error display, styled submit buttons, illustrated empty states). If any visual polish leaked in, strip it back to plain defaults.

If any issue is found, fix it by editing the generated HTML directly with the Edit tool.

---

## Step 4 — Update Session & Prompt

1. Update `{sessionDir}/session.json`:
   - `phases["3"].status = "awaiting_client_approval"`
   - `phases["3"].artifactPath = "prototype.html"`
   - Write the full session.json object (not a partial merge).
2. Output:

> Prototype written to `{sessionDir}/prototype.html`. Open it in any browser to preview.
>
> **Share this file with your client.** Once they confirm the layout and fields are correct, come back and run `/rjsf-build` (or just say 'client approved') to proceed to implementation.
>
> The prototype limitations are noted at the top of the file so your client understands what's simplified.
