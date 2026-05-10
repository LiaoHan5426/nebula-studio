---
name: vite-plus-workflow
description: >-
  Uses Vite+ (`vite-plus` package) and the global `vp` CLI for installs, scripts,
  checks, and `vite.config.ts` toolchain blocks. Use when adding or removing
  dependencies, running workspace commands, configuring fmt/lint/test/run/staged,
  or when the user mentions vp, Vite+, vite-plus, vite-pus (typo for Vite+), or
  viteplus.dev.
---

# Vite+ / `vp` workflow

## Concepts

- **`vite-pus`**: treat as **Vite+** — same toolchain and **`vp`** commands as `vite-plus` / Vite+ (common typo / shorthand in chat).
- **`vp`**: global CLI (runtime + package manager + frontend toolchain). Distinct from plain Vite; dev/build go through Vite+ (`vp dev`, `vp build`).
- **`vite-plus`**: project dependency; `defineConfig` is imported from `vite-plus` in `vite.config.ts`.
- **Docs**: https://viteplus.dev/guide/ — also `node_modules/vite-plus/docs` after install.

When unsure of flags, run `vp help` and `vp <command> --help`.

## Dependency management (prefer `vp` over raw pm)

`vp` picks pnpm/npm/yarn/bun from the workspace (see `packageManager`, lockfiles, workspace files). Default fallback is pnpm if nothing matches.

| Task | Command |
|------|---------|
| Install lockfile graph | `vp install` |
| Frozen CI-style | `vp install --frozen-lockfile` |
| Lockfile only | `vp install --lockfile-only` |
| Monorepo scope | `vp install --filter <pkg>` or `-w` workspace root |
| Add runtime dep | `vp add <pkg>` |
| Add dev dep | `vp add -D <pkg>` |
| Optional / peer | `vp add -O <pkg>`, `vp add --save-peer <pkg>` |
| Remove | `vp remove <pkg>` / `vp remove --filter <workspace> <pkg>` |
| Update / inspect | `vp update`, `vp outdated`, `vp dedupe` |
| Why / metadata | `vp why <pkg>`, `vp info <pkg>`, `vp list` |
| Native rebuild | `vp rebuild` |
| Ad-hoc binary | `vp dlx <pkg> <args>` |
| Raw PM passthrough | `vp pm <subcommand> ...` |

### Global tools

- `vp install -g <pkg>`
- `vp uninstall -g <pkg>`
- `vp update -g [pkg]`
- `vp list -g [pkg]`

Example: `vp add -g openskills` (or global installs the user already uses).

## Common `vp` commands (toolchain)

| Command | Role |
|---------|------|
| `vp dev` | Dev server (Vite+) |
| `vp build` | Production build |
| `vp test` | Tests (Vitest integration) |
| `vp check` | Format + lint + typecheck (project-defined) |
| `vp fmt` / `vp lint` | Format / lint when split out |
| `vp run <script>` | Run `package.json` scripts (often workspace-aware) |
| `vp run -r <script>` | Recursive / workspace scripts (common in monorepos) |
| `vp exec <bin> ...` | Run a binary with resolved env |
| `vp pack` | Pack/publish-related when configured |

Project scripts may wrap these (e.g. `vp check --fix`, `vp run web#build`). Prefer existing root `package.json` scripts when they encode repo conventions.

## `vite.config.ts` (Vite+)

Import:

```ts
import { defineConfig } from 'vite-plus';
```

Vite+ merges normal Vite options with toolchain sections. Typical extra keys (availability depends on version — confirm in local types/docs):

- **`server`**, **`build`**, **`preview`**: standard Vite.
- **`test`**: Vitest-style config.
- **`lint`**, **`fmt`**: Oxlint / Oxfmt (or project wrappers).
- **`run`**: task runner / cache (e.g. `run: { cache: true }`).
- **`staged`**: map globs to commands (e.g. lint-staged style `'*': 'vp check --fix'`).
- **`pack`**: packaging when used.

Keep project-specific fmt/lint ignores and shared configs in one root `vite.config.ts` when that matches the repo layout.

## Repo hygiene (monorepos using Vite+)

After pulling changes: `vp install`.

Before finishing work: run whatever the repo documents (`vp check`, `vp test`, or package scripts).
