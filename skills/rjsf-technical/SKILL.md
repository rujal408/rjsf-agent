---
name: rjsf-technical
description: Phase 2.5 — present technical decisions (schema version, validator, submission pattern, styling, code structure) as grouped A/B/C options before code generation
argument-hint: []
allowed-tools: [Read, Write, Glob]
---

# RJSF Technical Decisions — Phase 2.5

**Trigger:** `/rjsf-technical` — or invoked automatically by `/rjsf-build` after Phase 2 completes.

Present technical decisions that affect generated code as grouped A/B/C options. These are decisions that Phase 4 would otherwise make silently. The developer chooses explicitly, or accepts defaults.

---

## Step 1 — Read Session & Artifacts

1. Read `.rjsf/session.json`.
2. Read `.rjsf/form-plan.md` (FormPlan from Phase 2).
3. Read `.rjsf/requirements-brief.md` (or `.rjsf/enhanced-brief.md` if Phase 1.5 was completed).
4. Read `references/technical-defaults.md` for all decision keys, defaults, and options.

**Guard clause:** If `phases["2"].status` is not `"completed"`, stop and say:

> "Phase 2 (Planning) must be completed first. Run `/rjsf-plan`."

**Resume check:** If `phases["2.5"].status` is `"completed"`:
- Read `session.json → technicalChoices` and display the current choices.
- Ask: "Phase 2.5 is already complete. Use these technical choices or redo?"
- If reuse: set `currentPhase = 3` and stop (advise running `/rjsf-prototype`).
- If redo: reset `phases["2.5"].status` to `"pending"` and proceed to Step 2.

---

## Step 2 — Filter Relevant Decisions

Not all 17 decisions apply to every form. Filter based on the RequirementsBrief flags:

| Decision Key | Only show when... |
|---|---|
| `draftSaveInterval` | `draft_save: true` in RequirementsBrief |
| `serverErrorShape` | `server_error_mapping: true` in RequirementsBrief |
| `formContextUsage` | Any custom widget or field exists in the FormPlan Customization Assessment |

All other decisions are always shown.

---

## Step 3 — Present Decisions as Grouped Options

Present decisions in 4 groups. For each decision, show:

```
**[N]. [Decision Name]**
Current default: [default option letter + name]

  A) **[Option name]** — [description]
  B) **[Option name]** — [description]
  C) **[Option name]** — [description] (if applicable)

  Default: [A/B/C] — [why this is the default]
```

### Group 1: Schema & Validation

Present decisions: `schemaVersion`, `validator`, `validationTiming`, `html5Validation`, `omitExtraData`

### Group 2: Form Behavior

Present decisions: `submissionPattern`, `successBehavior`, `serverErrorShape` (if applicable), `draftSaveInterval` (if applicable)

### Group 3: Layout & Styling

Present decisions: `formWrapper`, `breakpoints`, `touchTargetSize`, `gridGap`, `colorPalette`

### Group 4: Code Structure

Present decisions: `typeStyle`, `conditionalApproach`, `formStateManagement`, `formContextUsage` (if applicable)

### End of Decisions

After all groups, add:

> **Reply with your choices (e.g., "1A, 2B, 5B, 9C") or describe adjustments.**
> Type **"all defaults"** to accept every default.
> Type **"skip"** to use all defaults without reviewing.
>
> Decisions you don't mention will use their defaults.

---

## Step 4 — Collect Responses and Build Choices Object

1. Wait for the developer's response.
2. Parse their choices:
   - **Numbered choices** (e.g., "1A, 5B, 9C"): apply each selected option.
   - **"all defaults"** or **"skip"**: use default value for every decision.
   - **Partial choices** (e.g., "5B, 9C"): apply specified choices, use defaults for the rest.
   - **"custom" for breakpoints or colorPalette**: ask follow-up questions for the custom values.
3. Build the `technicalChoices` object using keys from `references/technical-defaults.md`.

### Follow-up for Custom Values

If developer chose `breakpoints: "custom"`:
> "Enter your breakpoints: tablet breakpoint in px (e.g., 640) and desktop breakpoint in px (e.g., 1024):"

Store as: `"breakpoints": { "tablet": 640, "desktop": 1024 }`

If developer chose `colorPalette: "custom"`:
> "Enter your color values (hex):
> - Border color (default #d1d5db):
> - Focus ring color (default #2563eb):
> - Error color (default #dc2626):
> - Primary/accent color (default #2563eb):"

Store as: `"colorPalette": { "border": "#...", "focus": "#...", "error": "#...", "primary": "#..." }`

---

## Step 5 — Show Summary and Confirm

Display a compact summary of all choices:

```
## Technical Choices Summary

| Category | Decision | Choice | Custom? |
|----------|----------|--------|---------|
| Schema | JSON Schema version | Draft-07 | default |
| Schema | Validator | ajv8 | default |
| Schema | Validation timing | onSubmit | default |
| Schema | HTML5 validation | disabled | changed |
| Schema | Omit extra data | enabled | changed |
| Behavior | Submission pattern | async-loading | default |
| Behavior | Success behavior | callback | changed |
| Layout | Form wrapper | full-width | changed |
| Layout | Breakpoints | standard (640/1024px) | default |
| Layout | Touch targets | 44px | default |
| Layout | Grid gap | default (16/24px) | default |
| Layout | Colors | neutral | default |
| Code | TypeScript style | per-section | default |
| Code | Conditionals | if/then/else | default |
| Code | State management | local-hooks | default |
```

Ask: "Approve these technical choices? Phase 4 will use them for code generation."

---

## Step 6 — Save Choices

Once the developer approves:

1. **Write the artifact.** Create `.rjsf/technical-choices.md` containing the summary table from Step 5 plus the raw `technicalChoices` JSON object.

2. **Update `session.json`:**
   - Set `technicalChoices` to the built choices object from Step 4.
   - Set `phases["2.5"].status = "completed"`.
   - Set `phases["2.5"].completedAt` to current ISO 8601 timestamp.
   - Set `phases["2.5"].artifactPath` to `".rjsf/technical-choices.md"`.
   - Set `currentPhase = "3"`.
   - Write the full session.json object (not a partial merge).

---

## Step 7 — End-of-Phase Prompt

After saving, display:

> Technical choices saved to `.rjsf/technical-choices.md`.
>
> **Next step:** Run `/rjsf-prototype` to generate the client prototype, or `/rjsf-build` to continue automatically.
