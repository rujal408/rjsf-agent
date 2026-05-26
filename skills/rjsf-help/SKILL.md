# RJSF Help — Contextual Help

**Trigger:** `/rjsf-help` or `/rjsf-help "<question or command name>"`

---

## No Input — List All Commands

If invoked with no argument, display:

```
rjsf-agent commands:

  /rjsf              Smart entry point — detects context and guides you
  /rjsf-build        Run the full pipeline (or resume where you left off)
  /rjsf-status       See your current session progress
  /rjsf-requirements Phase 1 — gather and clarify form requirements
  /rjsf-plan         Phase 2 — design form structure and layout
  /rjsf-prototype    Phase 3 — generate HTML prototype for client sign-off
  /rjsf-execute      Phase 4 — generate all React/RJSF code
  /rjsf-test         Phase 5 — generate tests (validation, conditions, a11y)
  /rjsf-iterate      Modify an already-generated form without full rebuild

For help on a command: /rjsf-help rjsf-plan
For help on concepts:  /rjsf-help "what is a custom widget?"
```

---

## With Input — Answer the Question

Match the input against the topics below and answer in plain English (2–5 sentences). If the input matches a command name, explain that command. If it matches a concept, explain the concept. If neither matches, answer as best you can using RJSF domain knowledge.

### Command Help

| Command | When asked about it, explain… |
|---|---|
| `/rjsf` or `rjsf` | Smart router — reads your session and figures out what you need next. Use it when you're not sure which command to run. |
| `/rjsf-build` | Full pipeline orchestrator. Runs Phases 1–5 in order, waiting for your approval between each phase. Can also resume an interrupted session. |
| `/rjsf-status` | Reads your `.rjsf/session.json` and shows a phase-by-phase progress summary. |
| `/rjsf-requirements` | Phase 1. Asks 20 clarifying questions about your form and produces a RequirementsBrief — a structured markdown document used by all later phases. |
| `/rjsf-plan` | Phase 2. Takes your RequirementsBrief and designs column layout, widget choices, and a Customization Assessment identifying any custom widgets/fields/templates needed. |
| `/rjsf-prototype` | Phase 3. Generates `prototype/prototype.html` — a self-contained file with no build step. Open it in a browser to share with clients for sign-off before any React code is written. |
| `/rjsf-execute` | Phase 4. Generates schema.ts, uiSchema.ts, types.ts, index.tsx, and custom components. Previews all files in chat before writing. |
| `/rjsf-test` | Phase 5. Generates a test file with required field validation, conditional visibility, form submission, server error mapping, and axe-core accessibility tests. |
| `/rjsf-iterate` | Makes targeted changes to an already-generated form. Shows a before/after diff before writing. Only writes the affected files. |

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
| "how do I resume" | Run `/rjsf-build` — it reads `.rjsf/session.json` automatically and offers to resume from the last completed phase. |
| "what is prototype html" | A standalone `prototype/prototype.html` file generated by Phase 3. It has no dependencies — just open it in any browser. Shows the real layout, field types, and conditional show/hide logic so your client can approve the form design before any React code is written. |
| "how do I change the theme" | The theme is set during Phase 1 (question 1). To change it, run `/rjsf-iterate "change theme to @rjsf/mui"` — the iterate skill will update the import in `index.tsx`. |

Always end your answer with: "Want me to run the relevant command now?"
