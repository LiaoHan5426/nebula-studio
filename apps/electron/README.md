# @nebula-studio/electron

Electron **应用根包**：主进程、preload 与各 **Vue renderer** 的 **electron-vite** 构建入口。

## 职责边界

| 层次 | 位置 | 说明 |
| --- | --- | --- |
| 主进程 | `src/main/**` | 窗口、BrowserView、IPC、配置、日志等（细目见 [src/main/README.md](./src/main/README.md)） |
| Renderer 引导 | `src/renderer/boot.ts` | **唯一** HTML 入口；按 `?renderer=` 与 `app.config.ts` 动态 `import()` 各子包 `main.ts` |
| Renderer 样式 | `src/renderer/styles/electron-overrides.css` | **仅桌面** 的样式覆盖；全局设计链仍走 `@nebula-studio-internal/tailwind/electron`（在 `boot.ts` 首行引入） |
| 应用事实配置 | `app.config.ts` | 窗口、modal、preload 映射、`renderers` 目录名；注释内写明与 Web 壳同源字段来源 |

## 关键不变量（迁移必查）

1. **`app.config.ts` 与 `boot.ts` 必须一致**
   - `renderers`（相对 `apps/` 的子目录名，当前为 `sub-web`）与 `boot.ts` 中  
     `import.meta.glob('../../../sub-web/*/src/main.ts')`  
     的路径段一致。
   - `windows.*.renderer` / `modalRenderers.*.renderer` 的值必须是 **`apps/sub-web/<该目录>/src/main.ts` 存在的包目录名**。

2. **构建管线**
   - `package.json` → `build`：先全量 typecheck，再 `electron-vite build`，再构建文档包，最后 **`node ./scripts/copy-docs-site.mjs`** 把 `@nebula-studio-renderer/docs` 的 `dist` 拷到 `out/renderer/docs`。改文档包包名须同步脚本。

3. **Vite 配置**
   - `electron.vite.config.ts` → `@nebula-studio-internal/vite` 的 `defineNebulaConfig({ platform: 'electron' })`；preload 输入默认来自各 `@nebula-studio-preload/*` 包。

## 脚本（摘要）

| 脚本 | 作用 |
| --- | --- |
| `dev` / `start` | electron-vite 开发 / 预览 |
| `build` | typecheck + electron-vite build + docs build + copy-docs-site |
| `typecheck` | 主进程 tsc + renderer vue-tsc + `vp run --filter "@nebula-studio-renderer/*" typecheck` |
| `pack:*` | electron-builder 各平台 |

完整依赖与脚本见 [package.json](./package.json)。

## 相关文档

- [仓库根 README](../../README.md) · [Monorepo 索引](../../docs/monorepo.md)
- [主进程模块说明](./src/main/README.md)
