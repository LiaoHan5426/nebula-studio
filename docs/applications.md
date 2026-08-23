# 应用与功能

## 宿主应用

### Web 宿主

`apps/web` 提供浏览器壳、Host-owned Workspace/Login 和 Remote 加载入口。它从后端 registry 发现 `integration`、`settings`、`docs` 等应用，不再把 Frontend/Login 维护为独立 renderer 包。

### Electron 宿主

`apps/electron` 提供桌面主进程、renderer 引导、窗口管理、升级与打包。窗口到 renderer/preload 的映射来自 `configs/windows.json`，业务代码通过 electron bridge 使用原生能力。

## 子应用

| 子应用 | 路径 | 主要职责 | 可独立启动 |
| --- | --- | --- | --- |
| 工作台 | `apps/web/src/workspace` | 应用集成入口、壳层内容区和组织上下文 | Host 内置 |
| Integration | `apps/sub-web/integration` | 接口集成、治理、任务、订阅、监控等业务 | 是，默认 `5174` |
| Login | `apps/web/src/auth` + `packages/platform/login-ui` | Host 认证入口和共享登录 UI | Host 内置 |
| Settings | `apps/sub-web/settings` | 系统配置、用户与平台设置 | 是 |
| Docs | `apps/sub-web/docs` | Nebula UI 指南、组件说明和交互示例 | 是 |

Federation Remote 同时保留 application expose 与 standalone 入口；Workspace/Login 是 Host seed，不走 Remote，也不再维护重复 standalone renderer。

## Integration 功能地图

Integration 是当前主要业务子应用，路由位于 `apps/sub-web/integration/src/router/index.ts`。

| 功能域 | 主要路由 | 说明 |
| --- | --- | --- |
| 插件 | `/plugins/*`、`/plugins/market` | 数据库、协议、处理器、聚合、分发、转换插件与市场 |
| 租户 | `/tenant` | 租户列表、创建、启停及授权 |
| 服务 | `/service/register`、`/service/publish`、`/service/authorize` | 服务注册、发布和授权 |
| 审批与版本 | `/service/subscription-requests`、`/service/approvals`、`/service/releases`、`/service/versions` | 订阅审批、发布审批、发布记录和版本管理 |
| 治理与测试 | `/service/governance`、`/service/test` | 限流/熔断/白名单等治理以及网关调用 |
| 监控 | `/statistics/log-query`、`/statistics/log-stats`、`/statistics/topology` | 调用日志、统计和拓扑 |
| 数据集成 | `/datasources`、`/subscriptions` | 数据源与库表订阅 |
| 调度与集群 | `/tasks`、`/tasks/instances`、`/cluster/nodes` | 任务定义、实例和 Executor 节点 |
| 编排 | `/flows`、`/dag` | 流程定义和 DAG 编排 |
| 用户视角 | `/my-interfaces` | 当前用户可用服务 |
| Executor | `/executor/routes` | Executor 路由状态 |

除 `/login` 外，独立模式下路由默认要求有效认证会话。带 `requiresAdmin` 的页面还会进行平台管理员角色检查；嵌入壳时由宿主认证协作流程接管。

## 文档子应用与仓库文档

二者用途不同：

- `apps/sub-web/docs/src/docs` 记录 UI 组件安装、主题和使用方法，可嵌入产品；
- 仓库根 `docs` 记录开发、架构、联调和维护方式，不随产品文档站点发布。

新增 UI 组件时，公共 API 和示例应更新文档子应用；改变仓库工作流或架构时，应更新本目录。
