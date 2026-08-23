# Nebula Studio Core Shell 架构

`packages/core` 承载跨子应用的壳层 SDK；Shell **Vue UI** 已迁到 `packages/ui/shell-ui`（包名仍为 `@nebula-studio/nebula-shell`）。

## 包职责

| 包 | npm 名 | 职责 |
| --- | --- | --- |
| `app-shell` | `@nebula-studio/app-shell` | Shell 运行时 SDK：嵌入协议再导出、认证桥接、窗口 manifest、集成注册表 |
| `shell-host` | `@nebula-studio/shell-host` | Web/Electron composition-root 适配：presentation stub、`installShellHostBridge` |
| `shell-protocol` | `@nebula-studio/shell-protocol` | 无宿主假设的 embed 消息、事件总线、presentation 标记、runtime mode |
| `shell`（`packages/ui/shell-ui`） | `@nebula-studio/nebula-shell` | Shell UI 组合式函数与组件（OrgSwitcher、AppDock、IframeHost） |
| application bootstrap | `@nebula-studio/application-bootstrap` | standalone / Host 显式生命周期；运行模式类型在 `shell-protocol` |
| `tenant` | `@nebula-studio/tenant` | 租户状态 composable（`createUseTenant`） |
| `auth` / `auth-provider` | `@nebula-studio/auth` | 认证引导与 session 提供 |

> **命名说明**：`shell` 包保留现有包名。UI 组合逻辑在 `shell-ui`，无宿主协议在 `shell-protocol`，Web/Electron 适配在 `shell-host`，由 Host/standalone boot 注入。`app-shell` 不反向依赖 `shell-host`。

## 启动链路

```
apps/web/src/workspace/bootHostWorkspace.ts
  → installShellHostBridge + installWebPresentation（shell-host；Web 只装 window.api）
  → startApplication（application-bootstrap）挂载 frontend/app
    → AuthBootstrap（auth）

apps/sub-web/frontend/src/boot.ts（standalone）
  → main.ts 显式 mode: 'standalone'

apps/sub-web/integration/boot.ts
  → resolveShellEventBus（继承宿主总线）
  → startApplication + 事件监听（tenant:changed / auth:logout）
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

权威配置：`configs/environments.json` 配置 `apiTargets`（后端 origin），`configs/windows.json` 只描述 Shell/Electron 窗口。浏览器相对路径按 target 分组，来自 API context 黑盒。

- `GENERATED_API_NAMESPACES.platform.platform` → `/api/platform`
- `GENERATED_API_TARGETS.platform` → `http://localhost:8090`
- settings / system 类 API 走 platform-console（`:8090`），Camel 域 API 仍走 demo console（`:8080`）

详见 `packages/core/app-shell/SHELL-ARCH.md` 获取 app-shell 侧细节。
