# Multi-Session Support Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow multiple named form sessions to coexist in a single project, each with its own isolated directory under `.rjsf/sessions/`, with commands to create, switch, list, and delete sessions.

**Architecture:** Replace the flat `.rjsf/session.json` + `.rjsf/*.md` layout with per-form directories under `.rjsf/sessions/{formName}/`. An `active-session` plain-text pointer file tracks which session is current. All existing skills resolve the session path through a standard algorithm defined in `references/session-pattern.md`. Four new skills handle session lifecycle. Legacy flat sessions are auto-migrated on first access.

**Tech Stack:** Markdown skill files (Claude Code plugin), no runtime code.

---

## File Structure

### New files to create:
- `skills/rjsf-new/SKILL.md` — Create a new named session
- `skills/rjsf-switch/SKILL.md` — Switch the active session
- `skills/rjsf-list/SKILL.md` — List all sessions with status
- `skills/rjsf-delete/SKILL.md` — Archive and remove a session

### Files to modify:
- `references/session-pattern.md` — Add multi-session directory structure, path resolution, legacy migration
- `skills/rjsf-build/SKILL.md` — Use resolved session path, update menus
- `skills/rjsf-form/SKILL.md` — Multi-session routing, show active session
- `skills/rjsf-status/SKILL.md` — Show active session + list others
- `skills/rjsf-requirements/SKILL.md` — Use resolved session path
- `skills/rjsf-suggest/SKILL.md` — Use resolved session path
- `skills/rjsf-plan/SKILL.md` — Use resolved session path
- `skills/rjsf-technical/SKILL.md` — Use resolved session path
- `skills/rjsf-prototype/SKILL.md` — Use resolved session path, per-form prototype
- `skills/rjsf-execute/SKILL.md` — Use resolved session path
- `skills/rjsf-test/SKILL.md` — Use resolved session path
- `skills/rjsf-iterate/SKILL.md` — Use resolved session path
- `skills/rjsf-help/SKILL.md` — Document new commands
- `README.md` — Add new commands to table
- `docs/commands.md` — Add new command docs
- `docs/getting-started.md` — Update session storage section
- `docs/output-guide.md` — Update `.rjsf/` directory description

### New directory structure (after):
```
.rjsf/
├── active-session                    # plain text: "PatientIntakeForm"
├── sessions/
│   ├── UserRegistrationForm/
│   │   ├── session.json              # v2.0.0 — session state for this form
│   │   ├── requirements-brief.md     # Phase 1 artifact
│   │   ├── enhanced-brief.md         # Phase 1.5 artifact
│   │   ├── form-plan.md              # Phase 2 artifact
│   │   ├── technical-choices.md      # Phase 2.5 artifact
│   │   └── prototype.html            # Phase 3 artifact (moved from prototype/)
│   └── PatientIntakeForm/
│       ├── session.json
│       └── requirements-brief.md
└── history/                          # archived sessions (unchanged)
    └── FormName_2026-05-26T09-30-00Z/
```

### Phase pipeline (unchanged):
```
Phase 1 → 1.5 → 2 → 2.5 → 3 → 4 → 5
```

| Phase | Key | Skill | Old Artifact Path | New Artifact Path |
|-------|-----|-------|--------------------|-------------------|
| Requirements | `"1"` | rjsf-requirements | `.rjsf/requirements-brief.md` | `{sessionDir}/requirements-brief.md` |
| Feature Suggestions | `"1.5"` | rjsf-suggest | `.rjsf/enhanced-brief.md` | `{sessionDir}/enhanced-brief.md` |
| Planning | `"2"` | rjsf-plan | `.rjsf/form-plan.md` | `{sessionDir}/form-plan.md` |
| Technical Decisions | `"2.5"` | rjsf-technical | `.rjsf/technical-choices.md` | `{sessionDir}/technical-choices.md` |
| Prototype | `"3"` | rjsf-prototype | `prototype/prototype.html` | `{sessionDir}/prototype.html` |
| Execution | `"4"` | rjsf-execute | `src/forms/<FormName>/` | `src/forms/<FormName>/` (unchanged) |
| Testing | `"5"` | rjsf-test | `src/forms/<FormName>/<FormName>.test.tsx` | (unchanged) |

**Convention:** Throughout this plan, `{sessionDir}` means `.rjsf/sessions/{formName}/` where `formName` is the PascalCase form name from the active session.

---

## Task 1: Update `references/session-pattern.md` — Master Reference

All skills reference this file. Must be updated first.

**Files:**
- Modify: `references/session-pattern.md`

- [ ] **Step 1: Add Section 0 — Multi-Session Directory Structure**

Insert before Section 1 (before line 1 `# Session Pattern Reference`). Replace the entire file header and add Section 0:

**Old (line 1-4):**
```markdown
# Session Pattern Reference

The session file tracks pipeline progress across skill invocations. Skills read it at start to resume work and write it after each phase completes.

---
```

**New:**
```markdown
# Session Pattern Reference

The session file tracks pipeline progress across skill invocations. Skills read it at start to resume work and write it after each phase completes.

---

## 0. Multi-Session Directory Structure

The `.rjsf/` directory supports multiple concurrent form sessions. Each form gets its own subdirectory under `.rjsf/sessions/`.

### Directory layout

```
.rjsf/
├── active-session                    # Plain text file containing the active formName
├── sessions/
│   ├── <FormNameA>/
│   │   ├── session.json              # Session metadata for this form
│   │   ├── requirements-brief.md     # Phase 1 artifact
│   │   ├── enhanced-brief.md         # Phase 1.5 artifact
│   │   ├── form-plan.md              # Phase 2 artifact
│   │   ├── technical-choices.md      # Phase 2.5 artifact
│   │   └── prototype.html            # Phase 3 artifact
│   └── <FormNameB>/
│       ├── session.json
│       └── ...
└── history/                          # Archived sessions
    └── <FormName>_<ISO-timestamp>/
```

### Active session pointer

The file `.rjsf/active-session` is a plain text file containing exactly one line: the `formName` (PascalCase) of the currently active session. No newline required, no JSON — just the name string.

Example contents: `PatientIntakeForm`

### Session path resolution algorithm

**All skills MUST resolve the session path using this algorithm before any session read/write:**

1. Read `.rjsf/active-session`. If the file does not exist, check for legacy format (see Section 7).
2. Let `formName` = contents of `.rjsf/active-session` (trimmed).
3. Let `sessionDir` = `.rjsf/sessions/{formName}/`.
4. The session file is at: `{sessionDir}/session.json`.
5. All phase artifacts are stored under: `{sessionDir}/` (e.g., `{sessionDir}/requirements-brief.md`).
6. `artifactPath` values in session.json are filenames only (e.g., `"requirements-brief.md"`), relative to `sessionDir`.

---
```

- [ ] **Step 2: Update Section 1 — Session Schema**

Update the `version` to `"2.0.0"` and change all `artifactPath` values to be relative filenames (not full paths):

**Old (lines 10-23 in the schema JSON):**
```json
    "1": {
      "status": "completed",
      "startedAt": "2026-05-26T09:00:00Z",
      "completedAt": "2026-05-26T09:05:00Z",
      "artifactPath": ".rjsf/requirements-brief.md"
    },
    "1.5": {
      "status": "completed",
      "startedAt": "2026-05-26T09:05:00Z",
      "completedAt": "2026-05-26T09:08:00Z",
      "artifactPath": ".rjsf/enhanced-brief.md"
    },
```

**New:**
```json
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
```

Apply the same pattern to all phases in the example. Change `"artifactPath": ".rjsf/form-plan.md"` → `"form-plan.md"`, `".rjsf/technical-choices.md"` → `"technical-choices.md"`, `"prototype/prototype.html"` → `"prototype.html"`. Change `"version": "1.1.0"` → `"version": "2.0.0"`.

- [ ] **Step 3: Update Phase Keys table**

**Old (lines 91-99):**
```markdown
| `"1"` | Requirements | `rjsf-requirements` | `.rjsf/requirements-brief.md` |
| `"1.5"` | Feature Suggestions | `rjsf-suggest` | `.rjsf/enhanced-brief.md` |
| `"2"` | Planning | `rjsf-plan` | `.rjsf/form-plan.md` |
| `"2.5"` | Technical Decisions | `rjsf-technical` | `.rjsf/technical-choices.md` |
| `"3"` | Prototype | `rjsf-prototype` | `prototype/prototype.html` |
```

**New:**
```markdown
| `"1"` | Requirements | `rjsf-requirements` | `requirements-brief.md` |
| `"1.5"` | Feature Suggestions | `rjsf-suggest` | `enhanced-brief.md` |
| `"2"` | Planning | `rjsf-plan` | `form-plan.md` |
| `"2.5"` | Technical Decisions | `rjsf-technical` | `technical-choices.md` |
| `"3"` | Prototype | `rjsf-prototype` | `prototype.html` |
```

Add a note after the table: "All artifact paths are relative to the session directory (`{sessionDir}`). Resolve by prepending `.rjsf/sessions/{formName}/`."

- [ ] **Step 4: Update Section 3 — How to Read Session at Skill Start**

**Old (lines 116-133):**
```markdown
## 3. How to Read Session at Skill Start

Execute these steps in order at the beginning of any skill that participates in the pipeline:

1. **Check for session file.** Look for `.rjsf/session.json` in the project root (current working directory). If the file does not exist, this is a fresh start — initialize a new session (see Section 4) and begin at the first phase.

2. **Parse the JSON.** Read and parse `.rjsf/session.json`. If parsing fails (invalid JSON), warn the user and offer to reset the session.

3. **Identify the current phase.** Read `session.currentPhase`. This is the numeric phase key the skill should work on.

4. **Check phase status.** Read `session.phases[currentPhase].status`:
   - If `in_progress`: Resume the phase from where it left off. Read the artifact at `artifactPath` if it exists.
   - If `completed`: The phase was already finished. Ask the user if they want to re-run it or advance to the next phase.
   - If `pending`: This phase has not started. Set status to `in_progress`, set `startedAt` to now, and begin the phase.
   - If `awaiting_client_approval`: Present the existing artifact to the user and wait for explicit approval before proceeding.

5. **Load prior artifacts.** For each phase that is `completed`, read its `artifactPath` to load the data produced. These are the inputs to the current phase.
```

**New:**
```markdown
## 3. How to Read Session at Skill Start

Execute these steps in order at the beginning of any skill that participates in the pipeline:

1. **Resolve the session path.** Follow the session path resolution algorithm from Section 0:
   - Read `.rjsf/active-session`. If it does not exist:
     - Check for `.rjsf/session.json` (legacy single-session format). If found, auto-migrate (Section 7).
     - If no legacy file either, this is a fresh start — there is no active session.
   - Let `formName` = contents of `.rjsf/active-session` (trimmed).
   - Let `sessionDir` = `.rjsf/sessions/{formName}/`.
   - Let `sessionFile` = `{sessionDir}/session.json`.

2. **Check for session file.** Look for `sessionFile`. If it does not exist, warn the user: "Active session points to {formName} but no session.json found. Run `/rjsf-new {formName}` to create it, or `/rjsf-switch` to choose a different session."

3. **Parse the JSON.** Read and parse `sessionFile`. If parsing fails (invalid JSON), warn the user and offer to reset the session.

4. **Identify the current phase.** Read `session.currentPhase`. This is the numeric phase key the skill should work on.

5. **Check phase status.** Read `session.phases[currentPhase].status`:
   - If `in_progress`: Resume the phase from where it left off. Read the artifact at `{sessionDir}/{artifactPath}` if it exists.
   - If `completed`: The phase was already finished. Ask the user if they want to re-run it or advance to the next phase.
   - If `pending`: This phase has not started. Set status to `in_progress`, set `startedAt` to now, and begin the phase.
   - If `awaiting_client_approval`: Present the existing artifact to the user and wait for explicit approval before proceeding.

6. **Load prior artifacts.** For each phase that is `completed`, read its artifact at `{sessionDir}/{artifactPath}`. These are the inputs to the current phase.
```

- [ ] **Step 5: Update Section 4 — How to Write Session**

**Old (lines 136-152):**
```markdown
## 4. How to Write Session After Phase Completion

Execute these steps in order after a phase finishes successfully:

1. **Write the phase artifact.** Save the primary output of the phase to its designated path (see Phase Keys table). Create the `.rjsf/` directory if it does not exist.

2. **Update the completed phase in session.** Set:
   - `phases[phaseKey].status` → `"completed"`
   - `phases[phaseKey].completedAt` → current ISO 8601 timestamp
   - `phases[phaseKey].artifactPath` → relative path to the artifact written in step 1

3. **Determine the next phase.** Find the next phase in the pipeline order: `1 → 1.5 → 2 → 2.5 → 3 → 4 → 5`.

4. **Update session.currentPhase.** Set `session.currentPhase` to the next phase key. Set `phases[nextPhaseKey].status` to `"pending"` (it remains pending until that skill runs).

5. **Write session.json.** Overwrite `.rjsf/session.json` with the updated session object. Always write the full object (not a partial merge) to avoid stale data.
```

**New:**
```markdown
## 4. How to Write Session After Phase Completion

Execute these steps in order after a phase finishes successfully:

1. **Write the phase artifact.** Save the primary output of the phase to `{sessionDir}/{artifactFilename}` (see Phase Keys table for filenames). Create the session directory if it does not exist.

2. **Update the completed phase in session.** Set:
   - `phases[phaseKey].status` → `"completed"`
   - `phases[phaseKey].completedAt` → current ISO 8601 timestamp
   - `phases[phaseKey].artifactPath` → artifact filename only (e.g., `"requirements-brief.md"`, not a full path)

3. **Determine the next phase.** Find the next phase in the pipeline order: `1 → 1.5 → 2 → 2.5 → 3 → 4 → 5`.

4. **Update session.currentPhase.** Set `session.currentPhase` to the next phase key. Set `phases[nextPhaseKey].status` to `"pending"` (it remains pending until that skill runs).

5. **Write session.json.** Overwrite `{sessionDir}/session.json` with the updated session object. Always write the full object (not a partial merge) to avoid stale data.
```

- [ ] **Step 6: Update Section 5 — Artifact Files table**

**Old (lines 155-166):**
```markdown
## 5. Artifact Files

| Phase Key | Artifact Path | Format |
|---|---|---|
| `1` | `.rjsf/requirements-brief.md` | Markdown — captured requirements, field list, validation rules |
| `1.5` | `.rjsf/enhanced-brief.md` | Markdown — enhanced requirements with UI/UX choices applied, customization summary |
| `2` | `.rjsf/form-plan.md` | Markdown — layout decisions, widget assignments, customization assessment, step map |
| `2.5` | `.rjsf/technical-choices.md` | Markdown — technical decisions (schema version, validator, submission pattern, etc.) |
| `3` | `prototype/prototype.html` | HTML — self-contained client prototype |
| `4` | `src/forms/<FormName>/` | TypeScript React — schema.ts, uiSchema.ts, types.ts, index.tsx, custom components |
| `5` | `src/forms/<FormName>/<FormName>.test.tsx` | TypeScript — test file covering validation, conditions, accessibility |
```

**New:**
```markdown
## 5. Artifact Files

All artifact paths (Phase 1–3) are relative to the session directory (`{sessionDir}` = `.rjsf/sessions/{formName}/`).

| Phase Key | Artifact Filename | Format |
|---|---|---|
| `1` | `requirements-brief.md` | Markdown — captured requirements, field list, validation rules |
| `1.5` | `enhanced-brief.md` | Markdown — enhanced requirements with UI/UX choices applied, customization summary |
| `2` | `form-plan.md` | Markdown — layout decisions, widget assignments, customization assessment, step map |
| `2.5` | `technical-choices.md` | Markdown — technical decisions (schema version, validator, submission pattern, etc.) |
| `3` | `prototype.html` | HTML — self-contained client prototype |
| `4` | `src/forms/<FormName>/` | TypeScript React — schema.ts, uiSchema.ts, types.ts, index.tsx, custom components (outside session dir) |
| `5` | `src/forms/<FormName>/<FormName>.test.tsx` | TypeScript — test file (outside session dir) |
```

- [ ] **Step 7: Update Section 6 — Archiving Steps**

**Old (lines 169-189):**
```markdown
## 6. .rjsf/history/ Archiving Steps

Archive the current session when starting a completely new form (same project) or when the user explicitly requests a reset.

1. **Create the archive directory.** Create `.rjsf/history/{formName}_{timestamp}/` where `timestamp` is the ISO 8601 date-time of archival with colons replaced by hyphens (e.g., `UserRegistrationForm_2026-05-26T09-30-00Z`).

2. **Copy session.json.** Copy `.rjsf/session.json` to `.rjsf/history/{formName}_{timestamp}/session.json`.

3. **Copy all artifacts.** For each phase in the archived session that has a non-null `artifactPath`, copy the artifact file into the archive directory. Preserve the filename but flatten the path (do not recreate subdirectories inside the archive).

4. **Clear active files.** Delete the following files from `.rjsf/` (not from the archive):
   - `.rjsf/session.json`
   - `.rjsf/requirements-brief.md`
   - `.rjsf/enhanced-brief.md`
   - `.rjsf/form-plan.md`
   - `.rjsf/technical-choices.md`
   Do NOT delete the component file at `outputPath` — that is user-owned production code.
   Do NOT delete `prototype/prototype.html` — it may be needed for reference.

5. **Start fresh.** After clearing, initialize a new `.rjsf/session.json` for the new form with all phases set to `pending`. Proceed with the first skill in the pipeline.
```

**New:**
```markdown
## 6. .rjsf/history/ Archiving Steps

Archive a session when the user explicitly deletes it via `/rjsf-delete` or when starting fresh on the same form name.

1. **Create the archive directory.** Create `.rjsf/history/{formName}_{timestamp}/` where `timestamp` is the ISO 8601 date-time of archival with colons replaced by hyphens (e.g., `UserRegistrationForm_2026-05-26T09-30-00Z`).

2. **Copy session directory.** Copy the entire `.rjsf/sessions/{formName}/` directory contents into the archive directory.

3. **Remove the session directory.** Delete `.rjsf/sessions/{formName}/` entirely.

4. **Update active-session pointer.** If the archived session was the active session (`.rjsf/active-session` contained `{formName}`):
   - Check if any other sessions exist under `.rjsf/sessions/`.
   - If yes: delete `.rjsf/active-session` and tell the user: "Active session archived. Run `/rjsf-switch` to select another session, or `/rjsf-new` to create one."
   - If no other sessions exist: delete `.rjsf/active-session`.

5. **Do NOT delete generated code.** The files at `outputPath` (e.g., `src/forms/<FormName>/`) are user-owned production code and must not be deleted.
```

- [ ] **Step 8: Add Section 7 — Legacy Migration**

Append after Section 6:

```markdown
---

## 7. Legacy Migration (flat → multi-session)

If `.rjsf/session.json` exists but `.rjsf/active-session` does not, the project uses the legacy single-session format. Migrate automatically:

1. **Read the legacy session.** Parse `.rjsf/session.json` and extract `formName`.

2. **Create the session directory.** Create `.rjsf/sessions/{formName}/`.

3. **Move session.json.** Move `.rjsf/session.json` to `.rjsf/sessions/{formName}/session.json`.

4. **Move artifacts.** For each phase in the session that has a non-null `artifactPath`:
   - If the artifact file exists at the legacy path (e.g., `.rjsf/requirements-brief.md`), move it to `.rjsf/sessions/{formName}/{filename}`.
   - Update `artifactPath` in session.json to be the filename only (e.g., `"requirements-brief.md"`).

5. **Move prototype.** If `prototype/prototype.html` exists, move it to `.rjsf/sessions/{formName}/prototype.html`. Update `phases["3"].artifactPath` to `"prototype.html"`.

6. **Update version.** Set `session.version` to `"2.0.0"`.

7. **Set active session.** Write `{formName}` to `.rjsf/active-session`.

8. **Write updated session.json.** Write the updated session object to `.rjsf/sessions/{formName}/session.json`.

9. **Notify the user.** Tell the user: "Migrated your session for **{formName}** to the new multi-session format. You can now run `/rjsf-new` to create additional form sessions."
```

- [ ] **Step 9: Commit**

```bash
git add references/session-pattern.md
git commit -m "feat: update session-pattern.md for multi-session support

Add per-form session directories (Section 0), path resolution algorithm,
updated read/write procedures, and legacy migration (Section 7).

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Create New Session Management Skills

Create all 4 new skills in one task since they are small, independent files.

**Files:**
- Create: `skills/rjsf-new/SKILL.md`
- Create: `skills/rjsf-switch/SKILL.md`
- Create: `skills/rjsf-list/SKILL.md`
- Create: `skills/rjsf-delete/SKILL.md`

- [ ] **Step 1: Create `skills/rjsf-new/SKILL.md`**

```markdown
---
name: rjsf-new
description: Create a new named RJSF form session and set it as active
argument-hint: <FormName>
allowed-tools: [Read, Write, Glob, Bash]
---

# RJSF New Session

**Trigger:** `/rjsf-new <FormName>`

Creates a new named session directory and sets it as the active session. All subsequent `/rjsf-*` commands will operate on this session.

---

## Step 1 — Validate Input

If no `FormName` is provided, ask: "What should this form be called? (PascalCase, e.g., PatientIntakeForm)"

Validate the name:
- Must be PascalCase (start with uppercase letter, no spaces, no special characters except letters and numbers).
- If the name is not PascalCase, convert it: "patient intake form" → `PatientIntakeForm`, "loan-app" → `LoanApp`.

---

## Step 2 — Check for Legacy Migration

If `.rjsf/session.json` exists but `.rjsf/active-session` does not, perform the legacy migration described in `references/session-pattern.md` Section 7 before proceeding.

---

## Step 3 — Check for Conflicts

Check if `.rjsf/sessions/{FormName}/` already exists.

**If it exists:**
Read `.rjsf/sessions/{FormName}/session.json` and show:

> "A session named **{FormName}** already exists (Phase {currentPhase}, status: {status}).
>
> - To work on it: `/rjsf-switch {FormName}`
> - To pick a different name: `/rjsf-new <DifferentName>`"

Stop here. Do not overwrite an existing session.

---

## Step 4 — Create Session

1. Create directory `.rjsf/sessions/{FormName}/`.
2. Write `.rjsf/sessions/{FormName}/session.json`:

```json
{
  "version": "2.0.0",
  "formName": "{FormName}",
  "outputPath": null,
  "rjsfTheme": null,
  "stylingApproach": null,
  "technicalChoices": {},
  "currentPhase": "1",
  "phases": {
    "1":   { "status": "pending", "startedAt": null, "completedAt": null, "artifactPath": null },
    "1.5": { "status": "pending", "startedAt": null, "completedAt": null, "artifactPath": null },
    "2":   { "status": "pending", "startedAt": null, "completedAt": null, "artifactPath": null },
    "2.5": { "status": "pending", "startedAt": null, "completedAt": null, "artifactPath": null },
    "3":   { "status": "pending", "startedAt": null, "completedAt": null, "artifactPath": null },
    "4":   { "status": "pending", "startedAt": null, "completedAt": null, "artifactPath": null },
    "5":   { "status": "pending", "startedAt": null, "completedAt": null, "artifactPath": null }
  }
}
```

3. Write `{FormName}` to `.rjsf/active-session` (overwriting any previous value).

---

## Step 5 — Confirmation

> "Created session **{FormName}** and set it as active.
>
> - Start building: `/rjsf-build "describe your form"`
> - See all sessions: `/rjsf-list`
> - Switch to another session: `/rjsf-switch <name>`"
```

- [ ] **Step 2: Create `skills/rjsf-switch/SKILL.md`**

```markdown
---
name: rjsf-switch
description: Switch the active RJSF session to an existing named session
argument-hint: <FormName>
allowed-tools: [Read, Write, Glob]
---

# RJSF Switch Session

**Trigger:** `/rjsf-switch <FormName>` or `/rjsf-switch` (to show a picker)

Switches the active session pointer so all subsequent `/rjsf-*` commands operate on the selected session.

---

## Step 1 — List Available Sessions

Read all directories under `.rjsf/sessions/`. Each directory name is a session name.

If no sessions exist:
> "No sessions found. Run `/rjsf-new <FormName>` to create one."
Stop here.

---

## Step 2 — Select Session

**If `FormName` argument is provided:**
- Check if `.rjsf/sessions/{FormName}/session.json` exists.
- If it does not exist: "No session named **{FormName}**. Available sessions:" then list all session names and stop.

**If no argument provided:**
- Read each session's `session.json` and show a numbered list:

> "Select a session to switch to:
>
> 1. **UserRegistrationForm** — Phase 3 (Prototype), awaiting client approval
> 2. **PatientIntakeForm** — Phase 1 (Requirements), in progress
> 3. **LoanApplication** — Phase 5 (Testing), completed
>
> Enter the number or name:"

Wait for the user's choice.

---

## Step 3 — Check Current Active

Read `.rjsf/active-session`. If the user is switching to the session that is already active:
> "**{FormName}** is already the active session."
Stop here.

---

## Step 4 — Switch

1. Write `{FormName}` to `.rjsf/active-session` (overwriting the previous value).
2. Read `.rjsf/sessions/{FormName}/session.json` to get current state.

---

## Step 5 — Confirmation

> "Switched to **{FormName}** (Phase {currentPhase} — {phaseName}, status: {status}).
>
> - Continue building: `/rjsf-build`
> - Check progress: `/rjsf-status`
> - See all sessions: `/rjsf-list`"
```

- [ ] **Step 3: Create `skills/rjsf-list/SKILL.md`**

```markdown
---
name: rjsf-list
description: List all RJSF form sessions in this project with their phase and status
allowed-tools: [Read, Glob]
---

# RJSF List Sessions

**Trigger:** `/rjsf-list`

Displays a table of all sessions in the project with their current phase and status.

---

## Step 1 — Find Sessions

List all directories under `.rjsf/sessions/`. Each directory name is a session name.

If the `.rjsf/sessions/` directory does not exist or is empty:
> "No sessions found. Run `/rjsf-new <FormName>` to create one."
Stop here.

---

## Step 2 — Read Active Session

Read `.rjsf/active-session` to determine which session is currently active. If the file does not exist, no session is active.

---

## Step 3 — Read Each Session

For each session directory, read its `session.json` and extract: `formName`, `currentPhase`, `phases[currentPhase].status`, `outputPath`, and count how many phases are completed.

---

## Step 4 — Display Table

Format and display:

```
RJSF Sessions ({N} total)

  * UserRegistrationForm     Phase 3 — Prototype        ⏳ awaiting client approval   → src/forms/UserRegistrationForm/
    PatientIntakeForm        Phase 1 — Requirements      ⏳ in progress                → (not set)
    LoanApplication          Phase 5 — Testing           ✅ completed                  → src/forms/LoanApplication/

  * = active session
```

Use `*` prefix to mark the active session. Use status icons: ✅ completed, ⏳ in_progress or awaiting_client_approval, ⬜ pending.

Phase name mapping: `"1"` → Requirements, `"1.5"` → Feature Suggestions, `"2"` → Planning, `"2.5"` → Technical Decisions, `"3"` → Prototype, `"4"` → Execution, `"5"` → Testing.

---

## Step 5 — Suggest Actions

> "Commands:
> - Switch: `/rjsf-switch <name>`
> - New session: `/rjsf-new <name>`
> - Delete: `/rjsf-delete <name>`
> - Continue active: `/rjsf-build`"
```

- [ ] **Step 4: Create `skills/rjsf-delete/SKILL.md`**

```markdown
---
name: rjsf-delete
description: Archive and remove an RJSF form session
argument-hint: <FormName>
allowed-tools: [Read, Write, Glob, Bash]
---

# RJSF Delete Session

**Trigger:** `/rjsf-delete <FormName>`

Archives a session to `.rjsf/history/` and removes it from active sessions.

---

## Step 1 — Validate Input

If no `FormName` is provided, list all sessions and ask: "Which session do you want to delete?"

Check if `.rjsf/sessions/{FormName}/session.json` exists. If not:
> "No session named **{FormName}**. Run `/rjsf-list` to see available sessions."
Stop here.

---

## Step 2 — Confirm Deletion

Read `.rjsf/sessions/{FormName}/session.json` and show the session summary:

> "Delete session **{FormName}**?
>
> - Current phase: Phase {currentPhase} — {phaseName} ({status})
> - Completed phases: {count}/7
> - Output path: {outputPath}
>
> The session files will be archived to `.rjsf/history/`. Generated code at `{outputPath}` will NOT be deleted.
>
> Type 'yes' to confirm."

Wait for explicit confirmation. Do not proceed on ambiguous input.

---

## Step 3 — Archive

Follow the archiving procedure in `references/session-pattern.md` Section 6:

1. Create `.rjsf/history/{FormName}_{ISO-timestamp}/` (colons → hyphens in timestamp).
2. Copy all files from `.rjsf/sessions/{FormName}/` into the archive.
3. Delete `.rjsf/sessions/{FormName}/` directory.
4. If this was the active session (`.rjsf/active-session` contains `{FormName}`):
   - If other sessions exist: delete `.rjsf/active-session`, tell user to run `/rjsf-switch`.
   - If no other sessions: delete `.rjsf/active-session`.

---

## Step 4 — Confirmation

> "Session **{FormName}** archived to `.rjsf/history/{FormName}_{timestamp}/`.
> Generated code at `{outputPath}` was preserved.
>
> - See remaining sessions: `/rjsf-list`
> - Create a new session: `/rjsf-new <name>`"
```

- [ ] **Step 5: Commit all new skills**

```bash
git add skills/rjsf-new/SKILL.md skills/rjsf-switch/SKILL.md skills/rjsf-list/SKILL.md skills/rjsf-delete/SKILL.md
git commit -m "feat: add session management skills (new, switch, list, delete)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Update Core Routing Skills (build, form, status)

These three skills handle session discovery and routing. They need the most significant changes.

**Files:**
- Modify: `skills/rjsf-build/SKILL.md`
- Modify: `skills/rjsf-form/SKILL.md`
- Modify: `skills/rjsf-status/SKILL.md`

- [ ] **Step 1: Update `rjsf-build` Step 1**

**Old (lines 16-40):**
```markdown
## Step 1 — Check for Existing Session

Read `.rjsf/session.json` if it exists.

**If the session is incomplete (not all phases "completed"):**

> "Found an active session for **<FormName>** (Phase <currentPhase> — <phase name>, status: <status>).
>
> A) Resume from Phase <currentPhase>
> B) Start fresh (the current session will be archived to `.rjsf/history/`)"

- On **A**: jump to the routing step for `currentPhase` (see Step 3).
- On **B**: archive the current session (follow `references/session-pattern.md` archiving instructions), then proceed to Phase 1.

**If the session is fully completed (all phases "completed"):**

> "<FormName> was fully built on <completedDate>.
>
> A) Iterate on it — describe what you'd like to change
> B) Build a new form — provide requirements and I'll start Phase 1"

- On **A**: read the developer's change description and route to `/rjsf-iterate`.
- On **B**: archive the session and start Phase 1.

**If no session exists:** proceed directly to Phase 1.
```

**New:**
```markdown
## Step 1 — Check for Existing Session

Resolve the active session using the algorithm in `references/session-pattern.md` Section 0:
1. Read `.rjsf/active-session` to find the active `formName`.
2. If it exists, let `sessionDir` = `.rjsf/sessions/{formName}/` and read `{sessionDir}/session.json`.
3. If `.rjsf/active-session` does not exist but `.rjsf/session.json` does (legacy), auto-migrate per Section 7.

**If an active session exists and is incomplete (not all phases "completed"):**

> "Active session: **{formName}** (Phase {currentPhase} — {phase name}, status: {status}).
>
> A) Resume from Phase {currentPhase}
> B) Start fresh (archive this session and create a new one)"

- On **A**: jump to the routing step for `currentPhase` (see Step 3).
- On **B**: archive the current session (follow `references/session-pattern.md` Section 6). Ask: "Enter a name for the new form (PascalCase):" — run `/rjsf-new {name}` implicitly, then proceed to Phase 1.

**If an active session exists and is fully completed (all phases "completed"):**

> "**{formName}** was fully built on {completedDate}.
>
> A) Iterate on it — describe what you'd like to change
> B) Build a new form — create a new session"

- On **A**: read the developer's change description and route to `/rjsf-iterate`.
- On **B**: ask "Enter a name for the new form (PascalCase):" — run `/rjsf-new {name}` implicitly, then start Phase 1. The old session is preserved (not archived).

**If no active session and no legacy session:**
- If the developer provided requirements text or `--from` flag, ask for a form name, run `/rjsf-new {name}` implicitly, then proceed to Phase 1.
- If no input provided: "No active session. Run `/rjsf-new <FormName>` to create one, or `/rjsf-list` to see existing sessions."
```

- [ ] **Step 2: Update `rjsf-build` Step 3 — prototype path reference**

**Old (line 79):**
```markdown
            Tell developer: "Share prototype/prototype.html with your client.
```

**New:**
```markdown
            Tell developer: "Share the prototype with your client (path shown by Phase 3).
```

- [ ] **Step 3: Update `rjsf-build` Step 4 — Completion Summary**

**Old (lines 96-103):**
```markdown
> "**<FormName> is complete.** All phases done.
>
> - **Make changes:** `/rjsf-iterate \"describe change\"`
> - **Build another form:** `/rjsf-build \"describe new form\"`
> - **Run tests:** `npx vitest <outputPath>` or `npx jest <outputPath>`
> - **Check session:** `/rjsf-status`"
```

**New:**
```markdown
> "**{FormName} is complete.** All phases done.
>
> - **Make changes:** `/rjsf-iterate \"describe change\"`
> - **Build another form:** `/rjsf-new <NewFormName>`
> - **Switch sessions:** `/rjsf-switch`
> - **Run tests:** `npx vitest <outputPath>` or `npx jest <outputPath>`
> - **Check session:** `/rjsf-status`"
```

- [ ] **Step 4: Update `rjsf-form` Step 1**

**Old (lines 16-18):**
```markdown
## Step 1 — Read Session

Read `.rjsf/session.json` if it exists.
```

**New:**
```markdown
## Step 1 — Read Session

Resolve the active session using the algorithm in `references/session-pattern.md` Section 0. Read `.rjsf/active-session` to find the active `formName`, then read `.rjsf/sessions/{formName}/session.json`. If `.rjsf/active-session` does not exist but `.rjsf/session.json` does (legacy), auto-migrate per Section 7.
```

- [ ] **Step 5: Update `rjsf-form` Step 2 — No session menus**

**Old (lines 27-35):**
```markdown
### No session + no input
Display this menu and wait for the developer's choice:

> "Welcome to rjsf-agent! What would you like to do?
>
> A) Build a new form from requirements → `/rjsf-build`
> B) Modify an existing generated form → `/rjsf-iterate`
> C) Generate tests for an existing form → `/rjsf-test`
> D) See all commands → `/rjsf-help`"
```

**New:**
```markdown
### No active session + no input
First check if other sessions exist under `.rjsf/sessions/`. If sessions exist but none is active:

> "You have {N} session(s) but none is active:
>
> {numbered list of sessions with phase/status}
>
> A) Switch to an existing session → `/rjsf-switch`
> B) Create a new form session → `/rjsf-new <FormName>`
> C) See all commands → `/rjsf-help`"

If no sessions exist at all, display:

> "Welcome to rjsf-agent! What would you like to do?
>
> A) Build a new form from requirements → `/rjsf-new <FormName>` then `/rjsf-build`
> B) Modify an existing generated form → `/rjsf-iterate`
> C) Generate tests for an existing form → `/rjsf-test`
> D) See all commands → `/rjsf-help`"
```

- [ ] **Step 6: Update `rjsf-form` session exists sections**

**Old (lines 37-48) — Session exists, incomplete:**
```markdown
### Session exists, incomplete
Show the `/rjsf-status` output (read session.json and format it), then:

> "Run `/rjsf-build` to continue from Phase <N>, or tell me what you'd like to change."
```

**New:**
```markdown
### Session exists, incomplete
Show the active session name and `/rjsf-status` output, then:

> "Active session: **{formName}** (Phase {N} — {phaseName})
>
> Run `/rjsf-build` to continue, or `/rjsf-switch` to work on a different form."
```

**Old (lines 43-48) — Session exists, completed:**
```markdown
### Session exists, completed
> "<FormName> is complete.
>
> - To change something: `/rjsf-iterate \"describe change\"`
> - To build a new form: `/rjsf-build \"describe new form\"`
> - To re-run tests: `/rjsf-test`
> - For help: `/rjsf-help`"
```

**New:**
```markdown
### Session exists, completed
> "**{FormName}** is complete.
>
> - To change something: `/rjsf-iterate \"describe change\"`
> - To start a new form: `/rjsf-new <NewFormName>`
> - To switch sessions: `/rjsf-switch`
> - To re-run tests: `/rjsf-test`
> - For help: `/rjsf-help`"
```

- [ ] **Step 7: Add session management intents to `rjsf-form` intent map**

Add these rows to the Natural Language Intent Map table:

```markdown
| "switch", "switch to", "work on" | `/rjsf-switch` |
| "list sessions", "show sessions", "all sessions", "my forms" | `/rjsf-list` |
| "new session", "create session", "new form session" | `/rjsf-new` |
| "delete session", "remove session", "archive session" | `/rjsf-delete` |
```

- [ ] **Step 8: Update `rjsf-status` Step 1**

**Old (lines 13-19):**
```markdown
## Step 1 — Read Session

Read `.rjsf/session.json`.

If no session file exists:
> "No active session found. Run `/rjsf-build` to start building a form."
Stop here.
```

**New:**
```markdown
## Step 1 — Read Session

Resolve the active session using the algorithm in `references/session-pattern.md` Section 0. Read `.rjsf/active-session` to find the active `formName`, then read `.rjsf/sessions/{formName}/session.json`. If `.rjsf/active-session` does not exist but `.rjsf/session.json` does, auto-migrate per Section 7.

If no active session exists:
- Check if any sessions exist under `.rjsf/sessions/`.
- If sessions exist: "No active session, but {N} session(s) found. Run `/rjsf-switch` to select one, or `/rjsf-list` to see them all."
- If no sessions exist: "No sessions found. Run `/rjsf-new <FormName>` to create one."
Stop here.
```

- [ ] **Step 9: Add "Other sessions" section to `rjsf-status` Step 2**

After the existing status display format, add:

```markdown
### Other sessions

After the active session status, list any other sessions that exist under `.rjsf/sessions/`:

```
Other sessions:
  PatientIntakeForm        Phase 2 — Planning    ✅ completed
  LoanApplication          Phase 5 — Testing     ⏳ in progress

Switch: /rjsf-switch <name>
```

If no other sessions exist, omit this section.
```

- [ ] **Step 10: Update `rjsf-status` Step 3 — prototype path reference**

**Old (line 54):**
```markdown
| Phase `3` is `awaiting_client_approval` | "Share `prototype/prototype.html` with your client, then run `/rjsf-build` once they confirm." |
```

**New:**
```markdown
| Phase `3` is `awaiting_client_approval` | "Share the prototype with your client (see `{sessionDir}/prototype.html`), then run `/rjsf-build` once they confirm." |
```

- [ ] **Step 11: Commit**

```bash
git add skills/rjsf-build/SKILL.md skills/rjsf-form/SKILL.md skills/rjsf-status/SKILL.md
git commit -m "feat: update build, form, status skills for multi-session routing

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Update All Phase Skills (requirements → suggest → plan → technical → prototype → execute → test → iterate)

All 8 phase skills need the same two changes: (1) resolve session path in Step 1, (2) write artifacts to `{sessionDir}/` instead of `.rjsf/`.

**Files:**
- Modify: `skills/rjsf-requirements/SKILL.md`
- Modify: `skills/rjsf-suggest/SKILL.md`
- Modify: `skills/rjsf-plan/SKILL.md`
- Modify: `skills/rjsf-technical/SKILL.md`
- Modify: `skills/rjsf-prototype/SKILL.md`
- Modify: `skills/rjsf-execute/SKILL.md`
- Modify: `skills/rjsf-test/SKILL.md`
- Modify: `skills/rjsf-iterate/SKILL.md`

**Pattern for every skill:** Replace hardcoded `.rjsf/session.json` reads with the resolved path, and replace all `.rjsf/<artifact>` paths with `{sessionDir}/<artifact>`. The session directory variable `sessionDir` = `.rjsf/sessions/{formName}/` where `formName` comes from `.rjsf/active-session`.

- [ ] **Step 1: Update `rjsf-requirements` — Step 1 session read**

Replace the first line of Step 1 (line 16):

**Old:** `Check for `.rjsf/session.json` in the project root (see `references/session-pattern.md` for the full schema and read/write rules).`

**New:** `Resolve the active session path (see `references/session-pattern.md` Section 0 for the path resolution algorithm and Section 3 for the full read procedure). Let `sessionDir` = `.rjsf/sessions/{formName}/`.`

Then replace all occurrences of `.rjsf/requirements-brief.md` with `{sessionDir}/requirements-brief.md` in the Step 1 resume/reuse logic.

- [ ] **Step 2: Update `rjsf-requirements` — Step 6 session write**

Replace all occurrences in the save step:
- `.rjsf/requirements-brief.md` → `{sessionDir}/requirements-brief.md`
- `Create the .rjsf/ directory if it does not exist` → `Create the session directory if it does not exist`
- `Create or update .rjsf/session.json` → `Create or update {sessionDir}/session.json`
- `".rjsf/requirements-brief.md"` (artifactPath value) → `"requirements-brief.md"`

- [ ] **Step 3: Update `rjsf-suggest` — Step 1 and Step 6**

Step 1 (line 18): Replace `Read `.rjsf/session.json`.` with `Resolve the active session path (see `references/session-pattern.md` Section 0). Let `sessionDir` = `.rjsf/sessions/{formName}/`. Read `{sessionDir}/session.json`.`

Replace all `.rjsf/requirements-brief.md` → `{sessionDir}/requirements-brief.md`
Replace all `.rjsf/enhanced-brief.md` → `{sessionDir}/enhanced-brief.md`

Step 6: Replace `".rjsf/enhanced-brief.md"` (artifactPath) → `"enhanced-brief.md"`
Replace `Update .rjsf/session.json` → `Update {sessionDir}/session.json`
Replace `Also update .rjsf/requirements-brief.md` → `Also update {sessionDir}/requirements-brief.md`

- [ ] **Step 4: Update `rjsf-plan` — Step 1 and Step 7d**

Step 1 (line 21): Replace `Read `.rjsf/session.json` using the format described in `references/session-pattern.md`.` with `Resolve the active session path (see `references/session-pattern.md` Section 0). Let `sessionDir` = `.rjsf/sessions/{formName}/`. Read `{sessionDir}/session.json`.`

Replace all `.rjsf/requirements-brief.md` → `{sessionDir}/requirements-brief.md`
Replace all `.rjsf/enhanced-brief.md` → `{sessionDir}/enhanced-brief.md`

Step 7d: Replace `.rjsf/form-plan.md` → `{sessionDir}/form-plan.md`
Replace `".rjsf/form-plan.md"` (artifactPath) → `"form-plan.md"`
Replace `Update session.json` → `Update {sessionDir}/session.json`

- [ ] **Step 5: Update `rjsf-technical` — Step 1 and Step 6**

Step 1 (line 18): Replace `Read `.rjsf/session.json`.` with `Resolve the active session path (see `references/session-pattern.md` Section 0). Let `sessionDir` = `.rjsf/sessions/{formName}/`. Read `{sessionDir}/session.json`.`

Replace `.rjsf/form-plan.md` → `{sessionDir}/form-plan.md`
Replace `.rjsf/requirements-brief.md` → `{sessionDir}/requirements-brief.md`
Replace `.rjsf/enhanced-brief.md` → `{sessionDir}/enhanced-brief.md`

Step 6: Replace `.rjsf/technical-choices.md` → `{sessionDir}/technical-choices.md`
Replace `".rjsf/technical-choices.md"` (artifactPath) → `"technical-choices.md"`
Replace `Update `session.json`` → `Update {sessionDir}/session.json`

- [ ] **Step 6: Update `rjsf-prototype` — Step 1 and Step 3**

Step 1 (line 15): Replace `Read `.rjsf/session.json`.` with `Resolve the active session path (see `references/session-pattern.md` Section 0). Let `sessionDir` = `.rjsf/sessions/{formName}/`. Read `{sessionDir}/session.json`.`

Replace `.rjsf/form-plan.md` → `{sessionDir}/form-plan.md`
Replace `.rjsf/requirements-brief.md` → `{sessionDir}/requirements-brief.md`
Replace `.rjsf/enhanced-brief.md` → `{sessionDir}/enhanced-brief.md`
Replace `.rjsf/technical-choices.md` → `{sessionDir}/technical-choices.md`
Replace `prototype/prototype.html` → `{sessionDir}/prototype.html` (everywhere)
Replace `prototype/` directory reference → `{sessionDir}/`

Step 3: Replace `Write the fully rendered HTML to `prototype/prototype.html` (create directory if needed).` with `Write the fully rendered HTML to `{sessionDir}/prototype.html`.`
Replace `"prototype/prototype.html"` (artifactPath) → `"prototype.html"`
Replace `Update .rjsf/session.json` → `Update {sessionDir}/session.json`
Replace `Written: `prototype/prototype.html`` → `Written: `{sessionDir}/prototype.html``

- [ ] **Step 7: Update `rjsf-execute` — Step 1 and Step 7**

Step 1 (line 15): Replace `Read `.rjsf/session.json`.` with `Resolve the active session path (see `references/session-pattern.md` Section 0). Let `sessionDir` = `.rjsf/sessions/{formName}/`. Read `{sessionDir}/session.json`.`

Replace `.rjsf/form-plan.md` → `{sessionDir}/form-plan.md`
Replace `.rjsf/requirements-brief.md` → `{sessionDir}/requirements-brief.md`
Replace `.rjsf/enhanced-brief.md` → `{sessionDir}/enhanced-brief.md`
Replace `.rjsf/technical-choices.md` → `{sessionDir}/technical-choices.md`
Replace `prototype/prototype.html` → `{sessionDir}/prototype.html`

Step 7: Replace `Update session.json:` → `Update {sessionDir}/session.json:`

- [ ] **Step 8: Update `rjsf-test` — Step 1 and Step 3**

Step 1 (line 15): Replace `Read `.rjsf/session.json`.` with `Resolve the active session path (see `references/session-pattern.md` Section 0). Let `sessionDir` = `.rjsf/sessions/{formName}/`. Read `{sessionDir}/session.json`.`

Replace `.rjsf/form-plan.md` → `{sessionDir}/form-plan.md`
Replace `.rjsf/requirements-brief.md` → `{sessionDir}/requirements-brief.md`

Step 3: Replace `Update .rjsf/session.json:` → `Update {sessionDir}/session.json:`

- [ ] **Step 9: Update `rjsf-iterate` — Step 1 and Step 4**

Step 1 (line 16): Replace `Read `.rjsf/session.json`.` with `Resolve the active session path (see `references/session-pattern.md` Section 0). Let `sessionDir` = `.rjsf/sessions/{formName}/`. Read `{sessionDir}/session.json`.`

Replace `.rjsf/form-plan.md` → `{sessionDir}/form-plan.md`

Step 4: Replace `Append a changelog entry to .rjsf/form-plan.md` → `Append a changelog entry to {sessionDir}/form-plan.md`
Replace `Update .rjsf/session.json` → `Update {sessionDir}/session.json`

- [ ] **Step 10: Commit**

```bash
git add skills/rjsf-requirements/SKILL.md skills/rjsf-suggest/SKILL.md skills/rjsf-plan/SKILL.md skills/rjsf-technical/SKILL.md skills/rjsf-prototype/SKILL.md skills/rjsf-execute/SKILL.md skills/rjsf-test/SKILL.md skills/rjsf-iterate/SKILL.md
git commit -m "feat: update all phase skills for multi-session path resolution

All phase skills now resolve session path via .rjsf/active-session pointer
instead of hardcoded .rjsf/session.json. Artifact paths are session-relative.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Update `rjsf-help` and Documentation

**Files:**
- Modify: `skills/rjsf-help/SKILL.md`
- Modify: `README.md`
- Modify: `docs/commands.md`
- Modify: `docs/getting-started.md`
- Modify: `docs/output-guide.md`

- [ ] **Step 1: Update `rjsf-help` command list**

After the `/rjsf-iterate` line in the command list (around line 29), add:

```markdown
  /rjsf-new <name>   Create a new named form session
  /rjsf-switch [name] Switch to a different session
  /rjsf-list         List all sessions with status
  /rjsf-delete <name> Archive and remove a session
```

- [ ] **Step 2: Update `README.md` commands table**

Add after the `/rjsf-iterate "change"` row:

```markdown
| `/rjsf-new <name>` | Create a new named form session |
| `/rjsf-switch [name]` | Switch active session |
| `/rjsf-list` | List all sessions |
| `/rjsf-delete <name>` | Archive and remove a session |
```

- [ ] **Step 3: Update `docs/getting-started.md` session storage section**

Replace the "Where session data is stored" section (around lines 110-122):

**Old:**
```markdown
## Where session data is stored

The agent creates a `.rjsf/` directory in your project:

```
.rjsf/
├── session.json          Tracks current phase and status
├── requirements-brief.md  Output of Phase 1
├── form-plan.md           Output of Phase 2
└── history/               Archived sessions (when starting fresh)
```

Commit `.rjsf/requirements-brief.md` and `.rjsf/form-plan.md` to version control so your team can see the design decisions. The `session.json` file can also be committed for full traceability, or added to `.gitignore` if you prefer to keep it local.
```

**New:**
```markdown
## Where session data is stored

The agent creates a `.rjsf/` directory in your project. Each form gets its own session directory:

```
.rjsf/
├── active-session                         Points to the active form name
├── sessions/
│   ├── ContactForm/
│   │   ├── session.json                   Tracks phase and status for this form
│   │   ├── requirements-brief.md          Phase 1 output
│   │   ├── form-plan.md                   Phase 2 output
│   │   └── prototype.html                 Phase 3 prototype
│   └── LoanApplication/
│       ├── session.json
│       └── requirements-brief.md
└── history/                               Archived sessions
```

You can work on multiple forms simultaneously — use `/rjsf-new`, `/rjsf-switch`, and `/rjsf-list` to manage sessions.

Commit the session directories to version control so your team can see the design decisions. Add `.rjsf/history/` to `.gitignore` if you want to exclude archived sessions.

## Working on multiple forms

```bash
# Create and build a contact form
/rjsf-new ContactForm
/rjsf-build "contact form with name, email, message"

# Start a second form without losing progress on the first
/rjsf-new LoanApplication
/rjsf-build "loan application with applicant info"

# Switch back to the first form
/rjsf-switch ContactForm
/rjsf-status  # see where you left off

# See all forms at once
/rjsf-list
```
```

- [ ] **Step 4: Update `docs/output-guide.md` session section**

Replace `.rjsf/session.json` heading and content (around lines 229-256):

**Old heading:** `## \`.rjsf/session.json\``

**New heading:** `## \`.rjsf/sessions/{FormName}/session.json\``

Add after the heading: "**Multi-session support:** The agent supports multiple concurrent form sessions. The active session is tracked by `.rjsf/active-session` (a plain text file containing the form name). Use `/rjsf-list` to see all sessions and `/rjsf-switch` to change the active one."

Update the directory structure shown to match the new layout:

**Old:**
```
.rjsf/
├── session.json               Session state
├── requirements-brief.md      Phase 1 output
└── form-plan.md               Phase 2 output
```

**New:**
```
.rjsf/
├── active-session                        Active session pointer
├── sessions/
│   └── ContactForm/
│       ├── session.json                  Session state
│       ├── requirements-brief.md         Phase 1 output
│       └── form-plan.md                  Phase 2 output
└── history/                              Archived sessions
```

- [ ] **Step 5: Add new commands to `docs/commands.md`**

Add four new command sections after the `/rjsf-iterate` section. Each needs: Description, When to use, Syntax, Produces, Example, Common follow-up — matching the existing format in that file. Commands: `/rjsf-new`, `/rjsf-switch`, `/rjsf-list`, `/rjsf-delete`.

- [ ] **Step 6: Commit**

```bash
git add skills/rjsf-help/SKILL.md README.md docs/commands.md docs/getting-started.md docs/output-guide.md
git commit -m "docs: update all documentation for multi-session support

Add new session management commands to help, README, commands reference,
getting-started guide, and output guide. Update directory structure diagrams.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Smoke Test — Verify No Hardcoded Paths Remain

- [ ] **Step 1: Search for remaining `.rjsf/session.json` references**

```bash
grep -r "\.rjsf/session\.json" --include="*.md" skills/ references/
```

Expected: Zero results. All should now use `{sessionDir}/session.json` or the path resolution algorithm.

- [ ] **Step 2: Search for remaining `.rjsf/requirements-brief.md` references**

```bash
grep -r "\.rjsf/requirements-brief" --include="*.md" skills/ references/
```

Expected: Zero results in skill/reference files. May appear in docs as examples with the new `{sessionDir}/` prefix.

- [ ] **Step 3: Search for remaining `prototype/prototype.html` references**

```bash
grep -r "prototype/prototype\.html" --include="*.md" skills/ references/
```

Expected: Zero results. All should now use `{sessionDir}/prototype.html`.

- [ ] **Step 4: Verify new skill files exist and have valid frontmatter**

```bash
head -5 skills/rjsf-new/SKILL.md skills/rjsf-switch/SKILL.md skills/rjsf-list/SKILL.md skills/rjsf-delete/SKILL.md
```

Expected: Each shows `---` frontmatter with `name:` field.

- [ ] **Step 5: Fix any remaining issues and commit**

If any hardcoded paths remain, fix them. Then:

```bash
git add -A
git commit -m "fix: resolve remaining hardcoded session paths

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 6: Push all commits**

```bash
git push
```
