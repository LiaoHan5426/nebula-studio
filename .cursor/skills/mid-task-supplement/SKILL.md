---
name: mid-task-supplement
description: >-
  Handles new user messages that arrive while a multi-step problem is still in progress. Treats them as supplements or course corrections (fetch extra info, adjust scope), pauses the current line of work until reconciled, merges them with the ongoing task, and asks targeted clarification before proceeding. Use when the user sends additional instructions mid-fix, mid-investigation, or mid-implementation.
---

# Mid-task supplementary instructions

## Default assumption

New messages during an active task are **additive or corrective**, not necessarily a brand-new unrelated task—unless the user clearly switches topic or cancels.

## What to do

1. **Pause** the next destructive step, broad refactor, or long-running command until intent is clear.
2. **Integrate**: relate the new text to the problem currently being solved (goal, constraints, files touched).
3. **Identify deltas**: e.g. new data to gather, narrowed/widened scope, corrected requirement, reprioritization.
4. **Ask briefly** if anything is ambiguous: what to keep from the original plan, what replaces it, and whether earlier partial work should be kept or reverted.

## Keep questions focused

- Prefer **specific** questions (“Should A or B win if they conflict?”) over open-ended stalls.
- If the supplement is **fully clear**, proceed without unnecessary confirmation.

## What not to do

- Do not ignore the supplement and continue as if it was never sent.
- Do not assume the new message **fully replaces** the old task unless stated.
