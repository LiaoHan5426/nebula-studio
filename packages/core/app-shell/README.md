# @nebula-studio/app-shell

**壳层运行时 SDK**：窗口/视图配置、认证会话、集成注册表，以及 `@nebula-studio/shell-protocol` 的兼容再导出。

登录 API（`loginWithBackendAuth` 等）从 `@nebula-studio/auth-provider/backend` 直接导入，不经本包再导出。

Web/Electron composition-root 适配器（`installWebPresentation`、`installShellHostBridge`）在 `@nebula-studio/shell-host`。

## 导出（稳定 API 面）

| 子路径 | 说明 |
| --- | --- |
| `.` | 聚合导出 |
| `./shell-config` | `shellPresentationConfig` 等，被 **`apps/electron/app.config.ts`** 与 Web 侧同源消费 |
| `./shell-integration` | 集成辅助 |

## 依赖关系

- 依赖 `@nebula-studio/shell-protocol` 与 `@nebula-studio/auth-provider`。
- **不**应反向依赖 `@nebula-studio/shell-host`、具体 Host 或 renderer 包，避免环。

## 恢复 / 迁移时注意

- 修改 **窗口键、壳布局字段** 时：更新 `configs/windows.json` 并重新生成配置，再检查 `apps/electron` 与 `apps/web` 的消费入口。
- 与 **preload 暴露的 `window.api` 形态** 相关的类型：仍在各 renderer 的 `env.d.ts` 中维护；通用常量见 `@nebula-studio/types`。

## 相关

- [Monorepo 索引](../../../docs/monorepo.md) · [Electron README](../../../apps/electron/README.md) · [Web README](../../../apps/web/README.md)
