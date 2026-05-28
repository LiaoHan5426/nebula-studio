# @nebula-studio-internal/vite

**内部 Vite 配置库**：统一 **纯 Web renderer** 与 **electron-vite**（renderer / main / preload）的插件、resolve、`define`、手动分包等。

## 主要导出（见 [package.json](./package.json)）

| 子路径 | 用途 |
| --- | --- |
| `.` | 聚合 `config` / `env` / `plugin` + `defineNebulaConfig` |
| `./config` | `createNebulaRendererViteConfig`、`nebulaRendererResolve`、chunk 规则装配等 |
| `./electron` | **`defineNebulaElectronViteConfig`**（electron-vite 三端合并） |
| `./plugin` | Nebula 相关 Vite 插件 |
| `./env` | `nebulaBuildNodeVersionDefine` 等 |

## 关键行为（恢复上下文）

- **`defineNebulaConfig`**（根 `defineNebulaConfig.ts`）：按 `platform: 'web' \| 'electron'` 分流；Electron 路径 **动态 `import('electron-vite')`**，避免 Web 包硬依赖。
- **Renderer 分包**：`src/config/chunks/` 下规则（含 `nebulaWorkspace.ts` 对 `packages/nebula-ui`、`packages/styles` 等路径的匹配）；**改包物理路径**时检查 chunk 规则是否仍命中。
- **Node 版本 define**：`nebulaBuildNodeVersionDefine()` 与各 renderer 约定 `__NEBULA_BUILD_NODE_VERSION__`（类型在 `@nebula-studio/types`）。

## peer 依赖

- `electron-vite`：声明为 **peer + optional**，仅 Electron 应用安装并解析。

## 开发本包

- `pnpm exec tsc --noEmit -p internal/vite/tsconfig.json`
- 修改后跑依赖方：`apps/electron`、`apps/web`、各 `apps/sub-web/*` 的 `vp build` / `vue-tsc`。

## 相关

- [Monorepo 索引](../../docs/monorepo.md) · [tsconfig preset](../../tools/tsconfig/README.md)
