# Nebula Studio Core Shell 架构

`packages/core` 承载跨子应用的壳层 SDK，职责划分如下。

## 包职责

| 包 | npm 名 | 职责 |
| --- | --- | --- |
| `app-shell` | `@nebula-studio/app-shell` | Shell 运行时 SDK：嵌入协议、事件总线、认证桥接、窗口 manifest |
| `shell` | `@nebula-studio/nebula-shell` | Shell UI 组合式函数与组件（OrgSwitcher、AppDock、IframeHost） |
| `runtime` | `@nebula-studio/runtime` | 微应用统一启动（`bootMicroApp`）、运行模式检测 |
| `tenant` | `@nebula-studio/tenant` | 租户状态 composable（`createUseTenant`） |
| `auth` / `auth-provider` | `@nebula-studio/auth` | 认证引导与 session 提供 |

> **命名说明**：`shell` 包保留现有包名（重命名为 `shell-composables` 影响面过大）。UI 组合逻辑在 `shell`，运行时协议在 `app-shell`。

## 启动链路

```
apps/web/shell-entry.ts
  → frontend/boot.ts（创建 shellEventBus，注册集成应用）
    → bootMicroApp（runtime）
      → installWebPresentation（app-shell）
      → AuthBootstrap（auth）
      → bootSubApp（electron-shared）

apps/sub-web/integration/boot.ts
  → resolveShellEventBus（继承宿主总线）
  → bootMicroApp + 事件监听（tenant:changed / auth:logout）
```

## 跨子应用状态

- **认证 / 租户**：`createEventBus()` 广播 `tenant:changed`、`auth:logout`
- **业务状态**：各子应用内部管理，不共享 Pinia store
- **注入方式**：子应用 `boot.ts` 接收 `shellEventBus`；iframe 嵌入时通过 `window.__NEBULA_SHELL_EVENT_BUS__` 共享同一总线

## 事件约定

```typescript
import { createEventBus, resolveShellEventBus } from '@nebula-studio/app-shell';

const bus = resolveShellEventBus();
bus.on('tenant:changed', ({ tenantId }) => {
  /* refresh data */
});
bus.emit('tenant:changed', { tenantId: 'tenant-a' });
bus.emit('auth:logout', { reason: 'session-expired' });
```

## API 基座（W12 / G7）

权威配置：`configs/windows.json` → `apiBases` + `apiTargets`。

- `apiBases.platform` → `/api/platform`（前端相对路径）
- `apiTargets.platform` → `http://localhost:8090`（Vite 代理目标）
- settings / system 类 API 走 platform-console（`:8090`），Camel 域 API 仍走 demo console（`:8080`）

详见 `packages/core/app-shell/SHELL-ARCH.md` 获取 app-shell 侧细节。
