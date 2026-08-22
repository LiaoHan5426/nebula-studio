# @nebula-studio/electron

Electron **应用根包**：主进程、preload 与各 **Vue renderer** 的 **electron-vite** 构建入口。

## 职责边界

| 层次 | 位置 | 说明 |
| --- | --- | --- |
| 主进程 | `src/main/**` | 窗口、BrowserView、IPC、配置、日志等（细目见 [src/main/README.md](./src/main/README.md)） |
| Renderer 引导 | `src/renderer/boot.ts` | **唯一** HTML 入口；Federation 走 `bootFederationRenderer`；工作台 / 登录走 Host `bootHostWorkspace` / `bootHostLogin` |
| Renderer 样式 | `src/renderer/styles/electron-overrides.css` | **仅桌面** 的样式覆盖；全局设计链仍走 `@nebula-studio-internal/tailwind/electron`（在 `boot.ts` 首行引入） |
| 应用事实配置 | `app.config.ts` | 窗口、modal、preload 映射、`renderers` 目录名；注释内写明与 Web 壳同源字段来源 |

## 关键不变量（迁移必查）

1. **`windows.json` 窗口映射保留，renderer 不再 glob `main.ts`**
   - `windows.*.renderer` / `modalRenderers.*.renderer` 仍标识窗口（`frontend`、`login`、docs/settings/integration）。
   - 不要删 preload / modal / `apiTargets`。
   - Docs / Settings / Integration：`webLoad=federation`。
   - 工作台 / 登录：Host-owned，import `apps/web` 的 boot，不调用 `main/boot` 或 `login/boot`。

2. **构建管线**
   - `package.json` → `build`：先全量 typecheck，再 `electron-vite build`。文档子应用 `@nebula-studio-renderer/docs` 通过 renderer 动态入口加载（`?renderer=docs`），无需单独复制静态站点。

3. **Vite 配置**
   - `electron.vite.config.ts` → `@nebula-studio-internal/vite` 的 `defineNebulaConfig({ platform: 'electron' })`。
   - preload 输入由生成 manifest 的窗口 ID 创建，统一加载 `apps/electron-preload/src/unified.ts`，再按能力配置组装桥接 API。

## 脚本（摘要）

| 脚本 | 作用 |
| --- | --- |
| `dev` / `start` | electron-vite 开发 / 预览 |
| `build` | typecheck + electron-vite build |
| `typecheck` | 主进程 tsc + renderer vue-tsc + `vp run --filter "@nebula-studio-renderer/*" typecheck` |
| `pack:*` | electron-builder 各平台 |

完整依赖与脚本见 [package.json](./package.json)。

## 相关文档

- [仓库根 README](../../README.md) · [Monorepo 索引](../../docs/monorepo.md)
- [主进程模块说明](./src/main/README.md)
