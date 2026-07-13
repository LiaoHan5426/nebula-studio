# Nebula Studio

Nebula Studio 是一个基于 **pnpm workspace** 的 monorepo，包含 **Electron 桌面端**、**Web 多入口宿主**、多个 **Vue renderer 子应用**，以及可复用的业务、UI 与工具链包。

## 技术栈

- **运行时**：Electron、Vue 3、TypeScript
- **构建工具**：Vite、electron-vite、Vite+
- **样式方案**：Tailwind CSS v4
- **包管理与工作区**：pnpm workspace
- **测试与质量检查**：Vitest、Playwright、Oxlint、Oxfmt、Stylelint

## 环境要求

- Node.js `>= 22.12.0`
- pnpm `11.5.1`
- Vite+ CLI（命令名为 `vp`）

## 快速开始

在仓库根目录执行：

```bash
vp install
vp run dev
```

`vp run dev` 默认启动 Electron 桌面端。仅启动 Web 宿主时使用：

```bash
vp run dev:web
```

## 常用命令

| 命令                | 用途                             |
| ------------------- | -------------------------------- |
| `vp install`        | 安装工作区依赖                   |
| `vp run dev`        | 启动 Electron 开发环境           |
| `vp run start`      | 预览 Electron 构建结果           |
| `vp run dev:web`    | 启动 Web 开发环境                |
| `vp run build`      | 构建全部工作区包                 |
| `vp run build:web`  | 仅构建 Web 宿主                  |
| `vp run check`      | 自动修复格式与代码检查问题       |
| `vp run lint`       | 运行 Oxlint 与 Stylelint         |
| `vp run test`       | 运行工作区单元测试               |
| `vp run test:e2e`   | 运行 Playwright 端到端测试       |
| `vp run test:all`   | 运行全部单元测试与端到端测试     |
| `vp run ready`      | 依次执行格式化、检查、测试与构建 |
| `vp run pack:win`   | 打包 Windows 桌面应用            |
| `vp run pack:mac`   | 打包 macOS 桌面应用              |
| `vp run pack:linux` | 打包 Linux 桌面应用              |

完整脚本见根目录 [package.json](package.json) 与各子包的 `package.json`。

## 项目结构

```text
nebula-studio/
├─ apps/
│  ├─ electron/          # Electron 主进程与 renderer 引导
│  ├─ electron-preload/  # 各窗口的 preload 包
│  ├─ sub-web/           # Vue renderer 子应用
│  └─ web/               # Web 壳与 embed 多入口
├─ internal/             # 仓库内部 Vite、Node 等共享工具
├─ packages/
│  ├─ core/              # 核心能力与宿主桥接
│  ├─ editors/           # 编辑器相关包
│  ├─ features/          # 可复用业务功能
│  └─ ui/                # UI 与布局组件
├─ tools/                # TypeScript、Tailwind 与代码质量配置
└─ docs/                 # 仓库级开发文档
```

工作区成员及版本 catalogs 以 [pnpm-workspace.yaml](pnpm-workspace.yaml) 为准。

## 架构速览

1. **Electron**（`apps/electron`）：主进程负责窗口生命周期。renderer 使用单一 `index.html` 与 `src/renderer/boot.ts`，再根据 `?renderer=` 动态加载 `app.config.ts` 声明的子应用入口；preload 位于 `apps/electron-preload/*`。
2. **Web**（`apps/web`）：提供 Web 壳与 embed 入口（`src/shell-entry.ts`、`src/embed/*-entry.ts`），并与 `@nebula-studio/app-shell` 的 Web 集成路径保持一致。
3. **全局样式**：业务侧统一引入 `@nebula-studio-internal/tailwind/electron`。其内部依次加载 Tailwind v4 主题与 `@nebula-studio/styles`；仅 Electron 使用的覆盖样式放在 `apps/electron/src/renderer/styles/electron-overrides.css`。
4. **全局类型**：`@nebula-studio/types` 通过 `tools/tsconfig/web.json` 的 `compilerOptions.types` 注入 renderer。不要在多个 `env.d.ts` 中重复声明相同的 ambient 模块。

## 开发约定

- 日常任务统一使用 **Vite+ CLI（`vp`）**，仓库脚本中不使用裸 `pnpm run` 或 `npm run`。参阅 [Vite+ 文档](https://viteplus.dev/guide/)。
- 根工具链配置位于 [vite.config.ts](vite.config.ts)，集中管理格式化、代码检查、暂存文件检查与任务缓存。
- 新增、移动或重命名包后，应同步检查工作区 glob、包引用、构建入口及相关文档链接。

## 文档入口

| 文档 | 用途 |
| --- | --- |
| [docs/README.md](docs/README.md) | 仓库级文档目录 |
| [docs/monorepo.md](docs/monorepo.md) | 包索引、关键路径不变量及迁移/改名核对清单 |
| [apps/electron/README.md](apps/electron/README.md) | Electron 应用职责、入口与构建管线 |
| [apps/web/README.md](apps/web/README.md) | Web 宿主入口与集成约定 |
