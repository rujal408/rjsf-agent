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

  Session Commands:
  ─────────────────
  /rjsf-new <FormName>         Create a new form session (theme, styling, scaffold)
  /rjsf-list                   List all form sessions
  /rjsf-switch [name]          Switch to a different session
  /rjsf-delete <name>          Archive and remove a session
  /rjsf-status                 See current session info and stats

  Builder Commands (step-by-step form construction):
  ──────────────────────────────────────────────────
  /rjsf-field add <name>       Add a field (type, widget, width, validation)
  /rjsf-field list             List all fields with types and sections
  /rjsf-field remove <name>    Remove a field from all files
  /rjsf-field edit <name>      Modify a field's type, widget, validation, or width

  /rjsf-template create <type> Create a template (object, array, array-item, field,
                                base-input, title, description, error-list)
  /rjsf-template list          List registered and default templates
  /rjsf-template grid [section] Configure responsive grid layout

  /rjsf-widget create <name>   Create a custom widget (masked input, picker, etc.)
  /rjsf-widget list            List built-in and custom widgets

  Modify & Help:
  ──────────────
  /rjsf-iterate "change"       Modify an existing form (shows diff before writing)
  /rjsf-help [topic]           Help on any command or concept

Quick start:
  /rjsf-new MyForm                    # create session + scaffold files
  /rjsf-field add firstName           # add your first field
  /rjsf-field add lastName            # add more fields
  /rjsf-template grid                 # set up responsive columns

For help on a command:  /rjsf-help rjsf-field
For help on concepts:   /rjsf-help "what is a template?"
```

---

## With Input — Answer the Question

Match the input against the topics below and answer in plain English (2–5 sentences). If the input matches a command name, explain that command. If it matches a concept, explain the concept. If neither matches, answer as best you can using RJSF domain knowledge.

### Command Help

| Command | When asked about it, explain... |
|---|---|
| `/rjsf-new` or `rjsf-new` | Creates a new named form session. Asks for the UI framework (MUI, Ant Design, Chakra, etc.), styling approach, and output path. Scaffolds empty form files (schema.ts, uiSchema.ts, types.ts, index.tsx) so you can immediately start adding fields with `/rjsf-field add`. |
| `/rjsf-field` or `rjsf-field` | Manage individual fields in the active form. Subcommands: `add` (add a new field — prompts for type, widget, width, section, validation), `list` (table of all fields), `remove` (removes from schema, uiSchema, types), `edit` (modify type, widget, validation, or width). All changes show a diff before writing. |
| `/rjsf-template` or `rjsf-template` | Create and manage RJSF templates that control form layout. Subcommands: `create <type>` (8 types: object, array, array-item, field, base-input, title, description, error-list), `list` (show all templates), `grid` (configure responsive columns per section). |
| `/rjsf-widget` or `rjsf-widget` | Create and manage custom RJSF widgets. Subcommands: `create <name>` (generate a WidgetProps-based component), `list` (show built-in and custom widgets). Widgets replace the default input for one field — e.g., masked phone, color picker, star rating. |
| `/rjsf-iterate` or `rjsf-iterate` | Makes targeted changes to an already-generated form. Describe the change in natural language and it updates the right files. Shows a before/after diff before writing. |
| `/rjsf-status` or `rjsf-status` | Shows the active session's info: theme, styling, output path, field count, template count, widget count, and what to do next. |
| `/rjsf-list` or `rjsf-list` | Lists all form sessions with their theme, field count, and active indicator. |
| `/rjsf-switch` or `rjsf-switch` | Switches the active session. Provide a name to switch directly, or run without arguments to see a picker. |
| `/rjsf-delete` or `rjsf-delete` | Archives a session to `.rjsf/history/` and removes it. Generated code at the output path is preserved. |
| `/rjsf-help` or `rjsf-help` | Shows this help. Ask about any command or RJSF concept. |

### Workflow Help

| Question pattern | Answer |
|---|---|
| "how do I start", "how do I build a form", "quick start" | Run `/rjsf-new MyForm` — it asks for your UI framework, styling, and output path, then scaffolds empty form files. Then add fields one by one with `/rjsf-field add <name>`. |
| "how do I add fields" | Use `/rjsf-field add <fieldName>` — it prompts for type, widget, width, validation, and section. Repeat for each field. Use `/rjsf-field list` to see all fields. |
| "how do I set up a grid layout", "how do I make responsive" | Use `/rjsf-template grid` to configure responsive columns per section (mobile/tablet/desktop). Or `/rjsf-template create object` to create a custom ObjectFieldTemplate with grid layout. Fields have widths (full/half/quarter) set via `/rjsf-field add` or `/rjsf-field edit`. |
| "how do I add an array", "how do I add repeating items" | Add a field with type `array` using `/rjsf-field add`. Then customize the array layout with `/rjsf-template create array` (container) and `/rjsf-template create array-item` (per-item card/row). |
| "how do I work on multiple forms" | Use `/rjsf-new` to create sessions for each form. Use `/rjsf-switch` to switch between them. Use `/rjsf-list` to see all sessions. Each session has its own directory under `.rjsf/sessions/<name>/`. |
| "what template types are there", "which template should I use" | RJSF has 8 template types: `object` (section/grid layout), `array` (array container), `array-item` (per-item card/row), `field` (label+input+error wrapper), `base-input` (input element), `title` (headings), `description` (descriptions), `error-list` (error summary). Run `/rjsf-template create` with no type to see the decision guide. |
| "what is the workflow", "what order should I follow" | 1) `/rjsf-new` to create a session. 2) `/rjsf-field add` to add fields one by one. 3) `/rjsf-template grid` to set up responsive layout. 4) `/rjsf-template create` for custom templates if needed. 5) `/rjsf-widget create` for custom widgets if needed. 6) `/rjsf-field list` to review everything. |

### Concept Help

| Question pattern | Answer |
|---|---|
| "what is a custom widget" | A React component that controls a single form input. Use a custom widget when standard HTML inputs aren't enough — e.g. a phone number field with country prefix selector, a color picker, or a star rating. It receives `WidgetProps` from `@rjsf/utils` and calls `props.onChange(value)` to update the form. Create one with `/rjsf-widget create <name>`. |
| "what is a custom field" | A React component that renders multiple inputs under one label, with a single shared error zone. Use a custom field when standard RJSF can't group the sub-inputs correctly — e.g. a date range (start + end under one label), or an address with multiple sub-fields. It receives `FieldProps` from `@rjsf/utils`. |
| "what is a template" | A React component that controls how a group of fields is laid out. There are 8 types: ObjectFieldTemplate (section grid), ArrayFieldTemplate (array container), ArrayFieldItemTemplate (per-item wrapper), FieldTemplate (label+input+error), BaseInputTemplate (input element), TitleFieldTemplate, DescriptionFieldTemplate, ErrorListTemplate. Create one with `/rjsf-template create <type>`. |
| "what files get generated" | `/rjsf-new` scaffolds: `schema.ts` (JSON Schema), `uiSchema.ts` (layout and widget config), `types.ts` (TypeScript interfaces), `index.tsx` (the Form component). As you add templates and widgets, new files appear in `templates/` and `widgets/` folders. |
| "what is a session" | A session is a per-form working directory under `.rjsf/sessions/<FormName>/` that stores session state (`session.json`). The `.rjsf/active-session` file points to the currently active form. All builder commands operate on the active session. |
| "what is a grid layout" | RJSF doesn't have a built-in grid. The ObjectFieldTemplate controls field arrangement. Use `/rjsf-template grid` to configure responsive columns (e.g., 1 column mobile, 2 tablet, 3 desktop). Each field has a width (full/half/quarter) that determines how many grid columns it spans. |

Always end your answer with: "Want me to run the relevant command now?"
