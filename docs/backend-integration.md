# 后端联调

前端仓库与相邻的 Nebula 后端仓库配合开发。当前过渡架构包含三个后端进程：Camel 运行时仍由 Console/Executor 承担，Platform Console 聚合平台域 API。

## 启动后端

以下命令分别在后端仓库中执行。三个服务都是常驻进程，应使用独立终端。

完整验收优先在 Studio 根目录运行：

```powershell
vp run test:e2e:real
```

该命令会先从相邻 `../nebula` 构建所需 Maven reactor，再启动三个正式 Platform 应用和 Web，执行在线契约差异检查与 Playwright。手工启动方式适合单服务排障。

### Platform Integration（8080）

```powershell
cd ..\nebula\nebula-platform\platform-integration
mvn spring-boot:run -DskipTests
```

### Platform Integration Executor（8081）

```powershell
cd ..\nebula\nebula-platform\platform-integration-executor
mvn spring-boot:run -DskipTests
```

### Platform Console（8090）

```powershell
cd ..\nebula\nebula-platform\platform-console
mvn spring-boot:run -DskipTests
```

三个正式应用默认需要可访问的 PostgreSQL。数据库配置、构建前置和 Flyway 说明见 `../nebula/docs/quick-start.md`。

> 当前实测状态（2026-08-01）：`vp run test:e2e:real` 已从停止状态构建并启动三个正式应用，健康、监控端点未认证 401、在线契约和无 Mock Playwright 均通过。失败日志仍保存在 `test-results/real-stack` 的分服务日志中；脚本只终止本次启动且进程所有权校验通过的服务，不清理复用的用户进程。

## 开发代理

Integration 独立开发服务器由 `defineNebulaSubAppConfig()` 读取窗口注册表的 `proxyPreset`，并通过 `createNebulaApiProxy()` 生成代理；匹配遵循从具体到通用的顺序。

| 前端路径 | 目标 | 说明 |
| --- | --- | --- |
| `/api/integration/gateway` | `http://localhost:8081` | Executor 网关调用 |
| `/api/integration/demo` | `http://localhost:8081` | Executor 兼容演示 API |
| `/api/executor` | `http://localhost:8081` | Executor 路由和状态 |
| `/api/system` | `http://localhost:8090` | 系统域 |
| `/api/platform` | `http://localhost:8090` | 平台聚合域 |
| `/api/security/governance` | `http://localhost:8090` | 安全治理 |
| `/api/version` | `http://localhost:8090` | 版本域 |
| `/api/release`、`/api/releases` | `http://localhost:8090` | 发布域 |
| 其余 `/api` | `http://localhost:8080` | Platform Integration、认证、租户、订阅、监控等 |

代理对包含 `/events` 的 SSE 请求关闭超时和响应缓冲。调整代理时要保留该行为，否则浏览器可能迟迟收不到事件。

Web、Electron 和 standalone 共享同一 API 实现：`configs/windows.json` 只保留可部署的 backend origin 与子应用 `proxyPreset`，浏览器 API namespace 和路由规则由 `internal/build-kit` 统一管理。子应用不再维护独立 `vite.proxy.ts`。

## 认证

认证状态由 `@nebula-studio/auth-provider` 统一维护：

- API 请求自动加入 `Authorization: Bearer <token>`；
- 非 `skipAuth` 请求收到 401 时，清理会话并通知宿主；
- 独立模式的受保护路由在没有有效 token 时跳转 `/login`；
- Web embed 和 Electron 模式通过 app-shell/bridge 同步认证。

demo 种子账号：

| 账号    | 密码         | 角色     |
| ------- | ------------ | -------- |
| `admin` | `[REDACTED]` | 管理员   |
| `demo`  | `[REDACTED]` | 普通用户 |

## 租户

当前租户 ID 保存在 `localStorage` 的 `tenant_id`。`@nebula-studio/api-client` 在未指定 `skipTenant` 时自动注入：

```http
X-Tenant-Id: <tenant-id>
```

Integration 的 `shared/composables/tenantCore` 负责加载当前用户租户、选择默认租户和切换租户。它是应用内能力；其他应用如需复用，必须先形成稳定的跨应用契约，不能复制另一套租户存储键。

演示租户为 `tenant-a`。网关演示服务需要 API Key 时，凭据值记为 `[REDACTED]`，请求头为 `X-API-Key`。

## API 响应与契约

- 通用请求和响应解析使用 `@nebula-studio/api-client`。
- 跨应用的请求/响应类型放在 `@nebula-studio/contracts`。
- 后端 OpenAPI 生成产物放在 contracts 的 generated 导出中，生成命令为 `vp run generate:contracts`。
- 应用自己的 `shared/api` 可以组合 endpoint，但不应复制公共契约。

后端业务语义以 `../nebula/docs` 为准，尤其是 `camel`、`platform`、`security`、`tenant`、`task`、`subscribe` 等目录。

## SSE

订阅事件由 Integration 的 `shared/composables/subscriptionEventsCore` 管理，默认连接 `/api/subscribe/camel` 下的事件端点，并携带当前认证信息。排障顺序：

1. 确认 Console `8080` 已启动；
2. 确认登录 token 有效且租户正确；
3. 在浏览器 Network 中确认响应类型为 `text/event-stream`；
4. 检查代理是否移除了 `content-length` 并禁用了缓冲；
5. 检查连接是否因页面卸载或认证清理被主动关闭。

## 快速排障

| 现象            | 优先检查                                            |
| --------------- | --------------------------------------------------- |
| 502             | 路径对应的 `8080`/`8081`/`8090` 服务是否启动        |
| 401             | token、登录服务和 `Authorization` 请求头            |
| 403             | 用户角色、资源授权、租户及 API Key                  |
| 数据为空        | `tenant_id` 与 `X-Tenant-Id` 是否一致               |
| SSE 立即断开    | Console、token、事件路径和代理缓冲配置              |
| 8090 启动即退出 | 查看 Platform 日志、数据库可用性和 Config JDBC 装配 |
