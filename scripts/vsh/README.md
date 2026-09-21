# @nebula-studio/vsh

Workspace-level development CLI (TypeScript, Node 24 type-stripping). ESLint/Oxlint own source-local rules; this package owns checks requiring package graphs, generated artifacts, or repository-wide state, plus monorepo orchestration commands.

## Checks

- `nebula-vsh scan-circular`
- `nebula-vsh check-workspace`
- `nebula-vsh check-boundaries`
- `nebula-vsh check-generated`
- `nebula-vsh check-inventory`
- (and other `check-*` commands listed by `nebula-vsh` usage)

## Commands

- `nebula-vsh generate-configs` — window / API namespace artifacts
- `nebula-vsh generate-contracts` — OpenAPI → contracts (`--strict`, `--file=`, `--url=`)
- `nebula-vsh clean` — remove `node_modules` / `dist` trees (`--del-lock`)
- `nebula-vsh devlog` — development record markdown
- `nebula-vsh soak-low-code` — low-code runtime soak
- `nebula-vsh migrate-docs-demo` / `split-console-api` — one-shot migration tools

Root `package.json` scripts (`generate:configs`, `clean`, `devlog`, …) call these commands.
