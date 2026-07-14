# 测试与质量

## 检查层次

| 层次 | 命令 | 目的 |
| --- | --- | --- |
| 格式化、lint、类型检查 | `vp check` | Vite+ 统一静态检查 |
| 工作区单测 | `vp run test` 或 `vp test` | Vitest 单元/组件测试 |
| 单包类型检查 | `vp run --filter <package> typecheck` | 快速验证受影响应用 |
| Web E2E | `vp run test:e2e` | Playwright 浏览器流程 |
| 全量构建 | `vp run build` | 验证 workspace 构建与 Electron 文档复制 |
| 完整就绪检查 | `vp run ready` | 格式化、lint、测试和构建 |

Integration 单包示例：

```powershell
vp run --filter @nebula-studio-renderer/integration typecheck
vp run --filter @nebula-studio-renderer/integration test
```

## 单元测试

根 `vitest.config.ts` 使用 `happy-dom`，并排除 `e2e`、构建输出和工具配置文件。单测文件统一放在 `__tests__` 目录（例如 `src/__tests__/`、`src/utils/__tests__/` 或包根 `__tests__/`，与源码目录结构对应），命名 `*.test.ts`。主要覆盖：

- API client 的请求头、401 和响应解析；
- auth/runtime/app-shell 的模式与状态行为；
- Integration API adapter、路由守卫和 DAG schema；
- 编辑器布局/比较算法；
- Nebula UI 组件。

新增业务 API 时至少测试 URL、HTTP method、payload 和错误响应；新增跨应用状态时优先测试 core 包，不只测试页面快照。

## E2E

Playwright 配置位于 `playwright.config.ts`，默认：

- 测试目录：`e2e`；
- base URL：`http://localhost:5173`；
- 自动执行 `vp run dev:web`，已有服务时复用；
- 无头运行，单测超时 30 秒。

现有用例包括主题切换和 G4/G5 冒烟。部分 G4/G5 用例目前仅验证页面可达性，不能替代完整业务断言；修改认证、审批、发布或治理流程时应补充真实交互与结果校验。

后端相关 E2E 运行前，按 [后端联调](./backend-integration.md) 启动需要的服务。测试失败时区分页面断言失败和代理目标未启动导致的 502。

## 构建验证

```powershell
vp run build:web
vp run build
```

`build:web` 适合纯 Web/子应用变更的快速验证。全量 `build` 会递归构建工作区；修改组件文档（`apps/sub-web/docs`）、窗口配置、preload 或 Electron 集成时应跑全量构建。

## 按改动选择验证

| 改动                   | 最小建议验证                                |
| ---------------------- | ------------------------------------------- |
| 文档文字/链接          | Markdown 相对链接检查                       |
| 单个 UI 组件           | 组件测试 + 受影响包 typecheck + docs 示例   |
| Integration 页面/API   | Integration typecheck/test + Web 构建       |
| core 包                | 包单测 + 所有直接消费者 typecheck           |
| 窗口/宿主配置          | 重新生成配置 + Web/Electron 构建            |
| 认证、租户、跨应用事件 | core 单测 + Integration 测试 + Web E2E      |
| preload/IPC            | Electron typecheck + Electron 构建/手工冒烟 |

## 文档链接检查

仓库暂未提供专用 Markdown link checker。修改文档后至少检查：

- 相对链接目标存在；
- 没有个人绝对路径；
- 文档中的脚本仍存在于对应 `package.json`；
- 端口和代理与 Vite/后端配置一致；
- 包名与实际 `package.json#name` 一致。
