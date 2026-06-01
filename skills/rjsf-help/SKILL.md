---
name: rjsf-help
description: Explain any rjsf-agent command or RJSF concept in plain English
argument-hint: [command-name or "concept question"]
allowed-tools: [Read]
---

# RJSF Help — Contextual Help

**Trigger:** `/rjsf-help` or `/rjsf-help "<question or command name>"`

---

## No Input — List All Commands

If invoked with no argument, display:

```
rjsf-agent commands:

  /rjsf-form         Smart entry point — detects context and guides you
  /rjsf-build        Run the full pipeline (or resume where you left off)
  /rjsf-status       See your current session progress
  /rjsf-requirements Phase 1 — gather and clarify form requirements
  /rjsf-suggest      Phase 1.5 — get UI/UX enhancement suggestions (A/B/C options)
  /rjsf-plan         Phase 2 — design form structure and layout
  /rjsf-technical    Phase 2.5 — configure technical decisions (schema, validation, styling)
  /rjsf-prototype    Phase 3 — generate HTML prototype for client sign-off
  /rjsf-execute      Phase 4 — generate all React/RJSF code
  /rjsf-test         Phase 5 — generate tests (validation, conditions, a11y)
  /rjsf-iterate      Modify an already-generated form without full rebuild
  /rjsf-new <name>    Create a new named form session
  /rjsf-switch [name]  Switch to a different session
  /rjsf-list          List all sessions with status
  /rjsf-delete <name>  Archive and remove a session

For help on a command: /rjsf-help rjsf-plan
For help on concepts:  /rjsf-help "what is a custom widget?"
```

---

## With Input — Answer the Question

Match the input against the topics below and answer in plain English (2–5 sentences). If the input matches a command name, explain that command. If it matches a concept, explain the concept. If neither matches, answer as best you can using RJSF domain knowledge.

### Command Help

| Command | When asked about it, explain… |
|---|---|
| `/rjsf-form` or `rjsf-form` | Smart router — reads your session and figures out what you need next. Use it when you're not sure which command to run. |
| `/rjsf-build` | Full pipeline orchestrator. Runs Phases 1–5 in order, waiting for your approval between each phase. Can also resume an interrupted session. |
| `/rjsf-status` | Reads the active session's `session.json` and shows a phase-by-phase progress summary. |
| `/rjsf-requirements` | Phase 1. Asks 20 clarifying questions about your form and produces a RequirementsBrief — a structured markdown document used by all later phases. |
| `/rjsf-suggest` or `rjsf-suggest` | Phase 1.5. Analyzes your RequirementsBrief and proactively suggests UI/UX enhancements you might not have considered — better widgets, compound fields, layout templates, visual polish. Presents every option as A/B/C choices with recommendations so you can make informed decisions. Type "all defaults" to accept recommendations, or "skip" to keep the original brief. |
| `/rjsf-plan` | Phase 2. Takes your RequirementsBrief (enhanced by Phase 1.5 if you ran it) and designs column layout, widget choices, and a Customization Assessment identifying any custom widgets/fields/templates needed. |
| `/rjsf-technical` or `rjsf-technical` | Phase 2.5. Presents technical decisions that affect generated code — JSON Schema version, validator, validation timing, submission pattern, form wrapper style, responsive breakpoints, TypeScript interface style, and more. Shows each as A/B/C options with defaults. Type "all defaults" to accept, or pick specific overrides. |
| `/rjsf-prototype` | Phase 3. Generates a self-contained prototype HTML file (saved in the active session directory) with no build step. Open it in a browser to share with clients for sign-off before any React code is written. |
| `/rjsf-execute` | Phase 4. Generates schema.ts, uiSchema.ts, types.ts, index.tsx, and custom components. Previews all files in chat before writing. |
| `/rjsf-test` | Phase 5. Generates a test file with required field validation, conditional visibility, form submission, server error mapping, and axe-core accessibility tests. |
| `/rjsf-iterate` | Makes targeted changes to an already-generated form. Shows a before/after diff before writing. Only writes the affected files. |
| `/rjsf-new <name>` | Creates a new named form session under `.rjsf/sessions/<name>/`. Sets it as the active session. |
| `/rjsf-switch [name]` | Switches the active session. If no name is given, shows a picker listing all sessions. Updates `.rjsf/active-session`. |
| `/rjsf-list` | Lists all sessions under `.rjsf/sessions/` with their current phase and status. Marks the active session. |
| `/rjsf-delete <name>` | Archives the named session to `.rjsf/history/` and removes it from `.rjsf/sessions/`. Cannot delete the active session without switching first. |

### Concept Help

| Question pattern | Answer |
|---|---|
| "what is a custom widget" | A React component that controls a single form input. Use a custom widget when standard HTML inputs aren't enough — e.g. a phone number field with country prefix selector, a color picker, or a star rating. It receives `WidgetProps` from `@rjsf/utils` and calls `props.onChange(value)` to update the form. |
| "what is a custom field" | A React component that renders multiple inputs under one label, with a single shared error zone. Use a custom field when standard RJSF can't group the sub-inputs correctly — e.g. a date range (start + end under one label), or an address with multiple sub-fields. It receives `FieldProps` from `@rjsf/utils`. |
| "what is a template" | A React component that controls how a group of fields is laid out. Use a template when you need to change the structure of a section — e.g. a multi-step wizard (ObjectFieldTemplate), a tab layout (ObjectFieldTemplate), or drag-reorder array items (ArrayFieldTemplate). |
| "what files get generated" | Phase 4 generates: `schema.ts` (JSON Schema), `uiSchema.ts` (layout and widget config), `types.ts` (TypeScript interfaces), `index.tsx` (the Form component). If custom components are needed, it also creates `widgets/`, `fields/`, and/or `templates/` folders with one file per component. |
| "how do I add async validation" | In Phase 1, answer "yes" to the async field validation question and identify which fields need it. Phase 4 will generate a debounced blur handler widget that calls your API endpoint and shows the response as a field error. |
| "how do I handle server errors" | Phase 4 generates a server error mapping pattern in `index.tsx`: when `onSubmit` rejects with `{ fieldErrors: { fieldName: 'message' } }`, the error is mapped to `extraErrors` on the RJSF Form and displayed under the correct field. Dot-notation paths (e.g. `address.city`) are supported. |
| "what is a requirements file" | A `.md` or `.txt` file that describes your form in plain English. Pass it with `/rjsf-build --from requirements.md` or `/rjsf-requirements --from requirements.md`. See `docs/requirements-guide.md` for a template. |
| "how do I resume" | Run `/rjsf-build` — it reads the active session's `session.json` automatically and offers to resume from the last completed phase. |
| "what is prototype html" | A standalone `prototype.html` file generated by Phase 3 into the active session directory (`{sessionDir}/prototype.html`). It has no dependencies — just open it in any browser. Shows the real layout, field types, and conditional show/hide logic so your client can approve the form design before any React code is written. |
| "how do I change the theme" | The theme is set during Phase 1 (question 1). To change it, run `/rjsf-iterate "change theme to @rjsf/mui"` — the iterate skill will update the import in `index.tsx`. |
| "what enhancements can I add", "what widgets are available", "what options do I have" | Run `/rjsf-suggest` after Phase 1. It analyzes your form and suggests field-level enhancements (masked inputs, date pickers, autocomplete, drag-and-drop), form-level layout options (wizard, tabs, accordion), and visual polish (error display, label style, help text). Each suggestion comes as A/B/C options with a recommendation. |
| "what technical decisions can I configure", "technical choices", "schema version" | Run `/rjsf-technical` after Phase 2. It presents 17 technical decisions grouped into Schema & Validation, Form Behavior, Layout & Styling, and Code Structure. Each decision has A/B/C options with a default. You can accept all defaults, pick specific overrides, or provide custom values for breakpoints and colors. |
| "how does validation work", "validation strategy", "step validation" | For single-page forms, RJSF handles all validation natively via JSON Schema — `required`, `minLength`, `pattern`, `format`, etc. No custom code needed unless you have cross-field rules. For multi-step wizards, validation is custom: the schema is split into per-step sub-schemas, and `formRef.current.validateForm()` validates only the current step on "Next" click. Cross-step validation (e.g., end date on Step 3 must be after start date on Step 1) runs as a final check in `handleSubmit()`. See `references/validation-strategy.md` for full details. |
| "what is progressive disclosure" | A UX pattern where optional fields are hidden by default and shown only when the user clicks "Show more" or toggles an option. Reduces visual clutter on forms with many optional fields. Phase 1.5 suggests this when your form has required fields mixed with many optional ones. |
| "what is a tag input", "what is a chip input" | A widget that renders array-of-string fields as removable tag chips instead of a full array UI. Users type a value and press Enter to add a tag. Much cleaner than the default RJSF array-of-text-inputs for things like skills, tags, or email lists. Suggested in Phase 1.5 for simple string arrays. |
| "how do I work on multiple forms" | Use `/rjsf-new <name>` to create a new named session for each form. Use `/rjsf-switch [name]` to switch between them. Use `/rjsf-list` to see all sessions and their progress. Each session has its own directory under `.rjsf/sessions/<name>/` with independent phase tracking. |
| "what is a session" | A session is a per-form working directory under `.rjsf/sessions/<FormName>/` that stores the session state (`session.json`), requirements brief, form plan, and other phase outputs. The `.rjsf/active-session` file points to the currently active form name. You can have multiple sessions and switch between them. |
| "how do I switch sessions" | Run `/rjsf-switch <name>` to switch to a specific session, or `/rjsf-switch` with no argument to see a picker. The active session determines which form all other commands operate on. |

Always end your answer with: "Want me to run the relevant command now?"
