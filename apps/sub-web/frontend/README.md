# @nebula-studio-renderer/main

主窗口 **Vue renderer**。**磁盘目录名为 `frontend/`**，与 npm 包名 **`@nebula-studio-renderer/main`** 不同——历史/约定原因，搬迁时两者不要混用。

## 运行场景

- **Electron**：由 `apps/electron` 的 `boot.ts` 按配置加载 `src/main.ts`。
- **Web embed**：`apps/web` 侧对应入口（见 web 包 README）。
- **独立 Vite 调试**：`src/dev/main.ts` + 根目录 `vite.config.ts`（仅开发便利，不参与 Electron 生产 boot 路径）。

## 入口与样式

| 路径 | 说明 |
| --- | --- |
| `src/main.ts` | 正式入口；首行应引入 `@nebula-studio-internal/tailwind/electron`（与仓库其它 renderer 一致） |
| `src/platform/integratedApps.ts` | 平台子应用集成 catalog（导出 `@nebula-studio-renderer/main/platform/integrated-apps`） |
| `src/runtime/registerIntegratedApps.ts` | 壳 renderer 启动时注册集成元数据 |
| `src/assets/main.css` | 应用级样式（在 tailwind 链之后） |

## 脚本

见 [package.json](./package.json)：`dev`、`build`、`typecheck` 等。

## 改名 / 迁目录必查

1. **`apps/electron/app.config.ts`** 中 `windows.*.renderer` 是否为 **`main`**（值表示 `apps/sub-web/<目录名>`，当前目录名为 `frontend` 时对应关系见该文件注释与 `boot.ts`）。
2. **`boot.ts` 的 glob** 只匹配 `*/src/main.ts`，不读 `package.json` 的 name。
3. **Web / 其它引用** 到 `@nebula-studio-renderer/main` 或路径别名处。

## 相关

- [Monorepo 索引](../../../docs/monorepo.md) · [Electron README](../../../apps/electron/README.md)
