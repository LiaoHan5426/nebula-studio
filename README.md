# Nebula Studio

基于 **pnpm workspace** 的 monorepo：**Electron 桌面壳**、**Web 多页宿主**、多 **Vue renderer 子应用**（`apps/sub-web/*`）与共享库（`packages/*`）。

## 文档入口

| 文档 | 用途 |
| --- | --- |
| [docs/README.md](docs/README.md) | 文档目录 |
| [docs/monorepo.md](docs/monorepo.md) | **包索引 + 迁移/改名核对清单**（恢复上下文时优先读） |

## 架构速览（恢复上下文）

1. **Electron**（`apps/electron`）：主进程创建窗口；**单一** `index.html` + `src/renderer/boot.ts`，用 `?renderer=` 加载 `app.config.ts` 里声明的各子包 `main.ts`；preload 来自 `apps/electron-preload/*`。
2. **Web**（`apps/web`）：壳与 embed 入口（`src/shell-entry.ts`、`src/embed/*-entry.ts`），与 `@nebula-studio/app-shell` 的 Web 路径对齐。
3. **全局样式链**：业务侧统一 `import '@nebula-studio-internal/tailwind/electron'` → 内部顺序为 `theme.css`（Tailwind v4）→ `@nebula-studio/styles`（语义色/基础样式）；**仅 Electron** 的覆盖放在 `apps/electron/src/renderer/styles/electron-overrides.css` 并由 `boot.ts` 引入。
4. **类型补洞**：`@nebula-studio/types` 经 `tools/tsconfig/web.json` 的 `compilerOptions.types` 注入各 renderer；**勿**在多个 `env.d.ts` 重复声明同一 ambient 模块（见该包 README）。

## 约定

- **命令**：日常用 **`vp`**（Vite+），仓库脚本不写裸 `pnpm run` / `npm run`（见各 CI / `.vscode` 说明）。[Vite+ 文档](https://viteplus.dev/guide/)
- **工作区边界**：包名单与路径见 [pnpm-workspace.yaml](pnpm-workspace.yaml)；catalog 版本见同文件 `catalogs`。
- **根工具链配置**：根目录 [vite.config.ts](vite.config.ts)（`vp` 的 `fmt` / `lint` / `staged` 等）。

## 常用命令

```bash
vp install
pnpm run check
pnpm run dev
```

更多脚本见根 [package.json](package.json) 与各子包 `package.json`。
