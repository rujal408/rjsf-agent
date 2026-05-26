# RJSF Status — Session Progress

**Trigger:** `/rjsf-status`

---

## Step 1 — Read Session

Read `.rjsf/session.json`.

If no session file exists:
> "No active session found. Run `/rjsf-build` to start building a form."
Stop here.

---

## Step 2 — Display Progress

Format and display the following status block. Use the status icons: ✅ = completed · ⏳ = in_progress or awaiting_client_approval · ⬜ = pending.

```
Active session: <FormName>
Theme: <rjsfTheme> | Styling: <stylingApproach | "not set yet">
Output: <outputPath | "not set yet">

  <icon> Phase 1 — Requirements     (<status> <completedAt or "">)
  <icon> Phase 2 — Planning          (<status> <completedAt or "">)
  <icon> Phase 3 — Prototype         (<status> <completedAt or "awaiting client approval" if status is awaiting_client_approval>)
  <icon> Phase 4 — Execution         (<status> <completedAt or "">)
  <icon> Phase 5 — Testing           (<status> <completedAt or "">)
```

When formatting timestamps, show them as relative time if within the last 7 days (e.g. "2 hours ago", "yesterday"), otherwise show the ISO date only (e.g. "2026-05-10").

---

## Step 3 — Suggest Next Action

Always end with exactly one actionable suggestion:

- All 5 phases completed → "All done! Run `/rjsf-iterate \"describe change\"` to make changes."
- Phase 3 is `awaiting_client_approval` → "Share `prototype/prototype.html` with your client, then run `/rjsf-build` once they confirm."
- Phase 3 completed, Phase 4 pending → "Run `/rjsf-build` to generate the React code (Phase 4)."
- Any other incomplete phase → "Run `/rjsf-build` to continue from Phase <currentPhase>."
