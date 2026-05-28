# @nebula-studio-internal/tailwind

**Tailwind CSS v4 工具包**：集中维护 **`theme.css`**（`@import 'tailwindcss'`、`@source`、`@theme`、插件）以及 **聚合样式入口** `./electron`。

## `electron` 入口顺序（勿颠倒）

`src/electron.ts` 当前为：

1. `./theme.css` — Tailwind 与扫描路径；
2. `import '@nebula-studio/styles'` — 语义色与基础样式（见 [styles README](../../packages/styles/README.md)）。

历史上曾使用单文件 `electron.css`；已拆分为 **theme（工具层） + styles（设计层）**，恢复旧结构时勿只迁回单文件而丢失顺序语义。

## 消费方

各 renderer / embed 的 `main.ts` 或宿主 boot：**`import '@nebula-studio-internal/tailwind/electron'`**。

## 迁移必查

- **`theme.css` 内 `@source` 相对路径**（相对 `tools/tailwindcss/src/` 指向仓库 `packages/`、`apps/`）。
- **Oxlint** `better-tailwindcss` 的 `entryPoint`（`tools/lint/oxlint` 内通过 `getPackageSync` 解析本包路径）。

## 相关

- [styles README](../../packages/styles/README.md) · [types README](../../packages/types/README.md) · [Monorepo 索引](../../docs/monorepo.md)
