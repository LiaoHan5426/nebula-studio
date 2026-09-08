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
- pnpm `11.25.0`
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

| 命令                         | 用途                               |
| ---------------------------- | ---------------------------------- |
| `vp install`                 | 安装工作区依赖                     |
| `vp run dev`                 | 启动 Electron 开发环境             |
| `vp run start`               | 预览 Electron 构建结果             |
| `vp run dev:web`             | 启动 Web 开发环境                  |
| `vp run build`               | 构建全部工作区包                   |
| `vp run build:web`           | 仅构建 Web 宿主及打包内置 Remote   |
| `vp check`                   | 自动修复格式、代码检查与类型校验   |
| `vp run lint`                | 运行 Oxlint 与 Stylelint           |
| `vp run test`                | 运行工作区单元测试                 |
| `vp run test:e2e`            | 运行快速 Mock Playwright 回归      |
| `vp run test:e2e:experience` | 运行视觉、键盘与性能基线           |
| `vp run test:e2e:electron`   | 构建并运行 Electron E2E            |
| `vp run test:e2e:real`       | 构建并启动相邻后端后运行真实栈 E2E |
| `vp run test:all`            | 运行单元测试、Mock 与体验 E2E      |
| `vp run ready`               | 依次执行格式化、检查、测试与构建   |
| `vp run pack:win`            | 打包 Windows 桌面应用              |
| `vp run pack:mac`            | 打包 macOS 桌面应用                |
| `vp run pack:linux`          | 打包 Linux 桌面应用                |

完整脚本见根目录 [package.json](package.json) 与各子包的 `package.json`。

## 项目结构

```text
nebula-studio/
├─ apps/
│  ├─ electron/          # Electron 桌面宿主（主进程、窗口生命周期与视图引导）
│  ├─ electron-preload/  # 统一 preload 与按能力组装的桥接实现
│  ├─ web/               # Web 宿主（集成内置 Workspace / Login 载荷）
│  ├─ sub-web/           # Federation Remotes（integration、settings、docs）
│  ├─ remotes/           # Federation Remotes（low-code-studio、hello 等）
│  └─ mf-poc-host/       # 模块联邦沙箱与验证宿主
├─ internal/             # 仓库内部 Vite、Node 等共享工具（build-kit、node-kit）
├─ packages/
│  ├─ contracts/         # 领域服务端契约 facade（由 OpenAPI 生成 + 适配）
│  ├─ platform/          # 平台运行时底座（bootstrap、runtime、auth、i18n、query、state 等）
│  ├─ low-code/          # 低代码运行时核心（compiler、contract、kit）
│  ├─ editors/           # 按需懒加载编辑器（code、dag、flow、low-code、panel、form）
│  ├─ ui/                # UI 组件库、布局与语义化设计 Token（nebula-ui、shell-ui、tokens 等）
│  └─ testing/           # 测试夹具（msw 等）
├─ tools/                # TypeScript、Tailwind 与代码质量配置
└─ docs/                 # 仓库级开发文档
```

工作区成员及版本 catalogs 以 [pnpm-workspace.yaml](pnpm-workspace.yaml) 为准。

## 架构速览

1. **Host 与 Remote 模型**：Web（`apps/web`）与 Electron（`apps/electron`）统一作为 **Host**，负责路由分发、权限控制、状态持有和宿主能力注入；Docs、Settings、Integration、Low-Code Studio 作为 **Module Federation Remote** 动态加载。旧 `frontend` 与 `login` 已并入 Host 载荷（`@nebula-host-boot/workspace` 与 `@nebula-host-boot/login`），彻底消除了嵌套 shell 导致的“镜中镜”问题。
2. **应用注册中心**：Host 通过后端应用注册中心接口（`/api/system/frontend-apps/runtime`）动态获取应用清单与加载驱动，实现无侵入插拔与动态接入。
3. **全局样式与设计系统**：业务侧统一引入 `@nebula-studio/styles/document`（Host/standalone）或 `@nebula-studio/styles/remote`（Federation）。跨应用样式由 `@nebula-studio/tokens` 输出 CSS 语义变量与 Theme Matrix（支持多模式与动态主题色）。
4. **统一应用数据底座**：Pinia 负责客户端领域状态，Vue Query 负责服务端数据缓存，Vue I18n 提供模块级按需多语言加载；表单验证体系由 `@tanstack/vue-form` + `zod` 统一收敛。

## 验收状态

Playwright 分为 `mock-regression`、`experience`、`real-stack` 和 `electron` 四个 project。当前本地 Mock、体验/性能、Electron E2E 与真实栈均通过验收。

真实栈脚本（`vp run test:e2e:real`）能够一键构建相邻后端 `nebula` 的 Reactor、联合启动正式平台服务（8090 / 8080 / 8088 / 8092）、生成在线 OpenAPI 契约无漂移，并通过无 Mock 端到端测试。详见 [测试与质量](docs/testing.md) 和 [后端联调](docs/backend-integration.md)。

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
