# 快速开始

## 环境要求

- Node.js `>= 22.12.0`（仓库 `.nvmrc` 提供推荐版本）
- Vite+ CLI，命令名为 `vp`
- Windows 桌面开发需要可用的 Electron 构建环境
- 联调需要 JDK 25+、Maven 3.9+ 和后端所需数据库

虽然根 `package.json` 保留 `pnpm@11.5.1` 的 `packageManager` 声明，但日常安装、脚本、检查和测试都使用 `vp`。

## 安装依赖

在 `nebula-studio` 根目录运行：

```powershell
vp install
```

若系统没有 `vp`，按 [Vite+ Getting Started](https://viteplus.dev/guide/) 安装并重新打开终端。

## 选择启动方式

### Web 宿主（推荐）

```powershell
vp run dev:web
```

访问 `http://localhost:5173`。Web 宿主加载主工作台，并以 embed 方式呈现配置中的子应用。这是验证跨子应用认证、主题和壳层集成的首选方式。

### Electron 桌面端

```powershell
vp run dev
```

该命令启动 Electron 主进程、preload 和 renderer。需要验证窗口生命周期、IPC、原生通知或打包行为时使用。

### Integration 子应用独立调试

```powershell
vp run --filter @nebula-studio-renderer/integration dev
```

访问 `http://localhost:5174`。独立模式使用 `apps/sub-web/integration/vite.proxy.ts` 连接本地后端，适合专注开发集成平台页面。

## 首次后端联调

完整的集成平台开发通常需要三个进程：

| 服务 | 默认端口 | 主要用途 |
| --- | --- | --- |
| `demo-camel-console` | `8080` | Camel Console、认证、租户、订阅、监控等 API |
| `demo-camel-executor` | `8081` | Executor 路由、网关和执行器 API |
| `platform-console` | `8090` | system、platform、治理、版本和发布聚合 API |

启动顺序、代理表和示例账号见 [后端联调](./backend-integration.md)。只开发不依赖 API 的壳层或组件时，可以不启动全部后端。

## 常用命令

| 命令               | 用途                          |
| ------------------ | ----------------------------- |
| `vp run dev`       | Electron 开发模式             |
| `vp run dev:web`   | Web 宿主开发模式              |
| `vp run build`     | 构建全部工作区                |
| `vp run build:web` | 仅构建 Web 宿主               |
| `vp check`         | Vite+ 格式化、lint 和类型检查 |
| `vp run test`      | 运行工作区单元测试            |
| `vp run test:e2e`  | 运行 Playwright E2E           |
| `vp run ready`     | 格式化、lint、测试和全量构建  |

## 常见问题

### 页面能打开但接口全部 502

先确认目标后端端口已监听，再对照 [代理分流表](./backend-integration.md#开发代理)。`/api/system` 等路径会去 `8090`，并非全部转发到 `8080`。

### 登录后仍跳回登录页

检查登录响应是否返回有效 token。前端会把长度小于 20 的空或占位 token 视为无效，并在受保护路由前清理会话。

### 请求没有租户信息

选择租户后，前端把租户 ID 存入 `localStorage` 的 `tenant_id`，API client 自动注入 `X-Tenant-Id`。清理浏览器存储后需要重新选择租户。
