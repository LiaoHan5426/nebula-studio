# Monorepo 目录与包索引

Nebula Studio 使用 pnpm workspace 组织代码，日常命令统一通过 Vite+ CLI `vp` 执行。工作区 glob 和依赖版本 catalog 以根目录 `pnpm-workspace.yaml` 为准。

## 顶层目录

| 目录                    | 职责                                              |
| ----------------------- | ------------------------------------------------- |
| `apps/electron`         | Electron 主进程、窗口生命周期和 renderer 引导     |
| `apps/electron-preload` | 各窗口 preload，实现受控的 Electron 能力桥接      |
| `apps/sub-web`          | 可独立运行、也可嵌入 Web/Electron 壳的 Vue 子应用 |
| `apps/web`              | Web 宿主和 embed 入口，开发端口 `5173`            |
| `configs`               | 窗口、展示方式及 API target 等单源配置            |
| `packages/core`         | 认证、API、运行时、壳、租户等基础能力             |
| `packages/editors`      | 代码、BPMN、DAG 和低代码编辑器                    |
| `packages/features`     | 可复用业务功能                                    |
| `packages/ui`           | UI 组件、布局和 Agent 界面能力                    |
| `internal`              | 仓库内部 Vite 与 Node 工具，不作为产品公共 API    |
| `tools`                 | 代码质量、TypeScript 和 Tailwind 配置             |
| `e2e`                   | Playwright 端到端及冒烟测试                       |
| `docs`                  | 仓库级开发文档                                    |

## 应用索引

| 路径 | 包名 | 说明 |
| --- | --- | --- |
| [`apps/electron`](../apps/electron/README.md) | `@nebula-studio/electron` | Electron 桌面宿主 |
| [`apps/web`](../apps/web/README.md) | `@nebula-studio/web` | Web 宿主 |
| `apps/sub-web/docs` | `@nebula-studio-renderer/docs` | UI 组件文档子应用 |
| [`apps/sub-web/frontend`](../apps/sub-web/frontend/README.md) | `@nebula-studio-renderer/main` | 主工作台 renderer；目录名与包名不同 |
| [`apps/sub-web/integration`](../apps/sub-web/integration/README.md) | `@nebula-studio-renderer/integration` | 企业接口集成平台 |
| [`apps/sub-web/login`](../apps/sub-web/login/README.md) | `@nebula-studio-renderer/login` | 登录子应用 |
| [`apps/sub-web/settings`](../apps/sub-web/settings/README.md) | `@nebula-studio-renderer/settings` | 设置子应用 |

preload 包位于 `apps/electron-preload/<slug>`，其 npm 包名遵循 `@nebula-studio-preload/<slug>`。

## 核心与契约包

| 路径 | 包名 | 职责 |
| --- | --- | --- |
| [`packages/contracts`](../packages/contracts/README.md) | `@nebula-studio/contracts` | auth、system、integration 及生成契约 |
| `packages/core/api-client` | `@nebula-studio/api-client` | 请求头、响应解析、401 和进度处理 |
| [`packages/core/app-shell`](../packages/core/app-shell/README.md) | `@nebula-studio/app-shell` | Web/Electron 壳配置和桥接 |
| `packages/core/auth` | `@nebula-studio/auth` | 按运行模式编排认证策略 |
| `packages/core/auth-provider` | `@nebula-studio/auth-provider` | 全局认证会话及 Vue 注入 |
| [`packages/core/electron-shared`](../packages/core/electron-shared/README.md) | `@nebula-studio-electron/electron-bridge` | Electron/preload/renderer 桥接类型与实现 |
| `packages/core/msw` | `@nebula-studio/msw` | 本地 Mock Service Worker handlers |
| `packages/core/runtime` | `@nebula-studio/runtime` | 子应用启动和运行模式抽象 |
| `packages/core/shell` | `@nebula-studio/nebula-shell` | 壳层 Vue 状态与生命周期 |
| `packages/core/sse-events` | `@nebula-studio/sse-events` | 订阅事件 SSE 连接管理 |
| `packages/core/tenant` | `@nebula-studio/tenant` | 租户列表、选择和持久化 |

## UI、编辑器与功能包

| 分组 | 工作区成员 |
| --- | --- |
| UI | `@nebula-studio/nebula-ui`、`@nebula-studio/nebula-layout`、`@nebula-studio/nebula-agent` |
| 编辑器 | `nebula-editor`、`@nebula-studio/code-editor`、`@nebula-studio/nebula-flow-editor`、`@nebula-studio/nebula-dag-editor`、`@nebula-studio/nebula-low-render`、`@nebula-studio/nebula-integration-panel` |
| 功能 | `@nebula-studio/plugin-installer`、`@nebula-studio/use-confirm` |
| 基础样式/类型 | `@nebula-studio/styles`、`@nebula-studio/types` |

## 新增、移动或改名检查清单

1. 更新 `pnpm-workspace.yaml` 的工作区 glob（若现有 glob 未覆盖）。
2. 更新所有 workspace 依赖、源码导入和 README 链接。
3. 子应用变更需更新 `configs/windows.json`，再执行 `vp run generate:configs`。
4. 检查 `apps/electron/src/renderer/boot.ts` 对 `apps/sub-web/*/src/main.ts` 的动态发现。
5. 检查 `apps/web` 的 embed 入口和子应用别名发现配置。
6. preload 变更需保证窗口配置中的 `preload` 与目录/包名一致。
7. 共享契约应放入 `packages/contracts`，共享 ambient 类型应放入 `packages/types`。
8. 运行对应包的 typecheck/test，并在提交前执行 [测试与质量](./testing.md) 中的检查。
