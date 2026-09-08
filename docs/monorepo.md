# Monorepo 目录与包索引

Nebula Studio 使用 pnpm workspace 组织代码，日常命令统一通过 Vite+ CLI `vp` 执行。工作区 glob 和依赖版本 catalog 以根目录 `pnpm-workspace.yaml` 为准。

## 顶层目录

| 目录                    | 职责                                               |
| ----------------------- | -------------------------------------------------- |
| `apps/electron`         | Electron 主进程、窗口生命周期和 renderer 引导      |
| `apps/electron-preload` | 统一 preload 与受控的 Electron 能力桥接            |
| `apps/sub-web`          | 可独立运行、也可嵌入 Web/Electron 壳的 Vue 子应用  |
| `apps/web`              | Web 宿主和 embed 入口，开发端口 `5173`             |
| `configs`               | 窗口、展示方式及 API target 等单源配置             |
| `packages/core`         | 认证、API、运行时、租户等基础能力                  |
| `packages/testing`      | 测试夹具（MSW 等），不进入产品运行时路径           |
| `packages/editors`      | 代码、BPMN、DAG 和低代码编辑器                     |
| `packages/features`     | 可复用业务功能                                     |
| `packages/ui`           | UI 组件、布局和 Agent 界面能力                     |
| `internal`              | 仓库内部 Vite 与 Node 工具，不作为产品公共 API     |
| `tools`                 | 代码质量、TypeScript 和 Tailwind 配置              |
| `e2e`                   | Mock、体验、real-stack 与 Electron Playwright 验收 |
| `docs`                  | 仓库级开发文档                                     |

## 应用索引

| 路径 | 包名 | 说明 |
| --- | --- | --- |
| [`apps/electron`](../apps/electron/README.md) | `@nebula-studio/electron` | Electron 桌面宿主 |
| [`apps/web`](../apps/web/README.md) | `@nebula-studio/web` | Web/Electron 共用的 Host Workspace 与 Login composition |
| [`apps/sub-web/docs`](../apps/sub-web/docs/README.md) | `@nebula-studio-renderer/docs` | UI 组件文档子应用（Federation Remote） |
| [`apps/sub-web/integration`](../apps/sub-web/integration/README.md) | `@nebula-studio-renderer/integration` | 企业接口集成平台（Federation Remote） |
| [`apps/sub-web/settings`](../apps/sub-web/settings/README.md) | `@nebula-studio-renderer/settings` | 设置子应用（Federation Remote） |
| `apps/remotes/low-code-studio` | `@nebula-studio-renderer/low-code-studio` | 低代码设计器与大屏运行时（Federation Remote） |
| `apps/mf-poc-host` | `@nebula-studio/mf-poc-host` | 模块联邦概念验证与自动化测试沙箱 |

preload 实现集中在 `apps/electron-preload/src`。构建工具根据生成的窗口 manifest 创建虚拟入口，由 `unified.ts` 按窗口 ID 组装 `auth`、`notify`、`settings`、`shell` 等能力；不再为每个窗口维护独立包。

## 核心与契约包

| 路径 | 包名 | 职责 |
| --- | --- | --- |
| [`packages/contracts`](../packages/contracts/README.md) | `@nebula-studio/contracts` | auth、system、integration 及生成契约 |
| `packages/platform/api-client` | `@nebula-studio/api-client` | 请求头、响应解析、401 和进度处理 |
| [`packages/core/app-shell`](../packages/core/app-shell/README.md) | `@nebula-studio/app-shell` | 窗口配置、应用注册发现、认证 helper、协议再导出 |
| `packages/platform/shell-host` | `@nebula-studio/shell-host` | Web/Electron 壳适配（presentation stub、Host bridge 安装） |
| `packages/platform/shell-protocol` | `@nebula-studio/shell-protocol` | embed 消息、事件总线、presentation 标记（无 Host 实现） |
| `packages/platform/login-ui` | `@nebula-studio/login-ui` | 登录表单 UI（Host 与 standalone Remote 共用，非 renderer 包） |
| `packages/platform/auth` | `@nebula-studio/auth-provider` | 会话、适配器、Vue 注入及 `./bootstrap` 认证策略 |
| `packages/platform/i18n` | `@nebula-studio/i18n` | 平台国际化工厂、按需 locale chunk 加载与状态订阅 |
| `packages/platform/query` | `@nebula-studio/query` | 基于 Vue Query 的服务端状态与缓存管理 |
| `packages/platform/state` | `@nebula-studio/state` | 基于 Pinia 的客户端领域状态持久化与清理 |
| `packages/platform/storage` | `@nebula-studio/storage` | 统一的本地/会话存储抽象 |
| `packages/platform/host-capabilities` | `@nebula-studio/host-capabilities` | Host 向 Remote 注入的能力契约与实现 |
| `packages/platform/federation-protocol` | `@nebula-studio/federation-protocol` | 模块联邦协议契约与生命周期钩子 |
| [`packages/core/electron-shared`](../packages/core/electron-shared/README.md) | `@nebula-studio-electron/electron-bridge` | Electron/preload/renderer 桥接类型与实现 |
| [`packages/ui/shell-ui`](../packages/ui/shell-ui) | `@nebula-studio/nebula-shell` | Shell Vue 组件与生命周期（已移出 core） |
| `packages/testing/msw` | `@nebula-studio/msw` | 本地 Mock Service Worker handlers（非产品运行时） |
| `packages/platform/application-bootstrap` | `@nebula-studio/application-bootstrap` | 独立应用显式启动阶段与清理协议 |
| `packages/platform/application-runtime` | `@nebula-studio/application-runtime` | Federation 应用注册、加载和生命周期 |

## UI、低代码与编辑器包

| 分组 | 工作区成员 |
| --- | --- |
| UI 与样式 | `@nebula-studio/nebula-ui`、`@nebula-studio/nebula-layout`、`@nebula-studio/nebula-shell`、`@nebula-studio/tokens`、`@nebula-studio/nebula-assembly`、`@nebula-studio/nebula-agent`、`@nebula-studio/styles` |
| 低代码底座 | `@nebula-studio/low-code-compiler`（SFC 编译）、`@nebula-studio/low-code-contract`（低代码契约）、`@nebula-studio/low-code-kit` |
| 编辑器 | `@nebula-studio/nebula-code-editor`、`@nebula-studio/nebula-flow-editor`、`@nebula-studio/nebula-dag-editor`、`@nebula-studio/low-code-editor`、`@nebula-studio/low-code-form`、`@nebula-studio/nebula-integration-panel` |
| 基础类型 | `@nebula-studio/types` |

## 内部工具包

| 路径 | 包名 | 职责 |
| --- | --- | --- |
| `internal/build-kit` | `@nebula-studio-internal/build-kit` | Host/Remote Vite 配置、proxy、Electron adapter |
| `internal/node-kit` | `@nebula-studio-internal/node-kit` | 工作区枚举、`windows.json` 校验与生成制品、运行时地址漂移扫描（目录暂不改名） |

## 新增、移动或改名检查清单

1. 更新 `pnpm-workspace.yaml` 的工作区 glob（若现有 glob 未覆盖）。
2. 更新所有 workspace 依赖、源码导入和 README 链接。
3. 子应用变更需更新 `configs/windows.json`，再执行 `vp run generate:configs`。
4. 检查 `apps/electron/src/renderer/boot.ts`：Federation 走 `bootFederationRenderer`；工作台/登录走 Host boot，不再 glob `apps/sub-web/*/src/main.ts`。
5. 检查 `apps/web` 的 embed 入口和子应用别名发现配置。
6. preload 变更需同步检查 `configs/windows.json` 的 `preload`、`preloadCapabilities` 和能力工厂。
7. 共享契约应放入 `packages/contracts`，共享 ambient 类型应放入 `packages/types`。
8. 运行对应包的 typecheck/test，并在提交前执行 [测试与质量](./testing.md) 中的检查。
