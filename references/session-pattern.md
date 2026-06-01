# Session Pattern Reference

The session file tracks pipeline progress across skill invocations. Skills read it at start to resume work and write it after each phase completes.

---

## 0. Multi-Session Directory Structure

Each form gets its own isolated directory under `.rjsf/sessions/`. A pointer file tracks which form is currently active.

### Directory Layout

```
.rjsf/
  active-session          ← plain text file containing the active formName
  sessions/
    UserRegistrationForm/
      session.json
      requirements-brief.md
      enhanced-brief.md
      form-plan.md
      form-plan.json
      technical-choices.md
      prototype.html
    PaymentForm/
      session.json
      requirements-brief.md
      ...
  history/
    UserRegistrationForm_2026-05-26T09-30-00Z/
      session.json
      requirements-brief.md
      ...
```

### `active-session` File Format

Plain text file containing only the formName (PascalCase, no newline padding required). Example contents:

```
UserRegistrationForm
```

### Session Path Resolution Algorithm

Every skill MUST execute this algorithm before any session read/write:

1. **Read the pointer.** Read `.rjsf/active-session` to get `formName`.
2. **Derive session directory.** `sessionDir` = `.rjsf/sessions/{formName}/`
3. **Locate session file.** Session file is at `{sessionDir}/session.json`.
4. **Locate artifacts.** All artifacts are stored under `{sessionDir}/`. The `artifactPath` values in `session.json` are **filenames only** (e.g., `"requirements-brief.md"`), resolved by prepending `{sessionDir}/`.
5. **Resolve full artifact path.** `fullPath` = `{sessionDir}/{artifactPath}` (e.g., `.rjsf/sessions/UserRegistrationForm/requirements-brief.md`).
6. **Legacy fallback.** If `.rjsf/active-session` does not exist but `.rjsf/session.json` does exist, perform the legacy migration described in Section 7 before proceeding.

---

## 1. Complete session.json Schema

```json
{
  "version": "2.0.0",
  "formName": "UserRegistrationForm",
  "outputPath": "src/forms/UserRegistrationForm",
  "rjsfTheme": "@rjsf/mui",
  "stylingApproach": "mui-grid",
  "technicalChoices": {},
  "currentPhase": "4",
  "phases": {
    "1": {
      "status": "completed",
      "startedAt": "2026-05-26T09:00:00Z",
      "completedAt": "2026-05-26T09:05:00Z",
      "artifactPath": "requirements-brief.md"
    },
    "1.5": {
      "status": "completed",
      "startedAt": "2026-05-26T09:05:00Z",
      "completedAt": "2026-05-26T09:08:00Z",
      "artifactPath": "enhanced-brief.md"
    },
    "2": {
      "status": "completed",
      "startedAt": "2026-05-26T09:08:00Z",
      "completedAt": "2026-05-26T09:15:00Z",
      "artifactPath": "form-plan.md"
    },
    "2.5": {
      "status": "completed",
      "startedAt": "2026-05-26T09:15:00Z",
      "completedAt": "2026-05-26T09:18:00Z",
      "artifactPath": "technical-choices.md"
    },
    "3": {
      "status": "completed",
      "startedAt": "2026-05-26T09:18:00Z",
      "completedAt": "2026-05-26T09:25:00Z",
      "artifactPath": "prototype.html"
    },
    "4": {
      "status": "in_progress",
      "startedAt": "2026-05-26T09:30:00Z",
      "completedAt": null,
      "artifactPath": null
    },
    "5": {
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
| `version` | `string` | Session schema version. Current: `"2.0.0"` |
| `formName` | `string` | PascalCase name of the form component (e.g., `"UserRegistrationForm"`) |
| `outputPath` | `string` | Relative path where generated form files will be written |
| `rjsfTheme` | `string` | RJSF theme package: `@rjsf/core`, `@rjsf/mui`, `@rjsf/antd`, `@rjsf/bootstrap` |
| `stylingApproach` | `string` | CSS strategy: `css-modules`, `scss`, `tailwind`, `plain-css`, `chakra`, `bare`, `mui-grid`, `antd-grid`, `bootstrap-grid` |
| `technicalChoices` | `object` | Technical decisions from Phase 2.5 (schema version, validator, submission pattern, etc.) |
| `currentPhase` | `string` | Numeric phase key currently being worked on (e.g., `"1"`, `"1.5"`, `"2"`, `"2.5"`, `"3"`, `"4"`, `"5"`) |
| `phases` | `object` | Map of numeric phase key → phase state object |

### Phase State Fields

| Field | Type | Description |
|---|---|---|
| `status` | `string` | One of: `pending`, `in_progress`, `completed`, `awaiting_client_approval` |
| `startedAt` | `string \| null` | ISO 8601 timestamp when the phase started, or `null` |
| `completedAt` | `string \| null` | ISO 8601 timestamp when the phase completed, or `null` |
| `artifactPath` | `string \| null` | Filename of the primary artifact produced by this phase (relative to session directory), or `null` |

### Phase Keys

All phase keys are **numeric strings**. This is the canonical pipeline order:

| Phase Key | Name | Skill | Artifact |
|-----------|------|-------|----------|
| `"1"` | Requirements | `rjsf-requirements` | `requirements-brief.md` |
| `"1.5"` | Feature Suggestions | `rjsf-suggest` | `enhanced-brief.md` |
| `"2"` | Planning | `rjsf-plan` | `form-plan.md` |
| `"2.5"` | Technical Decisions | `rjsf-technical` | `technical-choices.md` |
| `"3"` | Prototype | `rjsf-prototype` | `prototype.html` |
| `"4"` | Execution | `rjsf-execute` | `src/forms/<FormName>/` |
| `"5"` | Testing | `rjsf-test` | `src/forms/<FormName>/<FormName>.test.tsx` |

All artifact paths for Phases 1–3 are relative to the session directory. Resolve by prepending `.rjsf/sessions/{formName}/`.

**Pipeline order:** `1 → 1.5 → 2 → 2.5 → 3 → 4 → 5`

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

1. **Resolve the session path.** Follow the Session Path Resolution Algorithm (Section 0):
   - Read `.rjsf/active-session` to get `formName`.
   - Derive `sessionDir` = `.rjsf/sessions/{formName}/`.
   - If `.rjsf/active-session` does not exist:
     - If `.rjsf/session.json` exists (legacy layout), perform the migration in Section 7 first, then re-read `active-session`.
     - If neither exists, this is a fresh start — suggest the user run `/rjsf-new` to create a new session or `/rjsf-switch` to select an existing one. Do not proceed without an active session.

2. **Parse the JSON.** Read and parse `{sessionDir}/session.json`. If parsing fails (invalid JSON), warn the user and offer to reset the session.

3. **Identify the current phase.** Read `session.currentPhase`. This is the numeric phase key the skill should work on.

4. **Check phase status.** Read `session.phases[currentPhase].status`:
   - If `in_progress`: Resume the phase from where it left off. Read the artifact at `{sessionDir}/{artifactPath}` if it exists.
   - If `completed`: The phase was already finished. Ask the user if they want to re-run it or advance to the next phase.
   - If `pending`: This phase has not started. Set status to `in_progress`, set `startedAt` to now, and begin the phase.
   - If `awaiting_client_approval`: Present the existing artifact to the user and wait for explicit approval before proceeding.

5. **Load prior artifacts.** For each phase that is `completed`, read its artifact at `{sessionDir}/{artifactPath}` to load the data produced. These are the inputs to the current phase.

---

## 4. How to Write Session After Phase Completion

Execute these steps in order after a phase finishes successfully:

1. **Write the phase artifact.** Save the primary output of the phase to `{sessionDir}/{artifactFilename}` (see Phase Keys table). Create the session directory if it does not exist.

2. **Update the completed phase in session.** Set:
   - `phases[phaseKey].status` → `"completed"`
   - `phases[phaseKey].completedAt` → current ISO 8601 timestamp
   - `phases[phaseKey].artifactPath` → filename only (e.g., `"requirements-brief.md"`, not a full path)

3. **Determine the next phase.** Find the next phase in the pipeline order: `1 → 1.5 → 2 → 2.5 → 3 → 4 → 5`.

4. **Update session.currentPhase.** Set `session.currentPhase` to the next phase key. Set `phases[nextPhaseKey].status` to `"pending"` (it remains pending until that skill runs).

5. **Write session.json.** Overwrite `{sessionDir}/session.json` with the updated session object. Always write the full object (not a partial merge) to avoid stale data.

---

## 5. Artifact Files

All artifact filenames for Phases 1–3 are relative to the session directory (`.rjsf/sessions/{formName}/`).

| Phase Key | Artifact Filename | Format |
|---|---|---|
| `1` | `requirements-brief.md` | Markdown — captured requirements, field list, validation rules |
| `1.5` | `enhanced-brief.md` | Markdown — enhanced requirements with UI/UX choices applied, customization summary |
| `2` | `form-plan.md` + `form-plan.json` | Markdown (human-readable) + JSON (machine-readable for `rjsf-cli` tools). Both must stay in sync. See `tools/rjsf-cli/src/types/form-plan.ts` for the JSON interface. |
| `2.5` | `technical-choices.md` | Markdown — technical decisions (schema version, validator, submission pattern, etc.) |
| `3` | `prototype.html` | HTML — self-contained client prototype |
| `4` | `src/forms/<FormName>/` | TypeScript React — schema.ts, uiSchema.ts, types.ts, index.tsx, custom components |
| `5` | `src/forms/<FormName>/<FormName>.test.tsx` | TypeScript — test file covering validation, conditions, accessibility |

Phase 4 and Phase 5 artifacts are written outside the session directory, at the project-level `outputPath`. They are not moved or copied during archiving.

---

## 6. .rjsf/history/ Archiving Steps

Archive a session when starting a completely new form (same project) or when the user explicitly requests a reset.

1. **Create the archive directory.** Create `.rjsf/history/{formName}_{timestamp}/` where `timestamp` is the ISO 8601 date-time of archival with colons replaced by hyphens (e.g., `UserRegistrationForm_2026-05-26T09-30-00Z`).

2. **Copy the session directory.** Copy the entire contents of `.rjsf/sessions/{formName}/` into `.rjsf/history/{formName}_{timestamp}/`. This includes `session.json` and all artifact files stored in the session directory.

3. **Delete the session directory.** Remove `.rjsf/sessions/{formName}/` and all its contents.

4. **Update active-session pointer.** If the archived session was the active session (i.e., `.rjsf/active-session` contains the archived `formName`):
   - Delete `.rjsf/active-session`.
   - Suggest the user run `/rjsf-switch` to select another existing session, or `/rjsf-new` to create a new one.

5. **Preserve generated code.** Do NOT delete the component files at `outputPath` — that is user-owned production code.

---

## 7. Legacy Migration

When `.rjsf/session.json` exists but `.rjsf/active-session` does not, the project is using the legacy flat-directory layout. Perform this one-time migration:

1. **Read the legacy session.** Parse `.rjsf/session.json` and extract the `formName` value.

2. **Create the session directory.** Create `.rjsf/sessions/{formName}/`.

3. **Move session.json.** Move `.rjsf/session.json` to `.rjsf/sessions/{formName}/session.json`.

4. **Move artifact files.** Move the following files from their legacy locations into the new session directory:
   - `.rjsf/requirements-brief.md` → `.rjsf/sessions/{formName}/requirements-brief.md`
   - `.rjsf/enhanced-brief.md` → `.rjsf/sessions/{formName}/enhanced-brief.md`
   - `.rjsf/form-plan.md` → `.rjsf/sessions/{formName}/form-plan.md`
   - `.rjsf/technical-choices.md` → `.rjsf/sessions/{formName}/technical-choices.md`
   Only move files that exist; skip any that are missing (the phase may not have been reached yet).

5. **Move prototype.** If `prototype/prototype.html` exists, move it to `.rjsf/sessions/{formName}/prototype.html`.

6. **Update artifactPath values.** In the migrated `session.json`, change all non-null `artifactPath` values to filenames only:
   - `".rjsf/requirements-brief.md"` → `"requirements-brief.md"`
   - `".rjsf/enhanced-brief.md"` → `"enhanced-brief.md"`
   - `".rjsf/form-plan.md"` → `"form-plan.md"`
   - `".rjsf/technical-choices.md"` → `"technical-choices.md"`
   - `"prototype/prototype.html"` → `"prototype.html"`

7. **Update version.** Set `version` to `"2.0.0"` in the migrated `session.json`.

8. **Write the active-session pointer.** Write `formName` to `.rjsf/active-session`.

9. **Notify the user.** Inform the user that their session has been migrated to the multi-session directory structure and that all data has been preserved.
