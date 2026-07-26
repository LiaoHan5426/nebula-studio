# @nebula-studio/app-shell

**壳层集成**：为 **Electron** 与 **Web** 提供同一套「窗口/视图布局、认证、通知、主题」等配置与桥接实现。

## 导出（稳定 API 面）

| 子路径 | 说明 |
| --- | --- |
| `.` | 聚合导出 |
| `./shell-config` | `shellPresentationConfig` 等，被 **`apps/electron/app.config.ts`** 与 Web 侧同源消费 |
| `./shell-integration` | 集成辅助 |

## 依赖关系

- 依赖 `@nebula-studio-electron/electron-bridge`（包含 `./vue` 子路径）提供类型与运行时桥。
- **不**应反向依赖具体 renderer 包（`@nebula-studio-renderer/*`），避免环。

## 恢复 / 迁移时注意

- 修改 **窗口键、壳布局字段** 时：更新 `configs/windows.json` 并重新生成配置，再检查 `apps/electron` 与 `apps/web` 的消费入口。
- 与 **preload 暴露的 `window.api` 形态** 相关的类型：仍在各 renderer 的 `env.d.ts` 中维护；通用常量见 `@nebula-studio/types`。

## 相关

- [Monorepo 索引](../../../docs/monorepo.md) · [Electron README](../../../apps/electron/README.md) · [Web README](../../../apps/web/README.md)
