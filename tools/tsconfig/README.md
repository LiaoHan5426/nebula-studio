# @nebula-studio-internal/tsconfig

**共享 TypeScript 配置 preset**（仅 JSON，无构建步骤）。

## 文件一览

| 文件 | 用途 |
| --- | --- |
| `base.json` | 严格性与模块基础 |
| `web.json` | 前端 / renderer：`types` 含 **`vite/client`** 与 **`@nebula-studio/types`**（ambient 单一入口） |
| `web-app.json` | 在 `web.json` 之上；已与 web 对齐注入 `@nebula-studio/types` |
| `node.json` | Node 工具脚本、无 DOM |
| `library.json` | 需要 `declaration` 的内部库（如部分 `internal/*`） |

## 修改 `web.json` 时必查

- 所有 `extends` 该文件的 **`vue-tsc` / `tsc`** 是否仍能通过（尤其 `types` 数组增减会影响全局声明可见性）。

## 相关

- [@nebula-studio/types README](../../packages/types/README.md) · [Monorepo 索引](../../docs/monorepo.md)
