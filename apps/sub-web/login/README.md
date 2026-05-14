# @nebula-studio-renderer/login

**登录**子应用（Vue）。可作为 **Electron modal**（见 `app.config.ts` 的 `modalRenderers.login`）或 **Web embed** 加载。

## 入口

| 路径              | 说明                                           |
| ----------------- | ---------------------------------------------- |
| `src/main.ts`     | 生产入口；保持与仓库一致的 tailwind 全局链引入 |
| `src/dev/main.ts` | 仅本地独立 `vite dev` 使用                     |
| `vite.config.ts`  | 独立调试时的 Vite 配置                         |

## 脚本

见 [package.json](./package.json)。

## 改名 / 迁目录必查

- `apps/electron/app.config.ts` → `modalRenderers.login.renderer` 字段（当前为 **`login`** 即目录 `apps/sub-web/login`）。
- `boot.ts` glob 下是否存在 `apps/sub-web/login/src/main.ts`。
- `apps/web/src/embed/login-entry.ts` 及壳配置中的标识（若有硬编码字符串）。

## 相关

- [Monorepo 索引](../../../docs/monorepo.md)
