# @nebula-studio/contracts

前后端契约类型定义。所有 renderer / package 必须从本模块导入，禁止在各自 `shared/` 内重复声明。

## 子模块

| 导出路径 | 范围 |
| --- | --- |
| `@nebula-studio/contracts/auth` | 认证域（登录、会话、组织切换） |
| `@nebula-studio/contracts/system` | 系统域（用户、角色、权限、组织、应用、日志） |
| `@nebula-studio/contracts/integration` | 集成域（接口、插件、连接器、资源、治理、流程、订阅、租户） |
| `@nebula-studio/contracts/generated` | Platform OpenAPI 生成类型的稳定 facade |

业务代码不得直接导入 `generated/platform-api.ts`。生成文件名和 OpenAPI operation 命名只允许在 `generated/facade.ts` 内出现，对外使用 `PlatformApiPaths`、`PlatformApiOperation` 以及 `GeneratedUser` / `GeneratedTaskCreateRequest` 等稳定 schema 别名。

`generated/api-namespaces.ts` 还包含 `GENERATED_API_TARGETS`、`GENERATED_STANDALONE_APPS` 与 `GENERATED_FEDERATION_DEV_ENTRIES`（来自 `windows.json`，由 `vp run generate:configs` 写出）。

**F1 首批迁移（2026-08-19）：** `packages/contracts/system` 与 `integration/task|flow|subscription` 经 `mappers.ts` 对齐 generated；Settings `configApi` 与 Integration `taskApi` / `subscription/api` 消费稳定路径。Auth、Camel-only DTO、governance/monitor 的 `Record<string, unknown>` 仍手写直至 OpenAPI 覆盖。

**新 API 门禁：** ESLint `contract-boundary` 禁止在 `apps/sub-web/**/shared/api` 与 `features/**/api.ts` 新增手写 `*Request`/`*Record` interface（auth 与遗留 governance/monitor 白名单除外）；CI 仍跑 `vp run check:generated`。

---

## DTO ↔ Controller 对照表

### auth（camel-console :8080）

| contract 类型 | 后端 Controller | REST 路径 | 归属 |
| --- | --- | --- | --- |
| `AuthMe` | `AuthRestController.me()` | `GET /api/auth/me` | camel-console |
| `BackendLoginResult` | `AuthRestController.login()` | `POST /api/auth/login` | camel-console |
| `AuthMode` | `AuthRestController.mode()` | `GET /api/auth/mode` | camel-console |
| `SwitchOrgResult` | `AuthRestController.switchOrg()` | `POST /api/auth/switch-org` | camel-console |
| `IntegrationLoginResult` | `AuthRestController.complete()` | `GET /api/auth/complete` | camel-console |
| `OrgPolicy` | `OrgPolicyRestService` | `/api/system/org-policy` | platform-console |

### system（platform-console :8090）

| contract 类型 | 后端 Controller | REST 路径 | 归属 |
| --- | --- | --- | --- |
| `UserRecord` / `UserInput` | `UserRestService` | `/api/system/users/**` | platform-console |
| `UserRecord` (角色关联) | `UserRoleRestService` | `/api/system/users/{id}/roles` | platform-console |
| `RoleRecord` | `RoleRestService` | `/api/system/roles/**` | platform-console |
| `PermissionNode` | `PermissionRestService` | `/api/system/permissions/**` | platform-console |
| `OrganizationNode` | `OrganizationRestService` | `/api/system/organizations/**` | platform-console |
| `ShellAppRecord` | `ShellAppRestService` | `/api/system/apps/**` | platform-console |
| `FrontendApplicationRecord` / `FrontendRuntimeEntry` | `FrontendApplicationRestService` | `/api/system/frontend-apps/**` | platform-integration `:8080`（Host 代理）/ platform-console；runtime DTO 经 `FrontendRuntimeEntryView` generated + mapper |
| `LogRecord` | `LogRestService` | `/api/system/logs/**` | platform-console |

### integration（camel-console :8080 / executor :8088）

| contract 类型 | 后端 Controller | REST 路径 | 归属 |
| --- | --- | --- | --- |
| `InterfaceDetail` | `InterfaceGatewayController` | `/api/integration/gateway/**` | executor |
| `ResourceDefinition` | `ResourceRestController` | `/api/resource/**` | platform-console |
| `GovernanceApprovalRequest` | `GovernanceRestController` | `/api/security/governance/**` | camel-console |
| `TaskDefinition` / `TaskCreateRequest` / `TaskUpdateRequest` | `TaskRestController` | `/api/task/**` | platform-console |
| `TableSubscription` / `CamelSubscriptionCreateRequest` / `SubscriptionRequestRecord` | `CamelSubscribeRestController` | `/api/subscribe/camel/**` | camel-console |
| — | `SubscribeRestController` | `/api/subscribe/**` | platform-console |
| `CamelTopologyData` / `TopologyTrace` / `TopologyError` | `TopologyRestController` | `/api/camel/topology/**` | camel-console |
| `PluginRecord` / `PluginCatalogItem` | `PluginRestController` / `PluginCatalogRestController` | `/api/console/plugin/**` | camel-console |
| — | `DagRestController` | `/api/console/dag/**` | camel-console |
| — | `TenantRestController` | `/api/console/tenant/**` | camel-console |
| — | `TaskExecutionController` | `/api/executor/task/**` | executor |
| — | `DagExecutionController` | `/api/executor/dag/**` | executor |
| — | `ReleaseRestController` | `/api/release/**` | platform-console |

### 其他

| 后端 Controller         | REST 路径              | 归属             |
| ----------------------- | ---------------------- | ---------------- |
| `ConfigRestService`     | `/api/config/**`       | platform-console |
| `FileRestService`       | `/api/files/**`        | platform-console |
| `MonitorRestController` | `/api/monitor/**`      | camel-console    |
| `HealthController`      | `/api/platform/health` | platform-console |
| `AdminHealthController` | `/api/admin/health`    | platform-admin   |
| `VersionRestController` | `/api/version`         | camel-console    |

---

## Proxy 路由（dev）

| 路径前缀                      | 目标                    | 说明             |
| ----------------------------- | ----------------------- | ---------------- |
| `/api/system/**`              | `http://localhost:8090` | platform-console |
| `/api/integration/gateway/**` | `http://localhost:8088` | executor         |
| `/api/integration/demo/**`    | `http://localhost:8088` | executor         |
| `/api/executor/**`            | `http://localhost:8088` | executor         |
| `/api/**` (其余)              | `http://localhost:8080` | camel-console    |

> 权威源：`configs/windows.json` 只配置 `apiTargets`（后端 origin）；浏览器路径前缀与 Vite 代理路由来自 `internal/vite` API context 黑盒。调用形态为 `GENERATED_API_NAMESPACES.<target>.<name>`，例如 `GENERATED_API_NAMESPACES.platform.system`。
