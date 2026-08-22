# Phase 0 Module Federation notes

Vehicle: `apps/mf-poc-host` (Web) + `apps/mf-poc-host/electron-poc` (isolated Electron). Production `apps/web` / `apps/electron` WindowManager are **not** on this path.

Baseline toolchain (2026-08-22): Vite **8.1.3**, Vite+ (`vp`), `@module-federation/vite` **^1.11.0**, `@module-federation/runtime` **^0.21.6**.

## What worked

- Production **build** of Hello remotes + poc Host: Federation plugin emits `mf-manifest.json`; dual expose is an **array** of `{ path, name, assets.js.sync }`, not a map. `vp run check:mf-poc` must use that shape.
- Host `registerRemotes` + `loadRemote` with empty `remotes: {}` in the Host vite plugin (dynamic registry).
- Dual expose split: `./application` contains `NEBULA_POC_DESIGNER_ONLY`; `./runtime-application` sync JS must not. Standalone hello-dual on **5193** boots designer (marker visible); Host slot loads **runtime** (`runtime-ok`).
- Electron **packaged-like** serve: privileged custom scheme `mf-poc://` maps hostname → remote/host `dist` (same layout extraResources would copy). `electron … --check` fetches manifests + host `index.html` without opening a window. Renderer uses `?mf=file` so registry points at `mf-poc://<id>/mf-manifest.json`, not `file://`.
- Isolated Electron main: `sandbox` + `contextIsolation` + **no** `nodeIntegration` / no preload (ADR-06 direction). File-mode standalone links use `mf-poc://<remote>/index.html` and `setWindowOpenHandler` (same idea as HTTP 5191–5193).

## What failed or needed a workaround

- **Dev CSS isolation:** `nebulaCssNamespacePlugin` with `enforce: 'post'` ran after Vite converted CSS to a JS injector, so dev still injected global `.poc-box` and the later Remote (blue) won. Production `generateBundle` still namespaced CSS, so `electron-file` looked correct (`isolated: true`) while HTTP/dev showed both slots blue. Fix: `enforce: 'pre'` and skip already-JS CSS modules. Restart hello / hello-style-b after the plugin change.
- **Remote HMR:** not validated as “official Vite remote HMR”. Changing a remote still requires that remote’s Vite process to pick up plugin `transform`. Treat `dev.remoteHmr` as roadmap until measured on Vite+ + dynamic `registerRemotes` (and Electron). Do not assume it works.
- **Raw `file://` + ESM + MF:** not used. Chromium + Module Federation expect a fetchable origin; `mf-poc://` (standard + `supportFetchAPI`) is the Phase 0 stand-in for packaged extraResources. Production Electron reuses the same serve helper (`@nebula-studio/federation-protocol`) on **`nebula-remote://`**, not `mf-poc://`.
- **Electron `--file` empty slots:** Host HTML ran but `loadRemote` failed. `net.fetch(file://)` did not give JS MIME / CORS; built remotes have `publicPath: "/"`. Handler now serves bytes with `text/javascript` + CORS, rewrites manifest `publicPath` to `mf-poc://<remote>/`, and the PoC window uses `sandbox: false` (still no `nodeIntegration`). Rebuild Host after renderer error-report change: `vp run --filter @nebula-studio/mf-poc-host build`.
- **Host CSP:** default `'self'` blocked remote `connect-src` / `script-src`. PoC CSP allows `http://localhost:*` and `mf-poc:`. Production Web Host CSP must allow the Docs origin (`http://localhost:5176` in dev) and `nebula-remote:` for packaged-like loads.

## Commands

```text
vp run --filter @nebula-studio-renderer/hello dev
vp run --filter @nebula-studio-renderer/hello-style-b dev
vp run --filter @nebula-studio-renderer/hello-dual dev
vp run --filter @nebula-studio/mf-poc-host dev
```

Web Host: http://localhost:5190

```text
vp run check:mf-poc
```

Electron (after remotes 5191–5193 + Host 5190, or after `check:mf-poc` dist):

```text
vp run dev:mf-poc:electron
vp run dev:mf-poc:electron-file
```
