---
name: confirm-feedback-typo
description: >-
  Clarifies ambiguous or typo-prone user feedback before acting. Use when the
  user's message may contain misspellings, wrong technical terms, or vague
  pointers that could change the meaning of a fix or feature request.
---

# Confirm potentially ambiguous feedback

## When to pause and confirm

- **Likely typos** in identifiers, file paths, package names, flags, or APIs where several corrections are plausible.
- **Garbled or vague instructions** that could map to more than one interpretation (e.g. "fix the red line" without path, or two similarly named components).
- **Conflicting signals** (e.g. "delete X" and later "keep X for now").

## What to do

1. **Quote or paraphrase** the understood intent in one short sentence.
2. **Call out the uncertainty** (e.g. "Did you mean `FooBar` or `FooBaz`?").
3. **Wait for confirmation** before large edits, destructive steps, or broad refactors.

## When not to over-confirm

- A single **obvious** correction exists (common IDE typo with one sensible fix).
- The user **already provided** enough context (paths, snippets, error text).
- **Small reversible** edits; still confirm if deletion or contract-breaking change is involved.

Keep confirmations brief; do not lecture about spelling.
