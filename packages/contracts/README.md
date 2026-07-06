# @nebula-studio/contracts

前后端契约类型定义。所有 renderer / package 必须从本模块导入，禁止在各自 `shared/` 内重复声明。

## 子模块

| 导出路径 | 范围 |
| --- | --- |
| `@nebula-studio/contracts/auth` | 认证域（登录、会话、组织切换） |
| `@nebula-studio/contracts/system` | 系统域（用户、角色、权限、组织、应用、日志） |
| `@nebula-studio/contracts/integration` | 集成域（接口、连接器、资源、治理、流程、订阅、租户） |

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
| `LogRecord` | `LogRestService` | `/api/system/logs/**` | platform-console |

### integration（camel-console :8080 / executor :8081）

| contract 类型 | 后端 Controller | REST 路径 | 归属 |
| --- | --- | --- | --- |
| `InterfaceDetail` | `InterfaceGatewayController` | `/api/integration/gateway/**` | executor |
| `ResourceDefinition` | `ResourceRestController` | `/api/resource/**` | platform-console |
| `GovernanceApprovalRequest` | `GovernanceRestController` | `/api/security/governance/**` | camel-console |
| `TaskDefinition` / `TaskCreateRequest` / `TaskUpdateRequest` | `TaskRestController` | `/api/task/**` | platform-console |
| `TableSubscription` / `CamelSubscriptionCreateRequest` / `SubscriptionRequestRecord` | `CamelSubscribeRestController` | `/api/subscribe/camel/**` | camel-console |
| — | `SubscribeRestController` | `/api/subscribe/**` | platform-console |
| `CamelTopologyData` / `TopologyTrace` / `TopologyError` | `TopologyRestController` | `/api/camel/topology/**` | camel-console |
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
| `/api/integration/gateway/**` | `http://localhost:8081` | executor         |
| `/api/integration/demo/**`    | `http://localhost:8081` | executor         |
| `/api/executor/**`            | `http://localhost:8081` | executor         |
| `/api/**` (其余)              | `http://localhost:8080` | camel-console    |

> 权威源：`configs/windows.json` → `apiBases` + `apiTargets`；各子应用 `vite.proxy.ts` 定义代理路由
