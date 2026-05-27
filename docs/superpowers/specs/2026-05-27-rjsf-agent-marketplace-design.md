# Design: rjsf-agent Self-Hosted Marketplace

**Date:** 2026-05-27
**Author:** Rujal
**Status:** Approved

---

## Goal

Any user should be able to install the rjsf-agent plugin using two commands:

```bash
/plugin marketplace add rujal408/rjsf-agent
/plugin install rjsf-agent@rjsf-agent
```

---

## Problem

The previously documented install command `claude plugin install github:rujal408/rjsf-agent` does not work. Claude Code's plugin system requires a marketplace catalog to resolve plugin names. The `github:owner/repo` prefix syntax is not supported — it searches registered marketplaces, not raw GitHub repos.

The repo has a correct `.claude-plugin/plugin.json` and 10 well-structured skills with YAML frontmatter, but is missing `.claude-plugin/marketplace.json`, which is what Claude Code reads to discover plugins from a registered marketplace source.

---

## Approach: Option A — Same-Repo Marketplace

Add `.claude-plugin/marketplace.json` to the existing repo. The repo acts as both the plugin source and its own marketplace catalog. No new repositories required.

---

## File Changes

### 1. Create `.claude-plugin/marketplace.json`

```json
{
  "name": "rjsf-agent",
  "owner": { "name": "rujal408" },
  "description": "AI agent for production-ready RJSF form implementations",
  "plugins": [
    {
      "name": "rjsf-agent",
      "source": "./",
      "description": "Converts client requirements into production-ready RJSF form implementations — schema, uiSchema, widgets, fields, templates, prototype, and tests.",
      "version": "1.0.0"
    }
  ]
}
```

### 2. Update README install instructions

Replace the broken single-command install with the correct two-step sequence:

**Before:**
```bash
claude plugin install github:rujal408/rjsf-agent
```

**After:**
```bash
# Step 1: Register the marketplace (once per machine)
/plugin marketplace add rujal408/rjsf-agent

# Step 2: Install the plugin
/plugin install rjsf-agent@rjsf-agent
```

Add a note that official community marketplace submission is planned, which will eventually reduce this to a single command.

---

## User Install Experience

```bash
# Register once
/plugin marketplace add rujal408/rjsf-agent

# Install
/plugin install rjsf-agent@rjsf-agent

# Use immediately
/rjsf-form
/rjsf-build "loan application form"
/rjsf-status
/rjsf-help
```

---

## Out of Scope

- No changes to `plugin.json`, skills, or any reference/docs files
- No separate marketplace repo
- Official community marketplace submission is a future manual step (no code needed for it)

---

## Future: Official Community Marketplace

Once submitted to and accepted by Anthropic's community marketplace, the install experience simplifies to a single command. This requires submitting the plugin at `claude.ai/settings/plugins/submit` — no repo changes needed at that point.
