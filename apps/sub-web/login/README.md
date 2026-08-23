# @nebula-studio-renderer/login

**登录** standalone renderer。登录表单 UI 在 `@nebula-studio/login-ui`；Host `/?embed=login` 与 Electron 登录窗走 `bootHostLogin`，不调用本包 `boot`。

## 入口

| 路径              | 说明                       |
| ----------------- | -------------------------- |
| `src/main.ts`     | 仅 standalone `vite dev`   |
| `src/dev/main.ts` | 仅本地独立 `vite dev` 使用 |
| `vite.config.ts`  | 独立调试时的 Vite 配置     |

## 脚本

见 [package.json](./package.json)。

## 改名 / 迁目录必查

- `configs/windows.json` → `modalRenderers.login`（`renderer=login`，`webLoad=host`）。不要删 preload / Electron 登录窗映射。
- Electron 登录窗与 Web `/?embed=login` 走 Host `bootHostLogin(mode)`，不再 glob `apps/sub-web/login/src/main.ts`，也没有 `apps/web/src/embed/login-entry.ts`。

## 相关

- [Monorepo 索引](../../../docs/monorepo.md)
