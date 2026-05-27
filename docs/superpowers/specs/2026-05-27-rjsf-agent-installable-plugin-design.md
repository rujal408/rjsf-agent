# Design: Make rjsf-agent Installable from Claude Terminal

**Date:** 2026-05-27
**Author:** Rujal
**Status:** Approved

---

## Goal

Any user should be able to run:

```bash
claude plugin install github:rujal408/rjsf-agent
```

and immediately use `/rjsf-form`, `/rjsf-build`, `/rjsf-status`, and all other commands.

---

## Problem

The repository has three structural issues that prevent installation:

1. `plugin.json` is at the repo root — Claude Code's plugin system requires it at `.claude-plugin/plugin.json`.
2. All 10 `SKILL.md` files lack YAML frontmatter — without it, Claude cannot discover or invoke skills as slash commands.
3. The README install command uses a placeholder (`github:your-org/rjsf-agent`) instead of the real repo (`github:rujal408/rjsf-agent`).
4. The smart entry-point skill is named `rjsf` — it will be renamed to `rjsf-form` as requested.

---

## Approach: Option A — Minimal Fix

No new features, no new infrastructure. Exactly what's broken gets fixed.

---

## File Changes

### 1. Create `.claude-plugin/plugin.json`

New file at `.claude-plugin/plugin.json` (root `plugin.json` deleted):

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

### 2. Rename `skills/rjsf/` → `skills/rjsf-form/`

Directory rename only. The `SKILL.md` content is updated to reflect the new command name.

### 3. Add YAML frontmatter to all 10 skills

Each skill gets a frontmatter block with `name`, `description`, `argument-hint` (where applicable), and `allowed-tools`. Frontmatter is prepended to the existing content — nothing else changes.

| Skill directory | name | argument-hint |
|---|---|---|
| `rjsf-form` | `rjsf-form` | `[requirements or --from file]` |
| `rjsf-build` | `rjsf-build` | `["requirements"] [--from file]` |
| `rjsf-help` | `rjsf-help` | `[command or concept]` |
| `rjsf-status` | `rjsf-status` | *(none)* |
| `rjsf-requirements` | `rjsf-requirements` | `["requirements"] [--from file]` |
| `rjsf-plan` | `rjsf-plan` | *(none)* |
| `rjsf-prototype` | `rjsf-prototype` | *(none)* |
| `rjsf-execute` | `rjsf-execute` | *(none)* |
| `rjsf-test` | `rjsf-test` | *(none)* |
| `rjsf-iterate` | `rjsf-iterate` | `"description of change"` |

All skills get `allowed-tools: [Read, Write, Edit, Glob, Bash]` since the agent pipeline reads and writes session state and form files.

### 4. Update internal references

- `rjsf-form/SKILL.md`: trigger line `/rjsf` → `/rjsf-form`
- `rjsf-help/SKILL.md`: command list entry `/rjsf` → `/rjsf-form`, help table entry updated

### 5. Update README

Install command: `github:your-org/rjsf-agent` → `github:rujal408/rjsf-agent`
Also update Quick Start section to use `/rjsf-form` instead of `/rjsf`.

### 6. Delete root `plugin.json`

Replaced by `.claude-plugin/plugin.json`.

---

## Out of Scope

- No CLAUDE.md injection
- No hooks.json
- No marketplace submission
- No other content changes to skills

---

## Post-Install User Experience

```bash
# Install once
claude plugin install github:rujal408/rjsf-agent

# Use immediately
/rjsf-form                           # smart entry point
/rjsf-build "loan application form"  # full pipeline
/rjsf-status                         # check progress
/rjsf-help                           # list all commands
```
