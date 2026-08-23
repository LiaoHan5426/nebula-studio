# @nebula-studio-renderer/main

主窗口 **Vue renderer**。**磁盘目录名为 `frontend/`**，与 npm 包名 **`@nebula-studio-renderer/main`** 不同——历史/约定原因，搬迁时两者不要混用。

## 运行场景

- **Electron**：由 `apps/electron` 的 `boot.ts` 加载 Host `bootHostWorkspace`（挂载本包 `./app`）。
- **Web Host**：`apps/web` 的 `shell-entry` → `bootHostWorkspace`。
- **独立 Vite 调试**：`src/main.ts` / `src/dev/main.ts` + 根目录 `vite.config.ts`（standalone，不参与 Electron / Host 生产 boot）。

## 入口与样式

| 路径 | 说明 |
| --- | --- |
| `src/boot.ts` | Host 挂载入口；引入 `@nebula-studio/styles/document` |
| `src/platform/integratedApps.ts` | 平台子应用集成 catalog：先 `windows.json`，再 overlay runtime |
| `src/runtime/registerIntegratedApps.ts` | 壳 renderer 启动时注册集成元数据 |
| `src/assets/main.css` | 应用级样式（在 tailwind 链之后） |

## 脚本

见 [package.json](./package.json)：`dev`、`build`、`typecheck` 等。

## 改名 / 迁目录必查

1. **`configs/windows.json`** 中 `windows.main.renderer` 仍为 **`frontend`**。不要删 preload。
2. Electron / Web Host 走 `bootHostWorkspace`，不再 glob `src/main.ts`。
3. **Web / 其它引用** 到 `@nebula-studio-renderer/main` 或路径别名处。

## 相关

- [Monorepo 索引](../../../docs/monorepo.md) · [Electron README](../../../apps/electron/README.md)
