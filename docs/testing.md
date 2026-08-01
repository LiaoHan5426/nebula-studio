# 测试与质量

## 检查层次

| 层次 | 命令 | 目的 |
| --- | --- | --- |
| 格式化、lint、类型检查 | `vp check` | Vite+ 统一静态检查 |
| 工作区单测 | `vp run test` 或 `vp test` | Vitest 单元/组件测试 |
| 单包类型检查 | `vp run --filter <package> typecheck` | 快速验证受影响应用 |
| Mock E2E | `vp run test:e2e` / `vp run test:e2e:mock` | 快速、确定性的浏览器回归 |
| 体验 E2E | `vp run test:e2e:experience` | 视觉、响应式、键盘焦点和性能 |
| Electron E2E | `vp run test:e2e:electron` | 桌面启动、会话、Preload 与窗口切换 |
| 真实栈 E2E | `vp run test:e2e:real` | 后端 reactor、三服务、Web、契约与真实 API |
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
- 无头运行，单项测试超时 45 秒；
- 失败保留 trace、截图、录像和 HTML report。

当前共枚举 24 项测试：Mock 12 项、体验/性能 10 项、real-stack 1 项和 Electron 1 项。Mock 负责快速回归，不能替代 real-stack；体验 project 固定在 Windows runner 比较 48 张视觉基线，避免跨操作系统字体渲染差异造成噪声。

真实后端验收优先运行 `vp run test:e2e:real`，由脚本按 [后端联调](./backend-integration.md) 的拓扑构建并启动服务。测试失败时先查看 `test-results/real-stack` 判断 Platform、Console 或 Executor，再查看 Playwright trace。

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

## Phase 8 验收矩阵

浏览器验收分为互不混跑的四个 Playwright project：

| Project | 命令 | 责任边界 |
| --- | --- | --- |
| `mock-regression` | `vp run test:e2e:mock` | 快速回归，允许通过 `page.route` 固定数据 |
| `experience` | `vp run test:e2e:experience` | 六类界面的亮暗主题、响应式、键盘焦点、视觉和资源首屏预算 |
| `real-stack` | `vp run test:e2e:real` | 启动 Platform Console、Platform Integration、Platform Integration Executor 和 Web，不允许网络 Mock |
| `electron` | `vp run test:e2e:electron` | Electron 启动、认证会话、Preload capability、窗口切换、截图和性能附件 |

真实栈脚本默认从同级 `../nebula` 读取后端。自定义后端目录时直接调用脚本：

```powershell
$env:NEBULA_E2E_PASSWORD = "[REDACTED]"
$env:NEBULA_E2E_GATEWAY_API_KEY = "[REDACTED]"
powershell -NoProfile -ExecutionPolicy Bypass -File ./scripts/e2e/run-real-stack.ps1 -BackendRoot F:\path\to\nebula
```

脚本先通过 Maven reactor 安装三项服务所需模块，并在任一服务进程提前退出时立即失败。失败日志位于 `test-results/real-stack`，Playwright trace、截图和录像位于 `test-results/playwright`。

当前实测状态（2026-08-01）：脚本从停止状态完成 142 模块定向构建，启动三个正式平台应用，通过 8090/8080/8081 健康检查、监控端点未认证 401、在线 OpenAPI 生成和 1 项无 Mock real-stack 测试，并在结束后只关闭本次启动且 PID 与创建时间身份一致的临时进程树。复用的用户服务不会被记录为脚本所有，也不会被终止；launcher 提前退出时会继续清理已记录的子进程，单项清理失败也不阻断后续服务，相关边界有 7 项 Pester 回归测试。

真实栈运行前会从在线 Platform Console OpenAPI 重新生成契约，并对生成文件执行 `git diff --exit-code`。因此后端字段变化必须先更新并提交前端契约，否则验收立即失败。

资源性能预算：

- Web 资源目录首屏不超过 2500 ms，详情不超过 2000 ms。
- Electron 资源目录首屏不超过 4000 ms。
- 每次运行将测量值作为 JSON attachment 写入 Playwright 结果，便于比较真实基线。
