# rjsf-agent Installable Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the rjsf-agent repo so any user can install it with `claude plugin install github:rujal408/rjsf-agent` and immediately use all slash commands.

**Architecture:** Three changes are needed: (1) move the plugin manifest to `.claude-plugin/plugin.json`, (2) add YAML frontmatter to each skill so Claude discovers them as slash commands, and (3) rename the `rjsf` entry-point skill to `rjsf-form` and update internal references.

**Tech Stack:** Claude Code plugin system, YAML frontmatter, JSON manifest, Markdown

---

## File Map

| Action | Path |
|---|---|
| Create | `.claude-plugin/plugin.json` |
| Delete | `plugin.json` (root) |
| Rename dir | `skills/rjsf/` → `skills/rjsf-form/` |
| Modify | `skills/rjsf-form/SKILL.md` — add frontmatter + update trigger line |
| Modify | `skills/rjsf-help/SKILL.md` — add frontmatter + update command list |
| Modify | `skills/rjsf-build/SKILL.md` — add frontmatter |
| Modify | `skills/rjsf-status/SKILL.md` — add frontmatter |
| Modify | `skills/rjsf-requirements/SKILL.md` — add frontmatter |
| Modify | `skills/rjsf-plan/SKILL.md` — add frontmatter |
| Modify | `skills/rjsf-prototype/SKILL.md` — add frontmatter |
| Modify | `skills/rjsf-execute/SKILL.md` — add frontmatter |
| Modify | `skills/rjsf-test/SKILL.md` — add frontmatter |
| Modify | `skills/rjsf-iterate/SKILL.md` — add frontmatter |
| Modify | `README.md` — fix install command + rename /rjsf → /rjsf-form |

---

### Task 1: Create `.claude-plugin/plugin.json` and delete root `plugin.json`

**Files:**
- Create: `.claude-plugin/plugin.json`
- Delete: `plugin.json`

- [ ] **Step 1: Create `.claude-plugin/plugin.json`**

Create the directory and write the manifest:

```json
{
  "name": "rjsf-agent",
  "version": "1.0.0",
  "description": "AI agent that converts client requirements into production-ready RJSF form implementations — schema, uiSchema, widgets, fields, templates, prototype, and tests.",
  "author": {
    "name": "rujal408"
  },
  "repository": "https://github.com/rujal408/rjsf-agent",
  "license": "MIT",
  "keywords": ["rjsf", "forms", "react", "json-schema"]
}
```

- [ ] **Step 2: Delete root `plugin.json`**

```bash
rm /home/rujal/Projects-Amnil/agents/rjsf-agent/plugin.json
```

- [ ] **Step 3: Verify**

```bash
ls /home/rujal/Projects-Amnil/agents/rjsf-agent/.claude-plugin/
```
Expected output: `plugin.json`

```bash
ls /home/rujal/Projects-Amnil/agents/rjsf-agent/plugin.json 2>/dev/null || echo "deleted"
```
Expected output: `deleted`

- [ ] **Step 4: Commit**

```bash
cd /home/rujal/Projects-Amnil/agents/rjsf-agent
git add .claude-plugin/plugin.json
git rm plugin.json
git commit -m "chore: move plugin manifest to .claude-plugin/plugin.json"
```

---

### Task 2: Rename `skills/rjsf/` → `skills/rjsf-form/`

**Files:**
- Rename dir: `skills/rjsf/` → `skills/rjsf-form/`

- [ ] **Step 1: Rename the directory**

```bash
mv /home/rujal/Projects-Amnil/agents/rjsf-agent/skills/rjsf /home/rujal/Projects-Amnil/agents/rjsf-agent/skills/rjsf-form
```

- [ ] **Step 2: Verify**

```bash
ls /home/rujal/Projects-Amnil/agents/rjsf-agent/skills/
```
Expected: `rjsf-form` in the list, no `rjsf` entry.

Do NOT stage or commit yet — Task 3 edits the content and commits the rename + content change together.

---

### Task 3: Add frontmatter to `rjsf-form/SKILL.md` and update trigger line

**Files:**
- Modify: `skills/rjsf-form/SKILL.md`

The file currently starts with `# RJSF — Smart Entry Point`. Prepend a YAML frontmatter block AND update the trigger line inside the content.

- [ ] **Step 1: Prepend frontmatter**

The final file must start with:

```markdown
---
name: rjsf-form
description: Smart entry point — detects session context and routes to the right rjsf-agent command. Use when unsure which command to run, or to start a new form.
argument-hint: [requirements or --from file]
allowed-tools: [Read, Glob]
---

# RJSF — Smart Entry Point
```

- [ ] **Step 2: Update the trigger line inside the content**

Change line 3 (after frontmatter):

From:
```
**Trigger:** `/rjsf` with any input — or natural language like "I want to build a form", "continue", "where was I?", "help".
```

To:
```
**Trigger:** `/rjsf-form` with any input — or natural language like "I want to build a form", "continue", "where was I?", "help".
```

- [ ] **Step 3: Verify the file starts correctly**

```bash
head -10 /home/rujal/Projects-Amnil/agents/rjsf-agent/skills/rjsf-form/SKILL.md
```
Expected first line: `---`
Expected `name:` line: `name: rjsf-form`

- [ ] **Step 4: Commit (rename + content change together)**

```bash
cd /home/rujal/Projects-Amnil/agents/rjsf-agent
git add skills/rjsf-form/SKILL.md
git rm -r skills/rjsf/
git commit -m "feat: rename rjsf skill to rjsf-form and add frontmatter"
```

---

### Task 4: Add frontmatter to `rjsf-help/SKILL.md` and update command list

**Files:**
- Modify: `skills/rjsf-help/SKILL.md`

- [ ] **Step 1: Prepend frontmatter**

The final file must start with:

```markdown
---
name: rjsf-help
description: Explain any rjsf-agent command or RJSF concept in plain English
argument-hint: [command-name or "concept question"]
allowed-tools: [Read]
---

# RJSF Help — Contextual Help
```

- [ ] **Step 2: Update the command list display block**

Find the code block that lists commands. Change the `/rjsf` entry:

From:
```
  /rjsf              Smart entry point — detects context and guides you
```

To:
```
  /rjsf-form         Smart entry point — detects context and guides you
```

- [ ] **Step 3: Update the Command Help table row**

Find the table row for the smart router. Change:

From:
```
| `/rjsf` or `rjsf` | Smart router — reads your session and figures out what you need next. Use it when you're not sure which command to run. |
```

To:
```
| `/rjsf-form` or `rjsf-form` | Smart router — reads your session and figures out what you need next. Use it when you're not sure which command to run. |
```

- [ ] **Step 4: Verify**

```bash
head -8 /home/rujal/Projects-Amnil/agents/rjsf-agent/skills/rjsf-help/SKILL.md
```
Expected first line: `---`
Expected `name:` line: `name: rjsf-help`

```bash
grep "rjsf-form" /home/rujal/Projects-Amnil/agents/rjsf-agent/skills/rjsf-help/SKILL.md
```
Expected: 2 matches (command list + table row).

- [ ] **Step 5: Commit**

```bash
cd /home/rujal/Projects-Amnil/agents/rjsf-agent
git add skills/rjsf-help/SKILL.md
git commit -m "feat: add frontmatter to rjsf-help and update /rjsf → /rjsf-form references"
```

---

### Task 5: Add frontmatter to the remaining 8 skills

**Files:**
- Modify: `skills/rjsf-build/SKILL.md`
- Modify: `skills/rjsf-status/SKILL.md`
- Modify: `skills/rjsf-requirements/SKILL.md`
- Modify: `skills/rjsf-plan/SKILL.md`
- Modify: `skills/rjsf-prototype/SKILL.md`
- Modify: `skills/rjsf-execute/SKILL.md`
- Modify: `skills/rjsf-test/SKILL.md`
- Modify: `skills/rjsf-iterate/SKILL.md`

Each file gets a frontmatter block prepended. Existing content is unchanged.

- [ ] **Step 1: Add frontmatter to `rjsf-build/SKILL.md`**

Prepend:
```markdown
---
name: rjsf-build
description: Run the full 5-phase RJSF form pipeline from requirements to tests, or resume an existing session
argument-hint: ["requirements text"] [--from file]
allowed-tools: [Read, Write, Edit, Glob, Bash]
---

```

- [ ] **Step 2: Add frontmatter to `rjsf-status/SKILL.md`**

Prepend:
```markdown
---
name: rjsf-status
description: Show current RJSF session phase progress at a glance
allowed-tools: [Read, Glob]
---

```

- [ ] **Step 3: Add frontmatter to `rjsf-requirements/SKILL.md`**

Prepend:
```markdown
---
name: rjsf-requirements
description: Phase 1 — gather and clarify client form requirements, produce a structured RequirementsBrief
argument-hint: ["requirements text"] [--from file]
allowed-tools: [Read, Write, Glob, Bash]
---

```

- [ ] **Step 4: Add frontmatter to `rjsf-plan/SKILL.md`**

Prepend:
```markdown
---
name: rjsf-plan
description: Phase 2 — design form layout, widget choices, column structure, and identify custom components needed
allowed-tools: [Read, Write, Glob]
---

```

- [ ] **Step 5: Add frontmatter to `rjsf-prototype/SKILL.md`**

Prepend:
```markdown
---
name: rjsf-prototype
description: Phase 3 — generate a self-contained HTML prototype for client sign-off before any React code is written
allowed-tools: [Read, Write, Glob, Bash]
---

```

- [ ] **Step 6: Add frontmatter to `rjsf-execute/SKILL.md`**

Prepend:
```markdown
---
name: rjsf-execute
description: Phase 4 — generate all React/RJSF code: schema.ts, uiSchema.ts, types.ts, index.tsx, and custom components
allowed-tools: [Read, Write, Edit, Glob, Bash]
---

```

- [ ] **Step 7: Add frontmatter to `rjsf-test/SKILL.md`**

Prepend:
```markdown
---
name: rjsf-test
description: Phase 5 — generate tests covering required fields, conditionals, submission, server errors, and accessibility
allowed-tools: [Read, Write, Glob]
---

```

- [ ] **Step 8: Add frontmatter to `rjsf-iterate/SKILL.md`**

Prepend:
```markdown
---
name: rjsf-iterate
description: Modify an already-generated form without rerunning the full pipeline — shows a diff before writing
argument-hint: "description of change"
allowed-tools: [Read, Write, Edit, Glob, Bash]
---

```

- [ ] **Step 9: Verify all 8 files have frontmatter**

```bash
for f in rjsf-build rjsf-status rjsf-requirements rjsf-plan rjsf-prototype rjsf-execute rjsf-test rjsf-iterate; do
  echo -n "$f: "; head -1 /home/rujal/Projects-Amnil/agents/rjsf-agent/skills/$f/SKILL.md
done
```
Expected: each line shows `$skillname: ---`

- [ ] **Step 10: Commit**

```bash
cd /home/rujal/Projects-Amnil/agents/rjsf-agent
git add skills/rjsf-build/SKILL.md skills/rjsf-status/SKILL.md skills/rjsf-requirements/SKILL.md \
        skills/rjsf-plan/SKILL.md skills/rjsf-prototype/SKILL.md skills/rjsf-execute/SKILL.md \
        skills/rjsf-test/SKILL.md skills/rjsf-iterate/SKILL.md
git commit -m "feat: add YAML frontmatter to all remaining skills"
```

---

### Task 6: Update README

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Fix the install command**

Change:
```bash
claude plugin install github:your-org/rjsf-agent
```

To:
```bash
claude plugin install github:rujal408/rjsf-agent
```

- [ ] **Step 2: Update Quick Start — first command**

Change:
```bash
# Not sure where to start?
/rjsf
```

To:
```bash
# Not sure where to start?
/rjsf-form
```

- [ ] **Step 3: Update the commands table**

Change the `/rjsf` row:

From:
```
| `/rjsf` | Smart entry — let the agent guide you |
```

To:
```
| `/rjsf-form` | Smart entry — let the agent guide you |
```

- [ ] **Step 4: Verify**

```bash
grep "rujal408" /home/rujal/Projects-Amnil/agents/rjsf-agent/README.md
```
Expected: `claude plugin install github:rujal408/rjsf-agent`

```bash
grep "/rjsf-form" /home/rujal/Projects-Amnil/agents/rjsf-agent/README.md | wc -l
```
Expected: 3 (install section + quick start + commands table)

```bash
grep -n '`/rjsf`' /home/rujal/Projects-Amnil/agents/rjsf-agent/README.md
```
Expected: no output (all replaced).

- [ ] **Step 5: Commit**

```bash
cd /home/rujal/Projects-Amnil/agents/rjsf-agent
git add README.md
git commit -m "docs: fix install command and rename /rjsf to /rjsf-form in README"
```

---

### Task 7: Smoke-test plugin locally and push

- [ ] **Step 1: Verify plugin structure is correct**

```bash
ls /home/rujal/Projects-Amnil/agents/rjsf-agent/.claude-plugin/
```
Expected: `plugin.json`

```bash
ls /home/rujal/Projects-Amnil/agents/rjsf-agent/skills/
```
Expected: 10 directories including `rjsf-form` (not `rjsf`).

```bash
for skill in rjsf-form rjsf-help rjsf-build rjsf-status rjsf-requirements rjsf-plan rjsf-prototype rjsf-execute rjsf-test rjsf-iterate; do
  echo -n "$skill: "; head -1 /home/rujal/Projects-Amnil/agents/rjsf-agent/skills/$skill/SKILL.md
done
```
Expected: all 10 lines show `---` (frontmatter present).

- [ ] **Step 2: Test local plugin load**

```bash
claude --plugin-dir /home/rujal/Projects-Amnil/agents/rjsf-agent --print "/rjsf-help" 2>&1 | head -20
```
Expected: Claude responds with the rjsf-agent command list (not an error about unknown command).

- [ ] **Step 3: Push to GitHub**

```bash
cd /home/rujal/Projects-Amnil/agents/rjsf-agent
git push origin master
```

- [ ] **Step 4: Verify remote install works**

In a separate terminal or after the push:

```bash
claude plugin install github:rujal408/rjsf-agent
```
Expected: installs without error.

```bash
claude --print "/rjsf-help" 2>&1 | head -10
```
Expected: rjsf-agent command list displayed.
