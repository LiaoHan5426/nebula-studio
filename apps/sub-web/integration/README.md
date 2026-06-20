# Nebula 集成平台 Demo

基于 Nebula Camel 集成后端的完整前端 Demo，覆盖连接器、数据源、库表订阅（SSE）、接口编排、流程定义与网关鉴权。

## 技术栈

- Vue 3 + TypeScript（`<script setup>`）
- Vue Router（懒加载 feature 页面）
- Nebula UI（NebulaPane、NebulaButton、NebulaTag、NebulaTable）
- Nebula Flow Editor（BPMN 2.0）

## 项目结构

```
integration/
├── src/
│   ├── app/              # AppLayout、AppHeader
│   ├── features/         # 按功能划分的页面
│   ├── shared/
│   │   ├── api/          # client、integration、flows、auth
│   │   ├── composables/  # useAuth、useTenant、useSubscriptionEvents
│   │   └── types/
│   ├── router/
│   ├── App.vue
│   └── main.ts
├── vite.config.ts
└── package.json
```

## 开发环境

### 前置条件

1. 后端 `demo-camel-integration` 运行在 **http://localhost:8080**
2. 已安装 monorepo 依赖

### 安装依赖（Web 壳，推荐）

完整 `vp i` 会执行 Electron 原生依赖编译，耗时长且易看似「卡住」。仅开发 Web 集成 Demo 时：

```bash
# 在 nebula-studio 根目录
vp run install:web
```

等价于 `pnpm install --ignore-scripts` + 工具链 stub，跳过 Electron postinstall。

若需 Electron 桌面端，再执行完整 `vp i` 并等待数分钟。

### 启动（Web 壳）

在 **nebula-studio 根目录**：

```bash
vp run dev:web
```

浏览器打开 **http://localhost:5173**，侧边栏进入「应用集成」→ 点击「集成平台」 tile。

`/api` 已在 `apps/web/vite.config.ts` 代理到 `http://localhost:8080`。

### 独立启动（可选）

```bash
cd apps/sub-web/integration
vp dev
```

前端 **http://localhost:5174**（integration 子应用自带 proxy）。

### 类型检查

```bash
vp typecheck
```

### 构建

```bash
vp build
```

## API 端点

| 模块 | 前缀 |
| --- | --- |
| 集成（订阅/接口/连接器/数据源/租户） | `/api/integration` |
| 流程定义 | `/api/flows` |
| 登录 | `POST /api/auth/login` |
| 网关 | `/api/integration/gateway/{tenantId}/...` |
| 订阅 SSE | `GET /api/integration/subscriptions/{id}/events` |

请求头自动注入：

- `Authorization: Bearer {auth_token}`（localStorage）
- `X-Tenant-Id: {tenant_id}`（localStorage）

## 路由

| 路径                | 页面                              |
| ------------------- | --------------------------------- |
| `/plugins/database` | 数据库适配插件 + 已激活连接器测试 |
| `/plugins/protocol` | 协议插件 + 已激活连接器测试       |
| `/connectors`       | 重定向至 `/plugins/database`      |
| `/datasources`      | 数据源 CRUD                       |
| `/subscriptions`    | 订阅管理与 SSE 事件面板           |
| `/interfaces`       | 原子/组合接口与 BPMN 编辑器       |
| `/flows`            | 流程列表与设计                    |
| `/gateway`          | 网关鉴权演示                      |

## 七场景 Demo 脚本

> 启动后端与前端后，按顺序操作以验证完整集成链路。

### 场景 1：登录与租户切换

1. 打开 http://localhost:5174
2. 点击右上角 **登录**，用户名 `demo`，提交
3. 在 Header 租户下拉框切换 **tenant-a** ↔ **tenant-b**
4. 观察各列表数据随租户隔离变化

### 场景 2：插件与连接器测试

1. 进入 **插件管理 → 数据库适配插件**
2. 在「已激活数据库连接器」区域选择 `postgresql-connector`（或 seed 中的连接器）
3. 点击 **测试连接**，填写 PostgreSQL 连接参数并验证

### 场景 3：数据源 CRUD

1. 进入 **数据源**
2. **新建数据源**，从下拉选择连接器，填写连接信息
3. **测试** 连接，**编辑** 名称后 **保存**

### 场景 4：库表订阅与 SSE

1. 进入 **库表订阅**
2. **新建订阅**：数据源选 demo PG，表名 `demo_orders`，类型 **轮询**
3. 对订阅点击 **激活**，再点击 **监听事件**
4. 在后端触发 demo 表变更（或等待轮询），SSE 面板应收到事件

### 场景 5：原子接口

1. 进入 **接口管理** → **原子** Tab
2. **新建原子接口**：端点 `/orders/query`，认证 **API_KEY**
3. **执行** 接口或在场景 7 通过网关调用

### 场景 6：组合接口与 BPMN

1. **接口管理** → **组合** Tab → **新建组合接口**
2. 填写元数据后进入 **BPMN 流程编辑器**，拖拽编排并 **保存流程**

### 场景 7：流程定义与网关

1. 进入 **流程定义**，**新建流程** → **设计** → 保存 BPMN → **发布**
2. 进入 **网关演示**
3. 路径 `/orders/query`，方法 GET，填写 `X-API-Key: demo-api-key-tenant-a`
4. **发送请求**，验证 JWT / API Key / 租户头鉴权与响应

## 许可证

MIT
