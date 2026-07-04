# Dialog 对话框

模态对话框组件，基于 Reka UI Dialog 封装。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { NebulaDialog } from '@nebula-studio/nebula-ui';

const dialogOpen = ref(false);
</script>

<template>
  <NebulaButton variant="primary" @click="dialogOpen = true">
    打开对话框
  </NebulaButton>

  <NebulaDialog v-model:open="dialogOpen" title="提示">
    <p>这是一段对话框内容。</p>
  </NebulaDialog>
</template>
```

## 带描述

```vue
<template>
  <NebulaDialog
    v-model:open="dialogOpen"
    title="确认删除"
    description="此操作不可撤销，确定要删除吗？"
  >
    <div class="flex justify-end gap-2 mt-4">
      <NebulaButton @click="dialogOpen = false">取消</NebulaButton>
      <NebulaButton variant="primary">确认删除</NebulaButton>
    </div>
  </NebulaDialog>
</template>
```

## 使用触发器插槽

```vue
<template>
  <NebulaDialog title="提示">
    <template #trigger>
      <NebulaButton variant="primary">打开对话框</NebulaButton>
    </template>
    <p>对话框内容</p>
  </NebulaDialog>
</template>
```

## API

### Props

| 属性         | 类型      | 默认值  | 说明                     |
| ------------ | --------- | ------- | ------------------------ |
| open         | `boolean` | `false` | 是否显示（v-model:open） |
| title        | `string`  | `''`    | 对话框标题               |
| description  | `string`  | `''`    | 对话框描述               |
| class        | `string`  | `''`    | 自定义 CSS 类名          |
| contentClass | `string`  | `''`    | 内容区域自定义 CSS 类名  |

### Events

| 事件名      | 参数               | 说明               |
| ----------- | ------------------ | ------------------ |
| update:open | `(value: boolean)` | 显示状态变化时触发 |

### Slots

| 插槽名  | 说明                                             |
| ------- | ------------------------------------------------ |
| default | 对话框内容                                       |
| trigger | 触发器元素（使用此插槽时无需手动控制 open 状态） |
