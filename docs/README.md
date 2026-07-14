# Nebula Studio 开发文档

本目录保存 Nebula Studio 的仓库级开发文档，面向前端开发者和贡献者。文档以当前代码、工作区配置与脚本为准；组件的交互式示例由 `@nebula-studio-renderer/docs` 子应用提供。

## 阅读路径

| 文档 | 适用场景 |
| --- | --- |
| [快速开始](./getting-started.md) | 安装环境、启动 Web/Electron、首次联调 |
| [整体架构](./architecture.md) | 理解宿主、子应用、共享包和运行模式 |
| [应用与功能](./applications.md) | 查找各应用入口、职责及 Integration 功能页面 |
| [Monorepo 目录](./monorepo.md) | 查找工作区成员、包名和迁移检查项 |
| [后端联调](./backend-integration.md) | 启动后端、理解代理、认证、租户与 SSE |
| [开发约定](./development.md) | 新增应用或包、维护契约、样式和配置 |
| [测试与质量](./testing.md) | 运行格式化、静态检查、单测、E2E 和构建 |

## 文档边界

- `docs/`：仓库结构、架构、开发流程和联调说明。
- `apps/*/README.md`、`packages/*/README.md`：单个应用或包的入口、导出与内部约束。
- `apps/sub-web/docs/`：Nebula UI 组件文档应用源码及交互式示例。
- 后端设计和 API 语义：以相邻的 `../nebula/docs/` 为准，前端文档只记录消费方式与开发代理。

## 事实来源

遇到文档与代码不一致时，按以下优先级核对并更新文档：

1. `package.json`、`pnpm-workspace.yaml` 与 `vite.config.ts`；
2. `configs/windows.json` 及其生成结果；
3. 应用入口、路由和 API client；
4. 本目录文档及各包 README。

路径示例均相对于 `nebula-studio` 仓库根目录，避免依赖某台机器的绝对路径。
