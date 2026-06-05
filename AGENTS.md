# Agent Skills

This document describes the workflow agents and skills available for this project.

## Skills Directory Structure

Skills are defined in the `agent-skills/` directory:

```
agent-skills/
├── rules/                    # Rule configurations
│   ├── code-fix-workflow.mdc
│   ├── confirm-feedback-typo.mdc
│   ├── mid-task-supplements.mdc
│   └── vite-plus-workflow.mdc
└── skills/                   # Skill definitions
    ├── code-fix-workflow/
    │   └── SKILL.md
    ├── confirm-feedback-typo/
    │   └── SKILL.md
    ├── mid-task-supplement/
    │   └── SKILL.md
    └── vite-plus-workflow/
        └── SKILL.md
```

## Available Skills

| Skill Name | Description |
| --- | --- |
| **Code Fix Workflow** | Prioritizes how to apply code fixes: immediate patches for simple issues, short plans when useful, and ordered execution when multiple fixes exist. |
| **Confirm Feedback Typo** | Clarifies ambiguous or typo-prone user feedback before acting. |
| **Mid-Task Supplement** | Handles new user messages that arrive while a multi-step problem is still in progress. |
| **Vite+ / vp Workflow** | Uses Vite+ (`vite-plus` package) and the global `vp` CLI for installs, scripts, checks, and `vite.config.ts` toolchain blocks. |

## Usage

Refer to individual SKILL.md files in `agent-skills/skills/` for detailed documentation on each skill.
