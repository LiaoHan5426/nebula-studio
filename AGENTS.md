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
| **Vite+ / vp Workflow** | Uses Vite+ (`vite-plus` package) and the global `vp` CLI for installs, scripts, checks, and `vite.config.ts` toolchain blocks. **Read this skill before changing deps, scripts, or running dev/build/check.** |

## Usage

Refer to individual SKILL.md files in `agent-skills/skills/` for detailed documentation on each skill.
