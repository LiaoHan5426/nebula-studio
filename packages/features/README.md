# packages/features

Shared composables and UI helpers promoted from app-local features.

## Promotion checklist

Before moving code from `apps/sub-web/*/src/features/*` into `packages/features/*`, **all** must be true:

1. **Two real consumers** — at least two independent apps or packages import the feature.
2. **No Router dependency** — composables must not import `vue-router` or assume route names.
3. **Testable boundary** — API calls, mappers, and state machines have vitest coverage without mounting SFCs.
4. **Stable public entry** — one `index.ts` re-exports the supported surface; no deep imports.
5. **Acyclic dependency** — promotion must not introduce imports from `apps/*`, host globals, or UI layout packages back into the shared feature.

## Current packages

| Package | Consumers | Notes |
| --- | --- | --- |
| `use-confirm` | Settings, Integration, … | Thin forwarder to assembly overlay |

## Explicit non-candidates (F3)

These remain app-local until the checklist is satisfied:

- `resource-catalog` — single Integration consumer (portal/provider/admin surfaces share one app).
- `plugin-catalog` — single consumer; exposes `features/plugin-catalog/index.ts` facade instead.
- `subscription-manager` — single consumer; stable `index.ts` entry only.

Do **not** create empty feature packages to satisfy directory counts.
