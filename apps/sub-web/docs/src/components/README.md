# 文档站专用组件（`src/components`）

本目录仅包含 **`@nebula-studio-renderer/docs`** 内部复用的 Vue 组件（**不是** `packages/nebula-ui`）。

## 约定

- **平铺**：每个组件一个 **`Docs*.vue`** 文件，直接放在本目录下（不再使用子目录包裹）。
- **引用方式**：相对路径；不设路径别名。例如自 `src/features/<feature>/demos/*.vue`：

```ts
import DocsDemoSection from '../../../components/DocsDemoSection.vue';
```

自 `src/App.vue`：`./components/DocsNotifyCenter.vue`。

## 当前组件

| 文件                   | 说明                        |
| ---------------------- | --------------------------- |
| `DocsApiTable.vue`     | 文档内 API 表格             |
| `DocsDemoSection.vue`  | 示例区 + 可折叠源码         |
| `DocsNotifyCenter.vue` | 文档站 Toast / 详情弹层演示 |

新增组件时：在本目录新增 `DocsYourName.vue` 并在上表登记。
