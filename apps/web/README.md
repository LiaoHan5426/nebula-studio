# @nebula-studio/web

**Web 宿主**：与 Electron 侧共享同一套 **壳配置与集成**（`@nebula-studio/app-shell`），通过 Vite 多入口构建壳页与各 **embed** 子应用。

## 入口文件（勿随意改名）

| 文件 | 用途 |
| --- | --- |
| `src/shell-entry.ts` | Web 壳主入口 |
| `src/web-boot.ts` | Web 侧启动/引导相关逻辑（与壳配合） |
| `src/embed/*-entry.ts` | 各子应用 **独立 chunk** 的入口（如 docs / login / settings）；与 Electron 内嵌 URL 策略对齐时需同时查 `app-shell` |

## 职责边界

- **不包含** Electron 主进程；不引用 `electron` API 的代码应通过 `@nebula-studio/app-shell` 的 web 桥接访问宿主能力。
- 全局样式：与 renderer 一致，侧效入口通常为 `@nebula-studio-internal/tailwind/electron`（见各 embed 的 `main` 或入口 ts）。

## 脚本

见 [package.json](./package.json)（`dev`、`build` 等）。

## 迁移 / 恢复时核对

- 新增 embed 入口：同步 **根** `vite.config.ts`（若有多包聚合）、本包 `vite.config.ts` 的 `build.rollupOptions.input`，以及 `app-shell` 中 Web 与壳相关的路由/配置。
- 子应用 **npm 包名** 与路径变更：更新 [docs/monorepo.md](../../docs/monorepo.md) 索引表（可选但推荐）。

## 相关文档

- [Monorepo 索引](../../docs/monorepo.md) · [app-shell README](../../packages/app-shell/README.md)
