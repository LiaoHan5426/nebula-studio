# @nebula-studio-internal/oxfmt

**Oxfmt 共享配置**：`src/index.ts` 导出 `defineConfig` 结果；经 **`vp pack`** 写入 **`dist/`**，由根 [vite.config.ts](../../../vite.config.ts) 的 `fmt` 段合并。

## 脚本

- `stub` / `build`：`vp pack`
- `check`：`vp check`

## 相关

- [oxlint README](../oxlint/README.md) · [Monorepo 索引](../../../docs/monorepo.md)
