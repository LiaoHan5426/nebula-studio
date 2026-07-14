# 开发约定

## 工具链

日常操作统一使用 Vite+ CLI：

```powershell
vp install
vp run <script>
vp check
vp test
```

不要用 `npm run`、`pnpm run` 或 `npx` 绕过仓库的 Vite+ 配置。完整脚本以根和各工作区的 `package.json` 为准。

## 新增子应用

1. 在 `apps/sub-web/<slug>` 创建工作区，包名使用 `@nebula-studio-renderer/<id>`。
2. 提供宿主需要的入口（通常包括 `src/main.ts`、App/boot 导出和 Vite 配置）。
3. 在 `configs/windows.json` 增加窗口/子应用元数据和必要的 preload capability。
4. 执行 `vp run generate:configs`，不要手改生成文件。
5. 将 Web 宿主需要发现的子应用加入 `apps/web/vite.config.ts`。
6. 若 Electron 需要新 preload，在 `apps/electron-preload/<slug>` 增加对应包。
7. 补充应用 README、本文档索引、类型检查和最小启动/路由测试。

目录名、窗口 ID 和包名可能不同（现有 `frontend` → `main` 即为例子），因此配置应明确写出映射，不能靠字符串猜测。

## 新增共享包

按职责选择位置：

- 运行时基础能力：`packages/core`；
- UI 和布局：`packages/ui`；
- 编辑器：`packages/editors`；
- 可复用业务功能：`packages/features`；
- 前后端类型契约：`packages/contracts`；
- 仓库内部构建工具：`internal` 或 `tools`。

包需要声明稳定的 `exports`，避免业务应用跨包导入内部源码路径。公共包不得依赖具体 renderer，防止形成循环依赖。

## API 开发

1. 公共请求能力基于 `@nebula-studio/api-client`，不要重复实现 token、租户头、401 和响应解析。
2. endpoint adapter 可保留在应用的 `shared/api`，共享 DTO 放入 `@nebula-studio/contracts`。
3. 新 API 明确归属 Console、Executor 或 Platform，并同步开发代理。
4. SSE endpoint 需要同步检查代理超时、缓冲和组件卸载清理。
5. 对新增 adapter 编写请求 URL、method、headers 和响应解析单测。

## 认证与权限

- 会话读写使用 `@nebula-studio/auth-provider`，不要再引入应用私有 token storage key。
- 运行模式差异交给 `@nebula-studio/auth` 策略处理。
- 路由只声明公开/管理员等元数据，认证失败后的跨宿主行为由 app-shell 协调。
- UI 隐藏不等于授权；后端仍必须执行权限检查。

## 样式与组件

- 优先使用 `@nebula-studio/nebula-ui` 和 `@nebula-studio/nebula-layout`。
- 设计 token 放在 `@nebula-studio/styles`，不要在业务页面复制全局颜色变量。
- renderer 通过统一 Tailwind 入口加载全局样式。
- 新增或改变公共 UI 组件时，同时更新 `apps/sub-web/docs` 的说明和可运行示例。
- Electron 专属覆盖只放在 Electron 壳的专用样式中。

## 生成文件

| 命令                        | 产物                            |
| --------------------------- | ------------------------------- |
| `vp run generate:configs`   | 窗口/壳层配置                   |
| `vp run generate:manifest`  | 当前同样从窗口配置生成 manifest |
| `vp run generate:contracts` | OpenAPI 前后端契约类型          |

修改源配置后应重新生成并提交源文件与产物。生成文件通常带 `_generated` 或 generated 目录标识，不应直接编辑。

## 文档维护

- 命令从 `package.json` 复制，端口/代理从 Vite 配置复制，应用列表从 `configs/windows.json` 复制。
- 文档使用仓库相对路径，不记录个人盘符和 IDE 专属操作。
- 功能未完全实现时明确写“演示”“占位”或限制条件。
- 移动文件后检查 Markdown 相对链接。
- 架构变更应同时更新根 README、本目录和受影响包 README，避免多个版本并存。

## 提交前最小检查

```powershell
vp check
vp run test
vp run build
```

只改文档时可以用链接检查替代全量构建；若文档包含新增命令、配置或代码示例，仍应运行对应的最小验证。
