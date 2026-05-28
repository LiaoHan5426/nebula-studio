# @nebula-studio-renderer/docs

**组件与 API 文档站**（Vue）。产出静态资源后可被 **Electron** 拷贝到 `out/renderer/docs`（见 `apps/electron` 的 `build` 与 `scripts/copy-docs-site.mjs`），也可被 **Web embed** 加载。

## 入口与配置

| 路径 | 说明 |
| --- | --- |
| `src/main.ts` | Renderer 入口；须含 `@nebula-studio-internal/tailwind/electron`（或与宿主一致的样式链） |
| `vite.config.ts` | `build.base` 默认 **`/docs/`**（与路由/部署路径一致）；勿与 Electron 拷贝目标硬编码混淆 |
| `src/env.d.ts` | **仅**放本应用特有的 `Window` / preload 类型；通用 ambient 见 `@nebula-studio/types` |
| `src/components/` | 文档站 **专用** Vue 组件（`Docs*.vue` 平铺，见 [README](./src/components/README.md)） |

## 脚本

| 脚本              | 说明                                |
| ----------------- | ----------------------------------- |
| `dev` / `preview` | 本地开发与预览                      |
| `build`           | 生产构建（`--base=/docs/`）         |
| `build:web`       | 无 `/docs/` base 的构建变体（按需） |
| `typecheck`       | `vue-tsc`                           |

## 改名 / 迁目录必查

- **`package.json` 的 `name`**：`copy-docs-site.mjs` 使用 **`@nebula-studio-renderer/docs`** 解析 `dist` 路径。
- **`src/components/`**：自各 feature 用相对路径 `import`（不设 `@components` 别名，与 Electron 内嵌构建一致）。
- [docs/monorepo.md](../../../docs/monorepo.md) 索引表。

## 相关

- [Monorepo 索引](../../../docs/monorepo.md) · [app-shell](../../../packages/app-shell/README.md)
