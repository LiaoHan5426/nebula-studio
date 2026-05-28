# @nebula-studio-preload/main

**主窗口 preload**（随 `electron-vite` 与主进程同次构建）。与 `@nebula-studio-renderer/main`（目录 `apps/sub-web/frontend`）配对。

## 源码入口

- 默认入口文件：`src/index.ts`（由 `internal/vite` 中 electron 配置通过 `require.resolve('@nebula-studio-preload/main/package.json')` 解析路径后参与 rollup `input`）。

## 与配置的对应关系

- `apps/electron/app.config.ts` 里引用 **`preload: 'main'`** 时，即指向本包（slug `main` → 目录 `apps/electron-preload/main`）。

## 脚本

见 [package.json](./package.json)（若有 `typecheck` 等）。

## 改名 / 迁目录必查

- `apps/electron` 的 **electron-vite preload input** 映射（默认在 `@nebula-studio-internal/vite` 的 `defineNebulaElectronViteConfig` 中）。
- `app.config.ts` 中所有 `preload: 'main'` 引用。

## 相关

- [Electron 应用 README](../../electron/README.md) · [Monorepo 索引](../../../docs/monorepo.md)
