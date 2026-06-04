---
name: confirm-feedback-typo
description: >-
  Clarifies ambiguous or typo-prone user feedback before acting. Use when the user's message may contain misspellings, wrong technical terms, or vague pointers that could change the meaning of a fix or feature request.
---

# Confirm potentially ambiguous feedback

## Decision flow

1. If the edit meets any explicit confirm criterion below, ask for confirmation.
2. Else if it meets any explicit no-confirm criterion, proceed.
3. If both apply, follow the confirm path.
4. If the user reply is ambiguous, restate the exact action and require explicit yes/no.
5. If the user does not respond within 24 hours, do not apply the change; leave a concise summary comment with options.

## When to pause and confirm

Ask for confirmation if any of these apply:

- Two or more plausible corrections exist for a typo, including identifiers, file paths, package names, flags, or APIs.
- A token differs from an existing identifier by Levenshtein distance ≤ 2 and multiple matches are plausible.
- The change modifies two or more files or spans multiple modules.
- The edit deletes code, removes exports, changes public API signatures, or alters external behavior.
- The edit rewrites a module, reorganizes code structure, or affects data migrations.
- User feedback contains conflicting instructions across messages; summarize the conflict and ask which option to follow.

If ambiguity spans multiple files or modules, list the affected files and require explicit user confirmation before editing more than one file.

## What to do

1. **Quote or paraphrase** the understood intent in one short sentence.
2. **Call out the uncertainty** with explicit alternatives.
3. Present confirmations as a single direct question of 10–25 words that paraphrases the intent and calls out the ambiguity. Example: "I will change `FooBar` → `FooBaz`. Did you mean 1) Rename FooBar to FooBaz, 2) Leave FooBar, 3) Rename to FooQux?"
4. If the user replies with an ambiguous confirmation like "do it", respond with a clarifying question that restates the exact action and requires explicit yes/no.
5. If the user issues conflicting instructions, synthesize the conflict into a short summary and ask a disambiguating question listing the options and a recommended default.
6. If the user does not respond within 24 hours, do not apply the change; instead leave a concise comment summarizing the proposed change and the options.

## When not to over-confirm

- A single obvious correction exists and only one fix is sensible.
- The user already provided enough context: exact paths, snippets, or error text.
- The edit is local to one file and can be reverted with editor undo, such as formatting or spelling only.
- The change does not delete code, alter public-facing behavior, or require cross-file coordination.

Keep confirmations brief; limit them to a single question of 10–25 words, and do not lecture about spelling.
