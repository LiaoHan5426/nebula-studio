---
name: mid-task-supplement
description: >-
  Handles new user messages that arrive while a multi-step problem is still in progress. Treats them as supplements or course corrections (fetch extra info, adjust scope), pauses the current line of work until reconciled, merges them with the ongoing task, and asks targeted clarification before proceeding. Before proceeding, confirm (1) exact change (files/endpoints/commands), (2) relationship to original requirement (replace/augment), and (3) partial-work disposition (keep/revert). If multiple supplements arrive before reconciliation, consolidate them into one summary listing each delta in arrival order and ask a single clarifying question. If they conflict, ask the user to prioritize or state that the latest explicit "replace" message takes precedence. Use when the user sends additional instructions mid-fix, mid-investigation, or mid-implementation.
---

# Mid-task supplementary instructions

## Default assumption

New messages during an active task are **additive or corrective**, not necessarily a brand-new unrelated task.

Treat a message as a new task (not a supplement) only if it contains one of: the phrase "new task", a subject line or goal differing from the active task, or an explicit "cancel" message. Otherwise treat it as a supplement.

If the user sends an explicit cancel, immediately stop further changes and either (a) roll back any uncommitted partial work, or (b) if rollback is impossible, inform the user which partial changes were made and how to revert them, then confirm the cancellation.

## What to do

**Decision flow:**

1. Check if the supplement explicitly answers all three clarification items: (1) exact change (files/endpoints/commands), (2) relationship (replace/augment), (3) partial-work disposition (keep/revert).
   - If all three are answered, proceed with the changes.
   - If any are missing or ambiguous, pause and ask up to two focused questions (each ≤ 20 words) to resolve ambiguity.
2. **Pause** any operation that meets these criteria before clarification:
   - Deletes or mutates production data or files.
   - Changes more than 3 source files or affects production configuration/deployment.
   - Is estimated to run longer than 2 minutes or requires background execution (CI, containers, async tasks).
3. **Integrate**: relate the new text to the problem currently being solved (goal, constraints, files touched).
4. **Identify deltas**: e.g. new data to gather, narrowed/widened scope, corrected requirement, reprioritization.
5. **Ask up to two concise clarifying questions** (each ≤ 20 words) to resolve remaining ambiguity. Example: "Keep partial changes or revert?" "Does this replace requirement X or augment it?"

## Keep questions focused

- Prefer **specific** questions (“Should A or B win if they conflict?”) over open-ended stalls.
- Treat a supplement as "fully clear" only if it explicitly states: (1) the exact change to make (files/endpoints), (2) whether it replaces or amends prior requirements, and (3) whether to keep or revert partial work. If all three are present, proceed without confirmation.
- If the user does not reply to clarifying questions within 24 hours or after 2 message attempts, default to the conservative option: do not execute destructive steps; proceed only with read-only analysis or non-destructive tasks and notify the user.

## Handling conflicts

- If supplements conflict with each other, present the conflict clearly and require the user to choose between them. If the user doesn't choose, default to the most recent supplement only if it explicitly uses the word "replace"; otherwise keep the original.
- If requirements are inconsistent or impossible (e.g., "make it faster" and "use less CPU" with an impossible tradeoff), reply: "These requirements conflict: [list A vs B]. Please confirm which constraint to prioritize (performance, memory, accuracy, etc)." Then pause destructive actions until the user prioritizes.

## What not to do

- Do not ignore the supplement and continue as if it was never sent.
- Do not assume the new message **fully replaces** the old task unless it explicitly states "replace".
