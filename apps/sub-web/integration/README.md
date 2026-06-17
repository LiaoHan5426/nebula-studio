# Nebula 集成平台前端应用

基于 Nebula Camel 集成平台的前端管理界面，提供库表订阅、接口管理、连接器管理和数据源管理功能。

## 功能特性

### 库表订阅管理

- 支持三种订阅类型：CDC、轮询、触发器
- 订阅的创建、编辑、删除、暂停/恢复
- 实时查看订阅状态和配置信息

### 接口管理

- **原子接口**：单个接口的配置和管理
- **组合接口**：基于 BPMN 2.0 标准的流程编排
- 集成 BPMN 流程编辑器，支持可视化流程设计
- 接口的创建、编辑、删除、执行和测试

### 连接器管理

- 数据库连接器：MySQL、PostgreSQL、Oracle 等
- 协议连接器：HTTP、Kafka、FTP 等
- 连接器状态查看和连接测试

### 数据源管理

- 数据源的创建、编辑、删除
- 支持数据库和协议数据源
- 连接测试功能

## 技术栈

- **Vue 3**：渐进式 JavaScript 框架
- **TypeScript**：类型安全的 JavaScript 超集
- **Vue Router**：官方路由管理器
- **Pinia**：状态管理库
- **BPMN.js**：BPMN 2.0 流程编辑器
- **Nebula UI**：Nebula Studio 组件库
- **Nebula Flow Editor**：流程编辑器组件
- **Nebula Integration Panel**：集成面板组件

## 项目结构

```
integration/
├── src/
│   ├── types/           # TypeScript 类型定义
│   ├── services/        # API 服务层
│   ├── router/          # 路由配置
│   ├── views/           # 页面组件
│   ├── App.vue          # 主应用组件
│   └── main.ts          # 应用入口
├── index.html           # HTML 入口
├── package.json         # 项目配置
├── tsconfig.json        # TypeScript 配置
└── vite.config.ts       # Vite 配置
```

## 开发指南

### 安装依赖

```bash
vp i
```

### 启动开发服务器

```bash
vp dev
```

应用将在 `http://localhost:5174` 启动。

### 构建生产版本

```bash
vp build
```

## API 配置

应用默认代理 `/api` 请求到 `http://localhost:8080`，可在 `vite.config.ts` 中修改：

```typescript
server: {
  port: 5174,
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

## 页面路由

- `/` - 重定向到库表订阅页面
- `/subscriptions` - 库表订阅管理
- `/interfaces` - 接口管理
- `/connectors` - 连接器管理
- `/datasources` - 数据源管理

## 主题适配

应用完全适配 Nebula 主题系统，使用 `hsl(var(--primary))` 等主题变量，支持动态主题切换。

## 后端接口规范

前端应用基于以下后端接口规范：

- **库表订阅**：`/api/integration/subscriptions`
- **接口管理**：`/api/integration/interfaces`
- **连接器管理**：`/api/integration/connectors`
- **数据源管理**：`/api/integration/datasources`
- **租户管理**：`/api/integration/tenant`

详细接口定义请参考 [nebula-camel 技能文档](../../../2-back/nebula/.trae/skills/nebula-camel/SKILL.md)。

## 注意事项

1. 确保 Nebula UI、Nebula Flow Editor 和 Nebula Integration Panel 组件已正确安装
2. 后端服务需要在 `http://localhost:8080` 运行
3. BPMN 编辑器需要后端支持 BPMN XML 的保存和加载
4. 租户上下文需要在请求头中传递认证信息

## 许可证

MIT
