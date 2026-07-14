# @nebula-studio-internal/node

**Node 侧小工具库**（无框架）：当前核心是 **pnpm monorepo 解析**，基于 `@manypkg/get-packages`。

## API（`src/monorepo.ts`）

| 函数 | 说明 |
| --- | --- |
| `findMonorepoRoot(cwd?)` | 自 `cwd` 向上找含 `pnpm-lock.yaml` 或 `pnpm-workspace.yaml` 的目录 |
| `getPackages` / `getPackagesSync` | 枚举工作区全部包（含根 `package.json`） |
| `getPackage` / `getPackageSync` | 按 `package.json` 的 `name` 查找单个包（含 `dir` 绝对路径） |

## 仓库内典型用法

- `tools/lint/oxlint/src/configs/tailwindcss.ts`：`getPackageSync('@nebula-studio-internal/tailwind', configDir)` 定位 `theme.css`。

## 设计注意

- **勿**让 `packages/styles` 等「被 tailwind 引用」的包 **依赖** 本包再被 tailwind 依赖，以免 **pnpm 循环**；脚本与 lint 配置单向引用即可。

## 相关

- [Monorepo 索引](../../docs/monorepo.md) · [pnpm-workspace.yaml](../../pnpm-workspace.yaml)
