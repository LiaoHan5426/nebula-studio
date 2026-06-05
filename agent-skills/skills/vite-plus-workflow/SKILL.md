---
name: vite-plus-workflow
description: >-
  Uses Vite+ (`vite-plus` package) and the global `vp` CLI for installs, scripts, checks, and `vite.config.ts` toolchain blocks. Use when adding or removing dependencies, running workspace commands, configuring fmt/lint/test/run/staged, or when the user mentions vp, Vite+, vite-plus, vite-pus (typo for Vite+), or viteplus.dev.
---

# Vite+ / `vp` workflow

## Concepts

- **`vite-pus`**: only treat the exact token `vite-pus` as the known common typo for `vite-plus`. Do not automatically map other misspellings — ask the user to confirm before auto-correcting other variants.
- **`vp`**: global CLI (runtime + package manager + frontend toolchain). Distinct from plain Vite; dev/build go through Vite+ (`vp dev`, `vp build`).
- **`vite-plus`**: project dependency; `defineConfig` is imported from `vite-plus` in `vite.config.ts`.
- **Docs**: https://viteplus.dev/guide/ — also `node_modules/vite-plus/docs` after install.

If `vp` is not installed, install it with `npm install -g vp` or follow the repo's bootstrap recommended installer. In CI, install Node, add `vp` to PATH, or use `voidzero-dev/setup-vp` before `vp install`.

When unsure of flags, run `vp help` and `vp <command> --help`.

- If `vp` reports `command not found`, check that `vp` is installed and on PATH. Install with `npm install -g vp` or follow repo CI setup. For network or package-not-found errors, run `vp install --verbose` and inspect `vp why <pkg>`.

Use this decision tree for common changes:

1. If you changed formatting or linting, run `vp check` (or `vp check --fix`).
2. If you added or changed tests, run `vp test`.
3. If unsure, run `vp check` then `vp test`.

## Dependency management (prefer `vp` over raw pm)

`vp` picks pnpm/npm/yarn/bun from the workspace (see `packageManager`, lockfiles, workspace files). Default fallback is pnpm if nothing matches.

| Task | Command |
| --- | --- |
| Install lockfile graph | `vp install` |
| Frozen CI-style | `vp install --frozen-lockfile` |
| Lockfile only | `vp install --lockfile-only` |
| Monorepo scope | `vp install --filter <pkg>` or `vp install -w` (use `-w` to run `vp install` at the workspace root) |
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

| Command              | Role                                                |
| -------------------- | --------------------------------------------------- |
| `vp dev`             | Dev server (Vite+)                                  |
| `vp build`           | Production build                                    |
| `vp test`            | Tests (Vitest integration)                          |
| `vp check`           | Format + lint + typecheck (project-defined)         |
| `vp fmt` / `vp lint` | Format / lint when split out                        |
| `vp run <script>`    | Run `package.json` scripts (often workspace-aware)  |
| `vp run -r <script>` | Recursive / workspace scripts (common in monorepos) |
| `vp exec <bin> ...`  | Run a binary with resolved env                      |
| `vp pack`            | Pack/publish-related when configured                |

Project scripts may wrap these (e.g. `vp check --fix`, `vp run web#build`). Prefer existing root `package.json` scripts when they encode repo conventions. If existing root scripts invoke `npm`, `pnpm`, or `npx`, update them to equivalent `vp` invocations (for example, replace `npm run build` with `vp run build`) instead of keeping raw package-manager calls.

## `vite.config.ts` (Vite+)

Import:

```ts
import { defineConfig } from 'vite-plus';
```

Vite+ merges normal Vite options with toolchain sections. Typical extra keys (availability depends on version — confirm by checking `node_modules/vite-plus/types.d.ts` or `node_modules/vite-plus/docs`, or run `vp info vite-plus` in the repo root):

- **`server`**, **`build`**, **`preview`**: standard Vite.
- **`test`**: Vitest-style config.
- **`lint`**, **`fmt`**: Oxlint / Oxfmt (or project wrappers).
- **`run`**: task runner / cache (e.g. `run: { cache: true }`).
- **`staged`**: map globs to commands (e.g. lint-staged style `'*': 'vp check --fix'`).
- **`pack`**: packaging when used.

If the repository is single-package or a monorepo where all packages should inherit a single shared config (i.e. packages do not require distinct fmt/lint rules), place shared fmt/lint ignores and configs in the root `vite.config.ts`. Otherwise keep package-level fmt/lint configs.

## Repo hygiene (monorepos using Vite+)

After pulling changes: `vp install`.

Before finishing work: run whatever the repo documents (`vp check`, `vp test`, or package scripts).

### This repo: no `npm` / `pnpm` in scripts or CI

In `package.json` `scripts` and `.github/workflows/*`, do not call `npm run`, `npx`, `pnpm`, or `pnpm run`. Use **`vp`** (`vp run`, `vp install`, `vp dlx`, …). If existing scripts currently call `npm`/`pnpm`/`npx`, update them by replacing those invocations with equivalent `vp` invocations (for example, replace `npm run build` with `vp run build`). If a script relies on package-manager-specific behavior, document those required changes before migration. CI should bootstrap with **`voidzero-dev/setup-vp`** and then `vp install` / `vp run …`. Keeping `packageManager` / `pnpm-lock.yaml` for Corepack and lockfile is fine; day-to-day commands stay on **`vp`**.
