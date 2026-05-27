---
name: rjsf-build
description: Run the full RJSF form pipeline (Phases 1 → 1.5 → 2 → 2.5 → 3 → 4 → 5) from requirements to tests, or resume an existing session
argument-hint: ["requirements text"] [--from file]
allowed-tools: [Read, Write, Edit, Glob, Bash]
---

# RJSF Build — Orchestrator

**Trigger:** `/rjsf-build "natural language requirements"` — or `/rjsf-build --from <file>` — or `/rjsf-build` alone to resume.

Runs all 7 phases in sequence (including Phase 1.5 — feature suggestions and Phase 2.5 — technical decisions), waiting for developer approval between phases. Can resume an interrupted session.

---

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

---

## Step 2 — Detect Client Approval Signal

If `phases["3"].status` is `"awaiting_client_approval"` AND the developer's message contains any of these phrases (case-insensitive): "client approved", "approved", "yes", "proceed", "continue", "looks good", "go ahead":
- Set `phases["3"].status = "completed"`, `phases["3"].completedAt = <ISO timestamp>`.
- Set `currentPhase = 4`.
- Write full session.json (not a partial merge).
- Proceed to Phase 4.

---

## Step 3 — Phase Routing

Run each phase in order. After each phase, check `session.json` to confirm the phase is `"completed"` before proceeding.

```
Phase 1   → invoke rjsf-requirements skill
            (pass inline requirements text or --from file path if provided)
            WAIT — developer approves RequirementsBrief

Phase 1.5 → invoke rjsf-suggest skill
            Analyzes the brief and suggests UI/UX enhancements as A/B/C options.
            Developer picks options (or "all defaults" / "skip").
            WAIT — developer approves enhancement choices

Phase 2   → invoke rjsf-plan skill
            WAIT — developer approves FormPlan

Phase 2.5 → invoke rjsf-technical skill
            Presents technical decisions (schema version, validator, submission
            pattern, styling, code structure) as grouped A/B/C options.
            Developer picks options (or "all defaults" / "skip").
            WAIT — developer approves technical choices

Phase 3   → invoke rjsf-prototype skill
            Tell developer: "Share prototype/prototype.html with your client.
            Come back and say 'client approved' when they confirm."
            PAUSE — wait for client approval signal (Step 2 above)

Phase 4   → invoke rjsf-execute skill
            WAIT — developer confirms output path and file write

Phase 5   → invoke rjsf-test skill
            Done — all phases complete
```

If the developer says "stop here" at any point, respond:
> "Paused at Phase <N> — <phase name>. Run `/rjsf-build` when you're ready to continue."

---

## Step 4 — Completion Summary

After Phase 5 completes, output:

> "**<FormName> is complete.** All phases done.
>
> - **Make changes:** `/rjsf-iterate \"describe change\"`
> - **Build another form:** `/rjsf-build \"describe new form\"`
> - **Run tests:** `npx vitest <outputPath>` or `npx jest <outputPath>`
> - **Check session:** `/rjsf-status`"
