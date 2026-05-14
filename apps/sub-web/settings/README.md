# @nebula-studio-renderer/settings

**设置**子应用（Vue）。Electron 内嵌窗口或 Web embed；与 `@nebula-studio-preload/settings` 配对。

## 入口

| 路径              | 说明            |
| ----------------- | --------------- |
| `src/main.ts`     | 生产入口        |
| `src/dev/main.ts` | 独立 `vite dev` |
| `vite.config.ts`  | 独立调试配置    |

## 脚本

见 [package.json](./package.json)。

## 改名 / 迁目录必查

- `app.config.ts` 中对应窗口的 `preload` / `renderer` 字段与 **preload 包** `apps/electron-preload/settings` 一致。
- `boot.ts` 与 `apps/sub-web/settings/src/main.ts` 存在性。

## 相关

- [Monorepo 索引](../../../docs/monorepo.md) · [preload settings](../../electron-preload/settings/README.md)
