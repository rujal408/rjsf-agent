---
name: prompt
description: Use when the user wants to write, improve, or refine a prompt for an AI model — including vague instructions, unclear goals, missing context, or prompts that produce poor AI responses.
---

# Prompt Refiner

## Overview

Transform rough, vague, or incomplete prompts into clear, specific, and effective instructions that AI models can follow precisely. A well-structured prompt eliminates ambiguity, states intent explicitly, and gives the AI everything it needs to produce a useful response.

## When to Use

- User says "help me write a prompt", "refine this prompt", or `/prompt`
- User has a prompt that produces inconsistent or off-target AI responses
- User's instruction is vague (e.g., "make it better") without context
- User wants to communicate a complex task to an AI clearly

## Prompt Refinement Process

When the user provides a raw prompt to refine, follow these steps:

### Step 1 — Diagnose the Original Prompt

Identify what is weak or missing:

| Issue | Example | Fix |
|-------|---------|-----|
| Vague goal | "improve this code" | State exactly what to improve and why |
| Missing context | "fix the bug" | Describe what the bug is, where it appears |
| No output format | "summarize this" | Specify length, format, tone |
| Ambiguous scope | "make it better" | Define what "better" means in this context |
| Missing constraints | "write an email" | Tone, length, audience, purpose |
| No role/persona | general task | Add role when it helps (e.g., "As a senior engineer...") |

### Step 2 — Apply Prompt Anatomy

A strong AI prompt has these components (include only what's relevant):

```
[Role]        — Who the AI should be (optional, use when it sharpens output)
[Context]     — Background the AI needs to understand the task
[Task]        — Clear, specific action verb: "Write", "Analyze", "Rewrite", "List"
[Input]       — What the AI is working with (data, code, text)
[Constraints] — Rules, limits, format, tone, length
[Output]      — What a good response looks like
[Examples]    — Few-shot examples if the pattern is non-obvious (optional)
```

### Step 3 — Rewrite the Prompt

Produce a refined version. Follow these rules:

- **Lead with the action verb** — start with "Write", "Analyze", "Generate", "Fix", not "I want you to..."
- **Be specific about scope** — not "improve the function" but "refactor `fetchUser()` to handle null responses without throwing"
- **State the output format explicitly** — JSON, bullet list, prose, code block, etc.
- **Include constraints** — word count, language, tone, what NOT to do
- **Give context the AI lacks** — assume the AI has no memory of prior conversations

### Step 4 — Present Output

Show:
1. **Refined Prompt** — ready to copy and use
2. **What Changed** — 2–4 bullet points explaining the key improvements

## Quick Reference

```
❌ Weak:  "Make this better"
✅ Strong: "Rewrite this paragraph for a technical audience. Keep it under 100 words. 
           Use active voice. Focus on the tradeoff between speed and accuracy."

❌ Weak:  "Fix my code"  
✅ Strong: "The `parseDate()` function in utils.ts throws a TypeError when the input 
           is an empty string. Fix it to return null instead of throwing."

❌ Weak:  "Write an email"
✅ Strong: "Write a professional follow-up email to a client who missed a meeting. 
           Tone: polite but firm. Length: 3–4 sentences. Do not apologize on their behalf."
```

## Common Mistakes

- **Adding filler phrases**: "Please", "I need you to", "Could you" — cut them, lead with the verb
- **Over-explaining**: More words ≠ better prompt; cut anything the AI doesn't need
- **No output spec**: Always state what form the response should take
- **Assumed context**: Never assume the AI knows your project, codebase, or conversation history
- **Passive phrasing**: "The code should be improved" → "Rewrite the code to..."
