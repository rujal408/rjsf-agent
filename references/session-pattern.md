# Session Pattern Reference

The session file tracks pipeline progress across skill invocations. Skills read it at start to resume work and write it after each phase completes.

---

## 1. Complete session.json Schema

```json
{
  "version": "1.0.0",
  "formName": "UserRegistrationForm",
  "outputPath": "src/components/UserRegistrationForm",
  "rjsfTheme": "@rjsf/mui",
  "stylingApproach": "tailwind",
  "currentPhase": "component",
  "phases": {
    "discovery": {
      "status": "completed",
      "startedAt": "2026-05-26T09:00:00Z",
      "completedAt": "2026-05-26T09:05:00Z",
      "artifactPath": ".rjsf/schema.json"
    },
    "schema": {
      "status": "completed",
      "startedAt": "2026-05-26T09:05:00Z",
      "completedAt": "2026-05-26T09:12:00Z",
      "artifactPath": ".rjsf/schema.json"
    },
    "uiSchema": {
      "status": "completed",
      "startedAt": "2026-05-26T09:12:00Z",
      "completedAt": "2026-05-26T09:17:00Z",
      "artifactPath": ".rjsf/uiSchema.json"
    },
    "customization": {
      "status": "completed",
      "startedAt": "2026-05-26T09:17:00Z",
      "completedAt": "2026-05-26T09:25:00Z",
      "artifactPath": ".rjsf/customizations.json"
    },
    "component": {
      "status": "in_progress",
      "startedAt": "2026-05-26T09:25:00Z",
      "completedAt": null,
      "artifactPath": null
    },
    "validation": {
      "status": "pending",
      "startedAt": null,
      "completedAt": null,
      "artifactPath": null
    },
    "review": {
      "status": "pending",
      "startedAt": null,
      "completedAt": null,
      "artifactPath": null
    }
  }
}
```

### Top-Level Fields

| Field | Type | Description |
|---|---|---|
| `version` | `string` | Session schema version. Current: `"1.0.0"` |
| `formName` | `string` | PascalCase name of the form component (e.g., `"UserRegistrationForm"`) |
| `outputPath` | `string` | Relative path where the final component file will be written |
| `rjsfTheme` | `string` | RJSF theme package: `@rjsf/core`, `@rjsf/mui`, `@rjsf/antd`, `@rjsf/bootstrap` |
| `stylingApproach` | `string` | CSS strategy: `tailwind`, `css-modules`, `styled-components`, `inline`, `none` |
| `currentPhase` | `string` | Name of the phase currently being worked on |
| `phases` | `object` | Map of phase name → phase state object |

### Phase State Fields

| Field | Type | Description |
|---|---|---|
| `status` | `string` | One of: `pending`, `in_progress`, `completed`, `awaiting_client_approval` |
| `startedAt` | `string \| null` | ISO 8601 timestamp when the phase started, or `null` |
| `completedAt` | `string \| null` | ISO 8601 timestamp when the phase completed, or `null` |
| `artifactPath` | `string \| null` | Relative path to the primary artifact produced by this phase, or `null` |

---

## 2. Status Values

| Status | Meaning | Transitions To |
|---|---|---|
| `pending` | Phase has not started yet | `in_progress` |
| `in_progress` | Phase is actively being worked on in the current session | `completed`, `awaiting_client_approval` |
| `completed` | Phase finished successfully; artifact is written | Next phase becomes `in_progress` |
| `awaiting_client_approval` | Phase output needs human review before proceeding | `completed` (after approval), `in_progress` (if rework needed) |

---

## 3. How to Read Session at Skill Start

Execute these steps in order at the beginning of any skill that participates in the pipeline:

1. **Check for session file.** Look for `.rjsf/session.json` in the project root (current working directory). If the file does not exist, this is a fresh start — initialize a new session (see Section 4) and begin at the first phase.

2. **Parse the JSON.** Read and parse `.rjsf/session.json`. If parsing fails (invalid JSON), warn the user and offer to reset the session.

3. **Identify the current phase.** Read `session.currentPhase`. This is the phase the skill should work on.

4. **Check phase status.** Read `session.phases[currentPhase].status`:
   - If `in_progress`: Resume the phase from where it left off. Read the artifact at `artifactPath` if it exists.
   - If `completed`: The phase was already finished. Ask the user if they want to re-run it or advance to the next phase.
   - If `pending`: This phase has not started. Set status to `in_progress`, set `startedAt` to now, and begin the phase.
   - If `awaiting_client_approval`: Present the existing artifact to the user and wait for explicit approval before proceeding.

5. **Load prior artifacts.** For each phase that is `completed`, read its `artifactPath` to load the data produced (e.g., `schema.json`, `uiSchema.json`). These are the inputs to the current phase.

---

## 4. How to Write Session After Phase Completion

Execute these steps in order after a phase finishes successfully:

1. **Write the phase artifact.** Save the primary output of the phase to its designated path (see Artifact Files table). Create the `.rjsf/` directory if it does not exist.

2. **Update the completed phase in session.** Set:
   - `phases[phaseName].status` → `"completed"`
   - `phases[phaseName].completedAt` → current ISO 8601 timestamp
   - `phases[phaseName].artifactPath` → relative path to the artifact written in step 1

3. **Determine the next phase.** Find the next phase in the ordered pipeline sequence. The canonical order is: `discovery → schema → uiSchema → customization → component → validation → review`.

4. **Update session.currentPhase.** Set `session.currentPhase` to the name of the next phase. Set `phases[nextPhase].status` to `"pending"` (it remains pending until that skill runs).

5. **Write session.json.** Overwrite `.rjsf/session.json` with the updated session object. Always write the full object (not a partial merge) to avoid stale data.

---

## 5. Artifact Files

| Phase | Artifact Path | Format |
|---|---|---|
| `discovery` | `.rjsf/discovery.md` | Markdown — captured requirements, field list, validation rules |
| `schema` | `.rjsf/schema.json` | JSON — the full RJSF-compatible JSON Schema |
| `uiSchema` | `.rjsf/uiSchema.json` | JSON — the full RJSF uiSchema object |
| `customization` | `.rjsf/customizations.json` | JSON — list of custom widgets/fields/templates to generate |
| `component` | `{outputPath}/{formName}.tsx` | TypeScript React — the assembled Form component file |
| `validation` | `.rjsf/validation.ts` | TypeScript — `customValidate` function and `handleServerErrors` helper |
| `review` | `.rjsf/review.md` | Markdown — review checklist results and any open issues |

---

## 6. .rjsf/history/ Archiving Steps

Archive the current session when starting a completely new form (same project) or when the user explicitly requests a reset.

1. **Create the archive directory.** Create `.rjsf/history/{formName}_{timestamp}/` where `timestamp` is the ISO 8601 date-time of archival with colons replaced by hyphens (e.g., `UserRegistrationForm_2026-05-26T09-30-00Z`).

2. **Copy session.json.** Copy `.rjsf/session.json` to `.rjsf/history/{formName}_{timestamp}/session.json`.

3. **Copy all artifacts.** For each phase in the archived session that has a non-null `artifactPath`, copy the artifact file into the archive directory. Preserve the filename but flatten the path (do not recreate subdirectories inside the archive).

4. **Clear active files.** Delete the following files from `.rjsf/` (not from the archive):
   - `.rjsf/session.json`
   - `.rjsf/discovery.md`
   - `.rjsf/schema.json`
   - `.rjsf/uiSchema.json`
   - `.rjsf/customizations.json`
   - `.rjsf/validation.ts`
   - `.rjsf/review.md`
   Do NOT delete the component file at `outputPath` — that is user-owned production code.

5. **Start fresh.** After clearing, initialize a new `.rjsf/session.json` for the new form with all phases set to `pending`. Proceed with the first skill in the pipeline.
