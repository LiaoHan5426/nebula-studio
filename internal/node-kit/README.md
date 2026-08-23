# @nebula-studio-internal/node-kit

**Node 侧小工具库**（无框架）：工作区解析，以及 `windows.json` 校验 / 生成制品（node-kit 第一刀；目录暂不改名）。

## API（`src/monorepo.ts`）

| 函数 | 说明 |
| --- | --- |
| `findMonorepoRoot(cwd?)` | 自 `cwd` 向上找含 `pnpm-lock.yaml` 或 `pnpm-workspace.yaml` 的目录 |
| `getPackages` / `getPackagesSync` | 枚举工作区全部包（含根 `package.json`） |
| `getPackage` / `getPackageSync` | 按 `package.json` 的 `name` 查找单个包（含 `dir` 绝对路径） |

## 窗口配置（`src/windowConfig.mjs`）

| 导出 | 说明 |
| --- | --- |
| `joinOrigin` / `@nebula-studio-internal/node-kit/join-origin` | 拼接 origin 与 path |
| `validateWindowsConfig` | Ajv window schema + renderer 入口 + split environment targets + 端口冲突 |
| `generateWindowsTypeScript` / `generateApiNamespacesSource` | 写出 `_generated-windows.ts` 与 `api-namespaces.ts` 源码 |
| `writeWindowConfigArtifacts` | 校验后写文件；根脚本再 `vp fmt` |

根 `scripts/generate-window-configs.mjs` 只做编排。`api-namespaces.ts` 同时写出 API target、standalone 与 federation 开发入口，供 Electron / application-runtime 消费。`generate-contracts.mjs` 会调用 `ensureFrontendApplicationOpenApi`，因为 RestService `void` 返回值不会出现在 springdoc 响应 schema 中。

## 运行时地址漂移（`src/runtimeAddressDrift.mjs`）

扫描 apps/e2e/internal/packages/scripts 中硬编码的 localhost / 固定端口。根 `scripts/check-generated.mjs` 在生成制品后调用 `scanRuntimeAddressDrift`。

## 仓库内典型用法

- `tools/lint/oxlint/src/configs/tailwindcss.ts`：`getPackageSync('@nebula-studio-internal/tailwind', configDir)` 定位 `theme.css`。

## 设计注意

- **勿**让 `packages/styles` 等「被 tailwind 引用」的包 **依赖** 本包再被 tailwind 依赖，以免 **pnpm 循环**；脚本与 lint 配置单向引用即可。

## 相关

- [Monorepo 索引](../../docs/monorepo.md) · [pnpm-workspace.yaml](../../pnpm-workspace.yaml)
