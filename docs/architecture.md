# 整体架构

Nebula Studio 是一个基于 **Module Federation** 与 **Vite+**、同时面向 Electron 桌面端与 Web 浏览器的 Vue 3 工作区。架构核心原则是：Host 负责应用发现、远程加载、导航路由、全局认证与宿主能力注入，Remote 负责独立领域业务，两者通过标准能力契约与生命周期协议协同。

## 分层

```text
Web 宿主 (:5173) / Electron 桌面宿主
                  │
                  ▼（Module Federation 动态装载 / Host Capability 注入）
 Docs / Settings / Integration / Low-Code Studio 等 Federation Remote
                  │
                  ▼
 application-bootstrap / application-runtime / federation-protocol / host-capabilities
                  │
                  ▼
   UI (nebula-ui/tokens/shell-ui) / 编辑器 (editors/*) / 低代码运行时 (low-code/*) / 契约 (contracts/*)
                  │
                  ▼
 后端 Console :8080 / Executor :8088 / Platform :8090 / Low-Code Write :8092
```

## 宿主层（Host）

### Electron

`apps/electron` 管理主进程和窗口生命周期。renderer 使用统一引导机制：内置工作台与登录走 Host `bootHostWorkspace` / `bootHostLogin`，其余子应用统一经 runtime 走 Federation Remote 动态装载；`apps/electron-preload/*` 通过 contextIsolation 提供安全受控的 HostCapability 注入，Remote 业务组件不直接调用 Electron 内部 API。

### Web

`apps/web` 是浏览器宿主，开发端口为 `5173`。它内置 Workspace 与 Login 载荷，通过 Module Federation 动态装载 `integration`、`settings`、`docs`、`low-code-studio` 等 Remote，并向子应用注入标准的认证、主题、Locale 与导航 Capability。

## 配置体系

配置职责已拆分为单一职责配置文件：

- `configs/windows.json`：窗口 ID、renderer、preload 契约、显示名称、顺序与 presentation 配置；
- `configs/environments.json`：后端服务 origin 与 API targets 配置（console 8090、integration 8080、executor 8088、low-code-write 8092）；
- `configs/real-stack.json`：真实栈运行与健康检查配置；
- `configs/e2e.json`：E2E 测试套件配置。

运行 `vp run generate:configs` 后，配置被生成到 app-shell 与构建工具消费的文件中。严禁直接手改 `_generated-*` 文件。

当前核心应用关系：

| ID | 类型 | 路径/来源 | 用途 | 需要认证 |
| --- | --- | --- | --- | --- |
| `main` | **Host 内置** | `apps/web/src/workspace` | 工作台和应用集成壳（@nebula-host-boot/workspace） | 否 |
| `login` | **Host 内置** | `apps/web/src/auth` | 统一登录流认证面板（@nebula-host-boot/login） | 否 |
| `docs` | **Federation Remote** | `apps/sub-web/docs` | UI 组件文档与交互示例 | 否 |
| `settings` | **Federation Remote** | `apps/sub-web/settings` | 个人、组织与平台设置 | 是 |
| `integration` | **Federation Remote** | `apps/sub-web/integration` | 企业接口与 Camel 流程集成平台 | 是 |
| `low-code-studio` | **Federation Remote** | `apps/remotes/low-code-studio` | 低代码设计器与应用大屏运行态 | 是 |

## 子应用运行模式

`@nebula-studio/application-bootstrap`、`@nebula-studio/application-runtime` 与 `@nebula-studio/host-capabilities` 分别承担生命周期与能力注入：

- `standalone`：子应用由自身 Vite 服务直接运行，适合单包独立开发与隔离测试；
- `platform-embed`：子应用作为 Federation Remote 被 Web Host 动态装载，通过注入的 HostCapability 共享认证、主题和导航；
- `electron`：子应用运行在 Electron renderer 中，通过 Host 载荷与 preload bridge 消费桌面能力。

子应用统一通过 application-runtime 或 host-capabilities 获取能力，严禁用 URL 或全局 `window` 散落判断运行环境。

- `standalone`：子应用由自身 Vite 服务直接运行；
- `platform-embed`：子应用嵌入 Web 壳，通过壳桥接认证和导航；
- `electron`：子应用运行在 Electron renderer 中，通过 preload/bridge 使用宿主能力。

子应用应通过 application-runtime、app-shell 或 electron bridge 获取能力，避免用 URL 或全局对象散落判断运行环境。

## 状态与跨应用协作

- 认证会话由 `@nebula-studio/auth-provider` 统一管理，底层与 app-shell 的 session storage 协作。
- 租户选择当前是 Integration 应用内能力，当前租户键为 `tenant_id`。
- app-shell 提供事件总线和宿主 bridge，用于认证、租户、通知和视图状态同步。
- API 请求通过 `@nebula-studio/api-client` 统一注入认证/租户头并处理 401。
- SSE 订阅由 Integration 应用内 composable 管理连接、重连和错误状态。

## 依赖方向

推荐依赖方向为：

```text
apps → features/editors/ui → core → contracts/types/styles
```

`core` 包不能反向依赖具体 renderer；可复用契约不能在各应用的 `shared` 目录重复声明。Electron 专属能力必须通过 bridge 暴露，不能进入通用 UI 或业务包。

## 样式体系

样式基于 Tailwind CSS v4 与 `@nebula-studio/styles`。Host/standalone 引入 `@nebula-studio/styles/document`，Federation Remote 引入 `@nebula-studio/styles/remote`。仅 Electron 壳需要的覆盖放在 Electron renderer 的专用样式文件中。
