# `src/components`

本包内 Vue / TS 组件按 **一组件一目录** 组织：目录名为 **kebab-case**、**无 `nebula-` 前缀**，入口文件为 **PascalCase** 的 `.vue` 或 `.ts`（与导出名一致）。

## 统一导出

- **[`index.ts`](./index.ts)**：聚合导出全部组件与编辑器类型，供包根 [`src/index.ts`](../index.ts) `export * from './components'` 使用。
- 可选子路径入口：**`@nebula-studio/nebula-ui/components`**（见包 [`package.json`](../package.json) `exports`）。

## 目录一览

| 目录             | 说明                          |
| ---------------- | ----------------------------- |
| `anchor/`        | 文档页内锚点导航              |
| `button/`        | 按钮                          |
| `code-editor/`   | CodeMirror 代码编辑           |
| `drag/`          | 拖拽列表                      |
| `editor/`        | 统一编辑（code / richtext）   |
| `editor-types/`  | 编辑器相关类型与常量（无 UI） |
| `markdown-pane/` | Markdown 编辑 + 预览分栏      |
| `pane/`          | 区块容器                      |
| `pagination/`    | 分页                          |
| `reader/`        | 预览渲染                      |
| `rich-editor/`   | wangEditor 富文本             |
| `switch/`        | 开关                          |
| `table/`         | 表格根                        |
| `table-column/`  | 表格列                        |
| `table-row/`     | 表格行组                      |
| `tag/`           | 标签                          |
| `theme-toggle/`  | 明暗主题切换                  |
| `tooltip/`       | 文案提示包装                  |
| `tree-menu/`     | 树形功能菜单                  |

消费方请优先使用 **`@nebula-studio/nebula-ui`** 包根导出；仅在需要避免从根入口拉全量时再使用 **`@nebula-studio/nebula-ui/components`**。
