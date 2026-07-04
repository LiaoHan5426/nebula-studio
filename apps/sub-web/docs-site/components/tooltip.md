# Tooltip 提示

简单的文字提示气泡，通过指令方式使用。

## 基础用法

```vue
<script setup lang="ts">
import { nebulaTooltip } from '@nebula-studio/nebula-ui';
</script>

<template>
  <NebulaButton v-nebula-tooltip="'提示内容'"> 悬停显示提示 </NebulaButton>
</template>
```

## 不同位置

```vue
<template>
  <NebulaButton v-nebula-tooltip:top="'上方提示'">上</NebulaButton>
  <NebulaButton v-nebula-tooltip:bottom="'下方提示'">下</NebulaButton>
  <NebulaButton v-nebula-tooltip:left="'左侧提示'">左</NebulaButton>
  <NebulaButton v-nebula-tooltip:right="'右侧提示'">右</NebulaButton>
</template>
```

## API

### 指令

| 指令名           | 参数     | 说明         |
| ---------------- | -------- | ------------ |
| v-nebula-tooltip | `string` | 提示文本内容 |

### 修饰符

| 修饰符 | 说明                   |
| ------ | ---------------------- |
| top    | 提示在上方显示（默认） |
| bottom | 提示在下方显示         |
| left   | 提示在左侧显示         |
| right  | 提示在右侧显示         |
