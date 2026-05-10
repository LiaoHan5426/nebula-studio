---
name: code-fix-workflow
description: >-
  Prioritizes how to apply code fixes: immediate patches for simple issues, short
  plans when useful, and ordered execution when multiple fixes exist. Use when
  implementing bugfixes, review feedback, or multi-issue requests.
---

# Code fix workflow

## Single issue

- **Simple / localized** (clear root cause, few lines, low risk): **implement directly** without a long preamble.
- **Multi-step or cross-cutting** but still clear: give a **short plan** (ordered bullets), then execute unless the user asked for plan-only.

## Multiple issues in one request

1. **Triage**: list distinct fixes.
2. **Order by ascending complexity and risk**: quick wins and mechanical fixes first; deeper refactors or API changes last (unless a cheap fix depends on a structural change — then do the dependency first).
3. **Batch scope**: complete one fix before starting the next when dependencies exist; otherwise parallelize only when independent and safe.

## Planning vs doing

- Prefer **doing** when the path is obvious.
- Prefer a **compact plan** when steps are non-obvious, multiple files are involved, or the user asked how to approach it.

## Scope discipline

Do not expand into unrelated refactors. Each change should trace back to a stated bug, requirement, or confirmed interpretation (see `confirm-feedback-typo` when wording is unclear).
