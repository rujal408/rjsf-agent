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

  Core Commands:
  ─────────────
  /rjsf-new            Create a new form session
  /rjsf-form           Build a form (full pipeline) or resume where you left off
  /rjsf-status         See progress and what to do next

  Builder Commands (session-aware — operate on active form):
  ──────────────────────────────────────────────────────────
  /rjsf-field add <name>       Add a field (prompts for type, widget, width, section)
  /rjsf-field list             List all fields with types and sections
  /rjsf-field remove <name>    Remove a field from all files
  /rjsf-field edit <name>      Modify a field's type, widget, validation, or width

  /rjsf-template create <type> Create a template (object, array, array-item, field,
                                base-input, title, description, error-list)
  /rjsf-template list          List registered and default templates
  /rjsf-template grid [section] Configure responsive grid layout (columns per breakpoint)

  /rjsf-widget create <name>   Create a custom widget (masked input, picker, etc.)
  /rjsf-widget list            List built-in and custom widgets

  Utility Commands:
  ─────────────────
  /rjsf-iterate        Modify an already-generated form (shows diff before writing)
  /rjsf-list           List all form sessions with progress
  /rjsf-switch [name]  Switch to a different session
  /rjsf-delete <name>  Archive and remove a session
  /rjsf-help           Help on any command or concept

Quick start:
  /rjsf-form "describe your form here"          (full pipeline)
  /rjsf-field add firstName                      (step-by-step building)

For help on a command:  /rjsf-help rjsf-field
For help on concepts:   /rjsf-help "what is a template?"
```

---

## With Input — Answer the Question

Match the input against the topics below and answer in plain English (2–5 sentences). If the input matches a command name, explain that command. If it matches a concept, explain the concept. If neither matches, answer as best you can using RJSF domain knowledge.

### Command Help

| Command | When asked about it, explain… |
|---|---|
| `/rjsf-new` or `rjsf-new` | Creates a new named form session under `.rjsf/sessions/<name>/`. Sets it as the active session. After creating, run `/rjsf-form "description"` to start building. |
| `/rjsf-form` or `rjsf-form` | The main command. Accepts a form description or `--from file` to start building. Runs all 7 phases automatically (requirements → suggestions → plan → technical → prototype → code → tests), pausing between each phase so you can review. If you stop midway, run `/rjsf-form` again to resume exactly where you left off. Also handles client approval — just say "client approved" when your client signs off on the prototype. |
| `/rjsf-status` or `rjsf-status` | Shows your current session's phase-by-phase progress with status icons, plus a clear "What to do next" section that tells you exactly which command to run. Use this when returning after a break. |
| `/rjsf-iterate` or `rjsf-iterate` | Makes targeted changes to an already-generated form without re-running the full pipeline. Shows a before/after diff for every affected file before writing. Only rewrites files that actually need to change. |
| `/rjsf-list` or `rjsf-list` | Lists all form sessions under `.rjsf/sessions/` with their current phase, status, and progress bar. Marks the active session. |
| `/rjsf-switch` or `rjsf-switch` | Switches the active session. Provide a name to switch directly, or run without arguments to see a picker. |
| `/rjsf-delete` or `rjsf-delete` | Archives a session to `.rjsf/history/` and removes it from active sessions. Generated code is preserved. |
| `/rjsf-field` or `rjsf-field` | Manage individual fields in the active form session. Subcommands: `add` (add a new field — prompts for type, widget, width, section, validation), `list` (table of all fields with types and sections), `remove` (removes from schema, uiSchema, types), `edit` (modify type, widget, validation, or width). All changes show a diff before writing. Requires a generated form (Phase 4 complete). |
| `/rjsf-template` or `rjsf-template` | Create and manage RJSF templates that control form layout. Subcommands: `create <type>` (generate a template — types: object, array, array-item, field, base-input, title, description, error-list), `list` (show all registered and default templates), `grid` (configure responsive column layout per section). Templates are the RJSF extension point for arranging fields in grids, styling array items as cards/rows, customizing labels, and replacing the error summary. |
| `/rjsf-widget` or `rjsf-widget` | Create and manage custom RJSF widgets (single input controls). Subcommands: `create <name>` (generate a WidgetProps-based component — e.g., masked phone input, color picker, star rating), `list` (show built-in and custom widgets with field assignments). Widgets replace the default input for one field. For compound inputs under one label, use a custom Field instead. |
| `/rjsf-help` or `rjsf-help` | Shows this help. Ask about any command or RJSF concept. |

### Workflow Help

| Question pattern | Answer |
|---|---|
| "how do I start", "how do I build a form", "quick start" | Run `/rjsf-form "describe your form"` — it creates a session automatically and starts the pipeline. Or create a session first with `/rjsf-new`, then run `/rjsf-form "description"`. |
| "how do I resume", "continue", "pick up where I left off" | Run `/rjsf-form` with no arguments. It reads your active session and resumes from the last completed phase. Or run `/rjsf-status` first to see where you are. |
| "what are the phases", "how does the pipeline work" | The agent runs 7 phases: (1) Requirements — clarifying questions, (1.5) Suggestions — UI/UX enhancements, (2) Plan — layout and widgets, (2.5) Technical — schema/validator config, (3) Prototype — HTML for client approval, (4) Execution — React/RJSF code generation, (5) Testing — test file generation. Each phase pauses for your approval. |
| "how do I skip a phase" | When the pipeline pauses between phases, type "skip" to skip the next phase. Phases 1.5 and 2.5 are optional and safe to skip. |
| "how do I stop midway" | Type "stop" when the pipeline pauses between phases. Your progress is saved. Run `/rjsf-form` later to resume. |
| "how do I build step by step", "how do I add fields one by one" | After running `/rjsf-form` to generate the initial form, use the builder commands: `/rjsf-field add <name>` to add fields, `/rjsf-template create <type>` to create templates, `/rjsf-widget create <name>` to build custom widgets. Each command is session-aware and updates all affected files. |
| "how do I set up a grid layout", "how do I make responsive" | Use `/rjsf-template grid` to configure responsive columns per section. Or `/rjsf-template create object` to create an ObjectFieldTemplate with grid layout. Fields have widths (full/half/quarter) set via `/rjsf-field add` or `/rjsf-field edit`. |
| "what template types are there", "which template should I use" | RJSF has 8 template types: `object` (section/grid layout), `array` (array container), `array-item` (per-item card/row), `field` (label+input+error wrapper), `base-input` (input element), `title` (headings), `description` (descriptions), `error-list` (error summary). Run `/rjsf-template create` with no type to see the decision guide. |

### Concept Help

| Question pattern | Answer |
|---|---|
| "what is a custom widget" | A React component that controls a single form input. Use a custom widget when standard HTML inputs aren't enough — e.g. a phone number field with country prefix selector, a color picker, or a star rating. It receives `WidgetProps` from `@rjsf/utils` and calls `props.onChange(value)` to update the form. |
| "what is a custom field" | A React component that renders multiple inputs under one label, with a single shared error zone. Use a custom field when standard RJSF can't group the sub-inputs correctly — e.g. a date range (start + end under one label), or an address with multiple sub-fields. It receives `FieldProps` from `@rjsf/utils`. |
| "what is a template" | A React component that controls how a group of fields is laid out. Use a template when you need to change the structure of a section — e.g. a multi-step wizard (ObjectFieldTemplate), a tab layout (ObjectFieldTemplate), or drag-reorder array items (ArrayFieldTemplate). |
| "what files get generated" | Phase 4 generates: `schema.ts` (JSON Schema), `uiSchema.ts` (layout and widget config), `types.ts` (TypeScript interfaces), `index.tsx` (the Form component). If custom components are needed, it also creates `widgets/`, `fields/`, and/or `templates/` folders with one file per component. |
| "how do I add async validation" | In Phase 1, answer "yes" to the async field validation question and identify which fields need it. Phase 4 will generate a debounced blur handler widget that calls your API endpoint and shows the response as a field error. |
| "how do I handle server errors" | Phase 4 generates a server error mapping pattern in `index.tsx`: when `onSubmit` rejects with `{ fieldErrors: { fieldName: 'message' } }`, the error is mapped to `extraErrors` on the RJSF Form and displayed under the correct field. |
| "what is a requirements file" | A `.md` or `.txt` file that describes your form in plain English. Pass it with `/rjsf-form --from requirements.md`. See `docs/requirements-guide.md` for a template. |
| "what is prototype html" | A standalone `prototype.html` file generated by Phase 3 into the active session directory. It has no dependencies — just open it in any browser. Shows the real layout, field types, and conditional show/hide logic so your client can approve the form design before any React code is written. |
| "how do I change the theme" | The theme is set during Phase 1 (question 1). To change it after generation, run `/rjsf-iterate "change theme to @rjsf/mui"`. |
| "what enhancements can I add", "what widgets are available" | Phase 1.5 (run automatically during `/rjsf-form`) analyzes your form and suggests field-level enhancements (masked inputs, date pickers, autocomplete, drag-and-drop), form-level layout options (wizard, tabs, accordion), and visual polish. Each suggestion comes as A/B/C options. |
| "how does validation work" | For single-page forms, RJSF handles all validation natively via JSON Schema. For multi-step wizards, the schema is split into per-step sub-schemas, and each step is validated before advancing. Cross-step validation runs as a final check in `handleSubmit()`. |
| "how do I work on multiple forms" | Use `/rjsf-new` to create sessions for each form. Use `/rjsf-switch` to switch between them. Use `/rjsf-list` to see all sessions. Each session has its own directory under `.rjsf/sessions/<name>/`. |
| "what is a session" | A session is a per-form working directory under `.rjsf/sessions/<FormName>/` that stores session state (`session.json`), requirements brief, form plan, and other phase outputs. The `.rjsf/active-session` file points to the currently active form. |

Always end your answer with: "Want me to run the relevant command now?"
