---
name: rjsf-iterate
description: Modify an already-generated form without rerunning the full pipeline — shows a diff before writing
argument-hint: "description of change"
allowed-tools: [Read, Write, Edit, Glob, Bash]
---

# RJSF Iterate — Modify Existing Form

**Trigger:** `/rjsf-iterate "<description of change>"` — or invoked by `/rjsf-build` when the developer describes a change to an already-generated form.

---

## Step 1 — Read Session & Generated Files

1. Read `.rjsf/active-session` to get the active form name. If the file does not exist: stop and say: "No active session. Run `/rjsf-new <FormName>` first."
2. Let `sessionDir` = `.rjsf/sessions/{formName}/`. Read `{sessionDir}/session.json`.
3. If `outputPath` is null or `{outputPath}/schema.ts` does not exist: stop and say: "No form files found. Run `/rjsf-new <FormName>` to create a session with scaffolded files."
4. Read all files currently in `outputPath` (schema.ts, uiSchema.ts, types.ts, index.tsx, and any custom component files in widgets/, fields/, templates/).

---

## Step 2 — Classify the Change

Based on the developer's description, determine which files are affected. Show the developer a brief classification:

> "I'll update these files: [list]. Here's what will change: [one-line diff description]."

Use this table to determine affected files:

| Change type | Affected files |
|---|---|
| Add a new field | schema.ts, uiSchema.ts, types.ts, test file |
| Remove a field | schema.ts, uiSchema.ts, types.ts, test file |
| Rename a field | schema.ts, uiSchema.ts, types.ts, index.tsx, test file |
| Change field type or widget | schema.ts, uiSchema.ts (possibly a new custom widget file) |
| Change field label, placeholder, help text | uiSchema.ts only |
| Change column layout / field order | uiSchema.ts only |
| Add or modify conditional logic | schema.ts, test file |
| Add a new custom widget, field, or template | new component file + uiSchema.ts or index.tsx |
| Convert single-page to multi-step | schema.ts, uiSchema.ts, new template file, index.tsx |
| Add an edge case feature (async options, draft save, etc.) | index.tsx + possibly new files |
| Change validation rules (minLength, pattern, etc.) | schema.ts, test file |

Wait for the developer to confirm before proceeding.

---

## Step 3 — Show Diff Preview

For each affected file, show:
1. The current file content (labeled **Before**).
2. The proposed updated file content (labeled **After**).

Do NOT write any files yet.

Ask: "Make these changes? Reply 'yes' to apply, or tell me what to adjust."

---

## Step 4 — Write Changes

On the developer's confirmation:
1. Write only the affected files (do not rewrite unchanged files).
2. Append a changelog entry to `{sessionDir}/form-plan.md`:

```markdown
## Changelog

### <ISO timestamp> — <one-line description of change>
- Files changed: <list>
- Reason: <developer's original request>
```

3. Update `{sessionDir}/session.json`: add `"lastIterated": "<ISO timestamp>"`. Write the full session.json (not a partial merge).

---

## Step 5 — End-of-Phase Prompt

After writing, output:

> "Changes applied to `<outputPath>/`.
>
> Use `/rjsf-field list` to verify the current form state."
