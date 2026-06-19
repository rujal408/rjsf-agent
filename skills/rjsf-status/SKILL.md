---
name: rjsf-status
description: Show current RJSF session info, form stats, and guide what to do next
allowed-tools: [Read, Glob]
---

# RJSF Status — Session Info & Next Steps

**Trigger:** `/rjsf-status`

---

## Step 1 — Resolve Session

1. Read `.rjsf/active-session` → get `formName` → `sessionDir` = `.rjsf/sessions/{formName}/`
2. Read `{sessionDir}/session.json`

If no active session:
- If other sessions exist in `.rjsf/sessions/`: "No active session, but {N} session(s) found. Run `/rjsf-switch` to select one."
- If no sessions at all: "No sessions found. Run `/rjsf-new <FormName>` to create one."

Stop here.

---

## Step 2 — Gather Form Stats

Read the generated files at `outputPath` to count:

1. **Fields:** Read `schema.ts` — count all properties (including nested in sections). Note each field's type and widget.
2. **Sections:** Count top-level object properties in the schema that are themselves objects (these are sections).
3. **Templates:** Use Glob to find files in `{outputPath}/templates/`. Read `index.tsx` to check which are registered.
4. **Widgets:** Use Glob to find files in `{outputPath}/widgets/`. Read `uiSchema.ts` to check which fields use custom widgets.
5. **Grid layout:** Check if an ObjectFieldTemplate exists and what responsive columns are configured.

If `outputPath` is null or files don't exist, show "No files scaffolded yet" for all stats.

---

## Step 3 — Display Status

```
Active session: <FormName>
─────────────────────────────────
Theme:   <rjsfTheme>
Styling: <stylingApproach>
Output:  <outputPath>
Created: <createdAt>
Modified: <lastModified>

Form Stats:
  Fields:    <N> (<M> required)
  Sections:  <N>
  Templates: <N> custom (<list names>) + <M> using defaults
  Widgets:   <N> custom (<list names>) + <M> built-in
  Grid:      <configured or "not configured — run /rjsf-template grid">

Fields:
  <sectionName>:
    - <fieldName> (<type>, <widget>, <width>) <required?>
    - <fieldName> (<type>, <widget>, <width>)
  <sectionName>:
    - ...
```

If no fields exist yet:

```
Form Stats:
  Fields:    0 (empty form)
  Sections:  0
  Templates: 0 custom + all defaults
  Widgets:   0 custom + all built-in
  Grid:      not configured
```

---

## Step 4 — Other Sessions

List all other session directories under `.rjsf/sessions/` (excluding the active session). For each, read its `session.json` and show:

```
Other sessions:
  - PaymentForm        (@rjsf/mui, 12 fields)
  - ContactForm        (@rjsf/core, 5 fields)

Switch: /rjsf-switch <name>
```

Omit this section if no other sessions exist.

---

## Step 5 — What To Do Next

Always end with a clear, actionable "What to do next" section based on the current state:

| Current State | What to do next |
|---|---|
| No fields yet (empty form) | "**Start adding fields:**\n```\n/rjsf-field add firstName\n/rjsf-field add email\n```" |
| Has fields, no grid configured | "**Set up responsive layout:**\n```\n/rjsf-template grid\n```" |
| Has fields and grid, no custom templates | "**Optionally customize templates:**\n```\n/rjsf-template create array-item   # for array field cards\n/rjsf-template create field         # for label/error styling\n```\nOr your form is ready to use!" |
| Has everything | "**Your form is ready!** Import it from `<outputPath>/`.\n\nModify anytime:\n- `/rjsf-field add/edit/remove` — manage fields\n- `/rjsf-template grid` — adjust layout\n- `/rjsf-iterate \"change\"` — describe changes in plain English" |

### Format:

```
─── What to do next ───────────────────────────────────────

<actionable message from table above>
```
