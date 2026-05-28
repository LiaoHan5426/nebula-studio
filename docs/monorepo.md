# Monorepo 目录说明

本文件是 **恢复仓库结构时的索引**：表格内链接指向各包 `README.md`（含更细的职责、入口文件与脚本）。

## 包索引

| 区域 | 路径 | 说明 |
| --- | --- | --- |
| 根 | [README.md](../README.md) | 架构速览、约定、常用命令 |
| 应用 | [apps/electron](../apps/electron/README.md) | Electron 主进程 / preload 构建 / renderer boot |
|  | [apps/web](../apps/web/README.md) | Web 壳与 embed |
| 子应用 | [apps/sub-web/docs](../apps/sub-web/docs/README.md) | 文档站 renderer |
|  | [apps/sub-web/frontend](../apps/sub-web/frontend/README.md) | 主窗口 renderer（包名 `main`，目录名 `frontend`） |
|  | [apps/sub-web/login](../apps/sub-web/login/README.md) | 登录 renderer |
|  | [apps/sub-web/settings](../apps/sub-web/settings/README.md) | 设置 renderer |
| Preload | [apps/electron-preload/main](../apps/electron-preload/main/README.md) | 主 preload |
|  | [apps/electron-preload/docs](../apps/electron-preload/docs/README.md) | 文档 preload |
|  | [apps/electron-preload/settings](../apps/electron-preload/settings/README.md) | 设置 preload |
| 公共包 | [packages/app-shell](../packages/app-shell/README.md) | Electron / Web 壳配置与集成 |
|  | [packages/nebula-ui](../packages/nebula-ui/README.md) | UI 组件库 |
|  | [packages/styles](../packages/styles/README.md) | 全局语义色等（无 Tailwind 主题层） |
|  | [packages/types](../packages/types/README.md) | 全局 ambient 类型 |
|  | [packages/electron-shared](../packages/electron-shared/README.md) | 主进程 / preload 共享 |
|  | [packages/electron-shared-vue](../packages/electron-shared-vue/README.md) | 渲染进程 Vue 共享 |
| 内部 | [internal/vite](../internal/vite/README.md) | 共享 Vite / electron-vite 配置 |
|  | [internal/node](../internal/node/README.md) | monorepo 解析等 Node 工具 |
| 工具链 | [tools/tailwindcss](../tools/tailwindcss/README.md) | Tailwind v4 + `electron` 样式入口 |
|  | [tools/tsconfig](../tools/tsconfig/README.md) | 共享 tsconfig |
|  | [tools/lint/oxlint](../tools/lint/oxlint/README.md) | Oxlint 配置（打包） |
|  | [tools/lint/oxfmt](../tools/lint/oxfmt/README.md) | Oxfmt 配置（打包） |
|  | [tools/lint/stylelint](../tools/lint/stylelint/README.md) | Stylelint 入口 |

工作区成员列表与 glob：**[pnpm-workspace.yaml](../pnpm-workspace.yaml)**。

---

## 改名 / 迁目录后核对清单（避免静默损坏）

以下项 **没有单一魔法配置** 自动全盘更新，搬迁目录或重命名包后请逐项核对。

| 主题 | 要检查的文件/位置 |
| --- | --- |
| 新增或移动 **sub-web renderer** | `apps/electron/app.config.ts`（`windows` / `modalRenderers` / `renderers`）与 **`apps/electron/src/renderer/boot.ts`** 内 `import.meta.glob('../../../sub-web/*/src/main.ts')` 路径段必须一致；缺 `main.ts` 会在启动时抛错。 |
| **preload 包名** | `app.config.ts` 里 `preload: 'main' \| 'docs' \| …` 对应 `apps/electron-preload/<slug>` 与 npm 名 `@nebula-studio-preload/<slug>`。 |
| **文档站静态拷贝** | `apps/electron/scripts/copy-docs-site.mjs` 使用 `getPackageSync('@nebula-studio-renderer/docs', …)`；若改包名需同步脚本与 `package.json` 的 `name`。 |
| **全局样式链** | `tools/tailwindcss/src/electron.ts`（`theme.css` → `@nebula-studio/styles`）；各 embed 仍 `import '@nebula-studio-internal/tailwind/electron'`。 |
| **Tailwind `@source`** | `tools/tailwindcss/src/theme.css` 内为相对路径，迁仓库子路径时需手改。 |
| **手动分包规则** | `internal/vite/src/config/chunks/rules/nebulaWorkspace.ts` 等若写死 `packages/<名>/`。 |
| **Oxlint Tailwind 入口** | `tools/lint/oxlint/src/configs/tailwindcss.ts` 通过 `getPackageSync('@nebula-studio-internal/tailwind', …)` 解析主题 CSS。 |
| **Ambient 类型** | 侧效模块、`__NEBULA_BUILD_NODE_VERSION__`、第三方补洞集中在 **`packages/types`**；子应用 `env.d.ts` 只保留 **Window / preload 形态** 等与包相关的声明。 |
| **本文档表格链接** | 若移动某包 `README.md`，更新上表相对路径。 |

---

## 主进程模块（补充）

Electron 主进程模块化说明（IPC、日志目录、watch 等）见 **[apps/electron/src/main/README.md](../apps/electron/src/main/README.md)**（与上层应用 README 互补，不重复粘贴长列表时可链到该文件）。
