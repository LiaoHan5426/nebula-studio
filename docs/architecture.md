# 整体架构

Nebula Studio 是一个同时面向 Electron 与浏览器的 Vue 3 monorepo。核心原则是：子应用尽量保持宿主无关，Web 与 Electron 通过统一的 app-shell 和 runtime 接入认证、布局、通知及主题能力。

## 分层

```text
Electron 主进程 / Web 宿主
            │
            ▼
  app-shell + nebula-shell
            │
            ▼
 docs / login / settings / integration 等子应用
            │
            ▼
 runtime / auth / api-client / tenant / sse-events
            │
            ▼
 UI、编辑器、功能包、contracts
            │
            ▼
 后端 Console :8080 / Executor :8081 / Platform :8090
```

## 宿主层

### Electron

`apps/electron` 管理主进程和窗口生命周期。renderer 使用共同的引导入口，根据窗口配置加载 `apps/sub-web/*/src/main.ts`；`apps/electron-preload/*` 只暴露声明过的能力，业务 renderer 不直接依赖 Electron API。

### Web

`apps/web` 是浏览器宿主，开发端口为 `5173`。它通过 Vite 的子应用发现和别名插件加载 `frontend`、`integration`、`login`、`settings`、`docs`，并复用 `@nebula-studio/app-shell` 的展示与认证约定。

## 配置单源

`configs/windows.json` 定义：

- 窗口 ID、renderer 和 preload 对应关系；
- 显示名称、顺序、是否可集成及是否要求认证；
- Electron 内嵌展示方式；
- API base 与本地开发 target。

运行 `vp run generate:configs` 后，配置被生成到 app-shell 等消费者使用的文件中。不要直接手改 `_generated-*` 文件。

当前窗口/子应用关系：

| ID            | renderer      | 用途               | 需要认证 |
| ------------- | ------------- | ------------------ | -------- |
| `main`        | `frontend`    | 工作台和应用集成壳 | 否       |
| `docs`        | `docs`        | UI 文档            | 否       |
| `settings`    | `settings`    | 设置               | 是       |
| `integration` | `integration` | 集成平台           | 是       |
| `login`       | `login`       | 模态登录应用       | 否       |

## 子应用运行模式

`@nebula-studio/runtime` 和 `@nebula-studio/auth` 将运行环境归一为三种模式：

- `standalone`：子应用由自身 Vite 服务直接运行；
- `platform-embed`：子应用嵌入 Web 壳，通过壳桥接认证和导航；
- `electron`：子应用运行在 Electron renderer 中，通过 preload/bridge 使用宿主能力。

子应用应通过 runtime、app-shell 或 electron bridge 获取能力，避免用 URL 或全局对象散落判断运行环境。

## 状态与跨应用协作

- 认证会话由 `@nebula-studio/auth-provider` 统一管理，底层与 app-shell 的 session storage 协作。
- 租户选择由 `@nebula-studio/tenant` 管理，当前租户键为 `tenant_id`。
- app-shell 提供事件总线和宿主 bridge，用于认证、租户、通知和视图状态同步。
- API 请求通过 `@nebula-studio/api-client` 统一注入认证/租户头并处理 401。
- SSE 订阅通过 `@nebula-studio/sse-events` 管理连接、重连和错误状态。

## 依赖方向

推荐依赖方向为：

```text
apps → features/editors/ui → core → contracts/types/styles
```

`core` 包不能反向依赖具体 renderer；可复用契约不能在各应用的 `shared` 目录重复声明。Electron 专属能力必须通过 bridge 暴露，不能进入通用 UI 或业务包。

## 样式体系

样式基于 Tailwind CSS v4 与 `@nebula-studio/styles` 的设计 token。renderer 通常引入 `@nebula-studio-internal/tailwind/electron` 作为统一入口；仅 Electron 壳需要的覆盖放在 Electron renderer 的专用样式文件中。
