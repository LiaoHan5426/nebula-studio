# Agent Skills

This document describes the workflow agents and skills available for this project, and how agents should run the **nebula-studio** frontend.

## Frontend toolchain: Vite+ (`vp`)

This monorepo uses **[Vite+](https://viteplus.dev/guide/)** — unified runtime, package manager, and frontend toolchain. The global CLI is **`vp`**; local config comes from the **`vite-plus`** package (`vite.config.ts` uses `defineNebulaConfig` / `defineConfig` from Vite+).

**Agents must prefer `vp` over raw `pnpm` / `npm` / `npx`** when installing dependencies, starting dev servers, running checks, or invoking workspace scripts. Lockfiles and `packageManager` in `package.json` may still reference pnpm; day-to-day commands go through `vp`.

| Task | Command (from repo root unless noted) |
| --- | --- |
| Install dependencies | `vp install` |
| Web shell dev (integration embedded) | `vp run dev:web` → http://localhost:5173 |
| Integration app only (standalone + API proxy) | `vp run --filter @nebula-studio-renderer/integration dev` → http://localhost:5174 |
| Typecheck integration package | `vp run --filter @nebula-studio-renderer/integration typecheck` |
| Format + lint + typecheck | `vp check` |
| Tests | `vp test` or `vp run test` |
| Production build (all workspaces) | `vp run build` |
| Run any `package.json` script | `vp run <script>` or `vp run <workspace>#<script>` (e.g. `vp run web#dev`) |

If `vp` is missing: install per [Vite+ Getting Started](https://viteplus.dev/guide/) (`irm https://vite.plus/ps1 \| iex` on Windows), then open a new shell and run `vp help`.

For flags and advanced usage, read `agent-skills/skills/vite-plus-workflow/SKILL.md` or run `vp help` / `vp <command> --help`.

**Agent shell (Windows):** do not pipe `vp build` / `vp check` through `Select-Object -Last` — PowerShell buffers the whole stream and Cursor sees no output until exit. Use Shell `working_directory`, set `block_until_ms` high enough (5–10 min for builds), and run `rtk vp …` plainly. Details in the Vite+ skill.

### E2E smoke (integration ↔ camel platform)

Typical local stack before manual or API smoke tests:

1. **Backend** (Java/Maven, separate repo `nebula`):
   - Console `:8080` — from `demos/demo-camel-console`: `mvn spring-boot:run -DskipTests`
   - Executor `:8081` — from `demos/demo-camel-executor`: `mvn spring-boot:run -DskipTests`
   - Do **not** use `mvn -pl … spring-boot:run` from the parent POM alone (it may bind to `nebula-parent` and fail); run from each demo module directory or `-f demos/demo-camel-console/pom.xml`.
2. **Frontend** (this repo, **use `vp`**):
   - **Recommended:** `vp run dev:web` — open http://localhost:5173, enter「应用集成」→「集成平台」
   - **Standalone integration:** `vp run --filter @nebula-studio-renderer/integration dev` — http://localhost:5174 (proxies `/api` → console 8080, gateway/demo → executor 8081)
3. **Demo login:** `admin` / `admin123` or `demo` / `demo`; default tenant header `tenant-a`, API key `demo-api-key-tenant-a` for gateway demos.

Smoke checks: login → tenant list/switch → subscriptions + SSE → gateway call → monitor APIs. Use `curl.exe` on Windows (PowerShell `curl` is an alias for `Invoke-WebRequest`).

## Code review graph (`code-review-graph` / CRG)

This workspace pairs **nebula-studio** (frontend) with **nebula** (Java backend). Use **CRG** for impact analysis, call-path questions, and change-aware reviews — do not rely on manual grep alone.

### Registered repositories

| Alias    | Path                                     |
| -------- | ---------------------------------------- |
| `studio` | `F:\2-front\nebula-studio\nebula-studio` |
| `nebula` | `F:\1-back\nebula`                       |

Registry: `~/.code-review-graph/registry.json`. Re-register after moving a repo: `code-review-graph register <path> --alias <name>`.

### When agents must use CRG

Use CRG **before** broad codebase exploration when the user asks about:

- **Blast radius / impact** (“改 X 会影响哪些调用路径？”)
- **Code review** of uncommitted or recent changes
- **Architecture / dependency** questions scoped to known files or modules
- **Cross-repo** frontend ↔ backend coupling (run per repo, then synthesize)

Hooks keep graphs fresh (`~/.cursor/hooks.json`): `afterFileEdit` → `update`, `sessionStart` → `status`, `beforeShellExecution` on `git commit` → `detect-changes`.

### MCP (preferred in Cursor)

Server identifier: **`user-code-review-graph`** (not `code-review-graph`).

| Tool | Use for |
| --- | --- |
| `get_impact_radius_tool` | Blast radius for `changed_files` + `repo_root` + `max_depth` |
| `detect_changes_tool` | Risk-scored review of git diff (primary review tool) |
| `traverse_graph_tool` / `query_graph_tool` | Follow imports/calls from a symbol or file |
| `get_affected_flows_tool` | End-to-end flows touching changed code (after `postprocess`) |
| `cross_repo_search_tool` | Search across registered repos by keyword |
| `list_repos_tool` | Confirm registry entries |

**Dual-repo pattern:** pass `repo_root` for each side separately (e.g. auth Java under `nebula`, `webBackendAuth.ts` under `studio`), then merge answers. API contract edges (`/api/auth/*`, `/api/system/*`) still need explicit cross-check.

Example MCP args:

```json
{
  "changed_files": ["packages/app-shell/src/web/webBackendAuth.ts"],
  "repo_root": "F:\\2-front\\nebula-studio\\nebula-studio",
  "max_depth": 3,
  "detail_level": "minimal"
}
```

### CLI (fallback)

From repo root:

| Task                  | Command                                    |
| --------------------- | ------------------------------------------ |
| Graph stats           | `code-review-graph status`                 |
| Incremental update    | `code-review-graph update --skip-flows`    |
| Flows + communities   | `code-review-graph postprocess`            |
| Change impact (brief) | `code-review-graph detect-changes --brief` |
| List registered repos | `code-review-graph repos`                  |

After large pulls or branch switches: `code-review-graph build` (full rebuild) in each repo.

### Maintenance

Post-processing is required for **flows** and **communities**. Current counts (re-run `postprocess` after major refactors):

- **studio:** ~262 flows, ~17 communities
- **nebula:** ~455 flows, ~10 communities

On Windows, Cursor hooks invoke PowerShell scripts under `~/.cursor/hooks/crg-*.ps1` (not `.sh`).

## Skills Directory Structure

Skills are defined in the `agent-skills/` directory:

```
agent-skills/
├── rules/                    # Rule configurations
│   ├── code-fix-workflow.mdc
│   ├── confirm-feedback-typo.mdc
│   ├── git-commit-message.mdc
│   ├── mid-task-supplements.mdc
│   ├── powershell-shell-workflow.mdc
│   └── vite-plus-workflow.mdc
└── skills/                   # Skill definitions
    ├── code-fix-workflow/
    │   └── SKILL.md
    ├── confirm-feedback-typo/
    │   └── SKILL.md
    ├── git-commit-message/
    │   └── SKILL.md
    ├── mid-task-supplement/
    │   └── SKILL.md
    ├── powershell-shell-workflow/
    │   └── SKILL.md
    └── vite-plus-workflow/
        └── SKILL.md
```

## Available Skills

| Skill Name | Description |
| --- | --- |
| **Code Fix Workflow** | Prioritizes how to apply code fixes: immediate patches for simple issues, short plans when useful, and ordered execution when multiple fixes exist. |
| **Confirm Feedback Typo** | Clarifies ambiguous or typo-prone user feedback before acting. |
| **Git Commit Message** | Git commit message specification for the Nebula project. All commit messages must be in Chinese, following the `<type>(<scope>): <description>` format. |
| **Mid-Task Supplement** | Handles new user messages that arrive while a multi-step problem is still in progress. |
| **PowerShell / Windows Shell** | Chains commands with `;` (not `&&`), runs long-lived processes in background, and maps bash-only syntax to PowerShell. **Read before running terminal commands on Windows.** |
| **Vite+ / vp Workflow** | Uses Vite+ (`vite-plus` package) and the global `vp` CLI for installs, scripts, checks, and `vite.config.ts` toolchain blocks. **Read this skill before changing deps, scripts, or running dev/build/check.** |

## Usage

Refer to individual SKILL.md files in `agent-skills/skills/` for detailed documentation on each skill.
