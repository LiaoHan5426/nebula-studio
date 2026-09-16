# Environment files

Sibling of `configs/`. Standard dotenv files (Vite-compatible load order).

| File | Role |
| --- | --- |
| `.env` | Shared defaults (all modes) |
| `.env.development` | Local API origins |
| `.env.preview` | Preview / staging |
| `.env.production` | Production placeholders |
| `.env.example` | Documented key list |
| `.env.local` / `.env.[mode].local` | Machine overrides (gitignored) |

Select mode with `NEBULA_ENV` (`development` default; aliases: `dev`, `preview`/`staging`, `production`/`product`/`prod`).

Loader: `@nebula-studio-internal/node-kit/environments`. Vite apps use `envDir: <repo>/env` via build-kit.
