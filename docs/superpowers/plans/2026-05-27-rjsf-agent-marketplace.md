# rjsf-agent Marketplace Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add `.claude-plugin/marketplace.json` and update README so users can install the plugin with two commands.

**Architecture:** The repo acts as its own marketplace catalog. Claude Code reads `marketplace.json` when a user registers the repo as a marketplace source, then resolves `rjsf-agent` to `plugin.json` in the same repo.

**Tech Stack:** Claude Code plugin system, JSON, Markdown

---

## File Map

| Action | Path |
|---|---|
| Create | `.claude-plugin/marketplace.json` |
| Modify | `README.md` — replace install block, add update note |

---

### Task 1: Create `.claude-plugin/marketplace.json`

**Files:**
- Create: `.claude-plugin/marketplace.json`

- [ ] **Step 1: Write the file**

Create `.claude-plugin/marketplace.json` with this exact content:

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

- [ ] **Step 2: Verify the file is valid JSON and in the right location**

```bash
cat /home/rujal/Projects-Amnil/agents/rjsf-agent/.claude-plugin/marketplace.json | python3 -m json.tool
```
Expected: JSON prints cleanly with no errors.

```bash
ls /home/rujal/Projects-Amnil/agents/rjsf-agent/.claude-plugin/
```
Expected: `marketplace.json  plugin.json`

- [ ] **Step 3: Commit**

```bash
cd /home/rujal/Projects-Amnil/agents/rjsf-agent
git add .claude-plugin/marketplace.json
git commit -m "feat: add marketplace.json to enable self-hosted plugin install"
```

---

### Task 2: Update README install instructions

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Replace the Install section**

The current Install section (lines 5–9) reads:

```markdown
## Install

```bash
claude plugin install github:rujal408/rjsf-agent
```
```

Replace it with:

```markdown
## Install

```bash
# Step 1: Register the marketplace (once per machine)
/plugin marketplace add rujal408/rjsf-agent

# Step 2: Install the plugin
/plugin install rjsf-agent@rjsf-agent
```

> **Coming soon:** Once listed in the official Claude community marketplace, installation will be a single command.
```

- [ ] **Step 2: Verify the old command is gone and new commands are present**

```bash
grep "github:rujal408/rjsf-agent" /home/rujal/Projects-Amnil/agents/rjsf-agent/README.md
```
Expected: no output (old command removed).

```bash
grep "marketplace add" /home/rujal/Projects-Amnil/agents/rjsf-agent/README.md
```
Expected: `/plugin marketplace add rujal408/rjsf-agent`

```bash
grep "plugin install" /home/rujal/Projects-Amnil/agents/rjsf-agent/README.md
```
Expected: `/plugin install rjsf-agent@rjsf-agent`

- [ ] **Step 3: Commit**

```bash
cd /home/rujal/Projects-Amnil/agents/rjsf-agent
git add README.md
git commit -m "docs: update install instructions to use marketplace commands"
```

---

### Task 3: Push and verify

- [ ] **Step 1: Push to GitHub**

```bash
cd /home/rujal/Projects-Amnil/agents/rjsf-agent
git push origin master
```
Expected: push succeeds, no errors.

- [ ] **Step 2: Verify `.claude-plugin/` directory on GitHub**

Open `https://github.com/rujal408/rjsf-agent/tree/master/.claude-plugin` in a browser and confirm both `plugin.json` and `marketplace.json` are present.

- [ ] **Step 3: Test the install flow**

In a Claude Code session:

```
/plugin marketplace add rujal408/rjsf-agent
```
Expected: marketplace registered without error.

```
/plugin install rjsf-agent@rjsf-agent
```
Expected: plugin installs successfully.

```
/rjsf-help
```
Expected: rjsf-agent command list is displayed.
