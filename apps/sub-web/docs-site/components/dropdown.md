# Dropdown 下拉菜单

向下弹出的菜单列表。

## 基础用法

```vue
<script setup lang="ts">
import { NebulaDropdown } from '@nebula-studio/nebula-ui';

const items = [
  { key: 'edit', label: '编辑' },
  { key: 'copy', label: '复制' },
  { key: 'delete', label: '删除', disabled: true },
];
</script>

<template>
  <NebulaDropdown :items="items">
    <NebulaButton>操作菜单</NebulaButton>
  </NebulaDropdown>
</template>
```

## API

### Props

| 属性  | 类型             | 默认值 | 说明            |
| ----- | ---------------- | ------ | --------------- |
| items | `DropdownItem[]` | `[]`   | 菜单项列表      |
| class | `string`         | `''`   | 自定义 CSS 类名 |

### DropdownItem

| 属性     | 类型      | 说明     |
| -------- | --------- | -------- |
| key      | `string`  | 唯一标识 |
| label    | `string`  | 显示文本 |
| disabled | `boolean` | 是否禁用 |
| icon     | `string`  | 图标名称 |

### Events

| 事件名 | 参数                   | 说明             |
| ------ | ---------------------- | ---------------- |
| select | `(item: DropdownItem)` | 选中菜单项时触发 |

### Slots

| 插槽名  | 说明       |
| ------- | ---------- |
| default | 触发器元素 |
