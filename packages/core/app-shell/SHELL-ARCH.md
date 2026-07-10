# Shell 架构说明

## 包职责

| 包 | 职责 |
| --- | --- |
| `@nebula-studio/app-shell` | Shell 运行时 SDK：子应用嵌入、事件总线、认证桥接 |
| `apps/web/src/shell-entry.ts` | Web 宿主入口，加载子应用 |
| `apps/sub-web/*` | 独立子应用（integration、settings、login 等） |

## 跨子应用状态

- **认证/租户**：通过 `createEventBus()` 广播 `tenant:changed`、`auth:logout`
- **业务状态**：各子应用内部管理，不共享 Pinia store
- **注入方式**：子应用 `boot.ts` 接收 `shellEventBus` 参数

## 事件约定

```typescript
import { createEventBus } from '@nebula-studio/app-shell';

const bus = createEventBus();
bus.on('tenant:changed', ({ tenantId }) => {
  /* refresh */
});
bus.emit('tenant:changed', { tenantId: 'tenant-a' });
```
