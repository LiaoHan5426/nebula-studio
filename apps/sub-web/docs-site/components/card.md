# Card 卡片

通用的容器卡片组件。

## 基础用法

```vue
<script setup lang="ts">
import { NebulaCard } from '@nebula-studio/nebula-ui';
</script>

<template>
  <NebulaCard title="卡片标题" description="这是一段描述文字">
    卡片内容区域
  </NebulaCard>
</template>
```

## 带底部操作区

```vue
<template>
  <NebulaCard title="操作卡片">
    <p>卡片内容</p>
    <template #footer>
      <NebulaButton variant="primary">确认</NebulaButton>
      <NebulaButton>取消</NebulaButton>
    </template>
  </NebulaCard>
</template>
```

## API

### Props

| 属性         | 类型     | 默认值 | 说明                    |
| ------------ | -------- | ------ | ----------------------- |
| title        | `string` | `''`   | 卡片标题                |
| description  | `string` | `''`   | 卡片描述                |
| class        | `string` | `''`   | 自定义 CSS 类名         |
| contentClass | `string` | `''`   | 内容区域自定义 CSS 类名 |

### Slots

| 插槽名  | 说明           |
| ------- | -------------- |
| default | 卡片内容       |
| footer  | 卡片底部操作区 |
