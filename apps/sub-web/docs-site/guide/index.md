# 快速开始

## 安装

```bash
pnpm add @nebula-studio/nebula-ui
```

## 使用

在应用入口引入样式和组件：

```typescript
// main.ts
import '@nebula-studio/nebula-ui';
import { createApp } from 'vue';
import App from './App.vue';

createApp(App).mount('#app');
```

在组件中直接使用：

```vue
<script setup lang="ts">
import {
  NebulaButton,
  NebulaCard,
  NebulaTable,
} from '@nebula-studio/nebula-ui';
</script>

<template>
  <NebulaCard title="示例卡片">
    <NebulaButton variant="primary">点击我</NebulaButton>
  </NebulaCard>
</template>
```

## 项目结构

```
@nebula-studio/nebula-ui
├── src/
│   ├── components/       # 所有组件
│   │   ├── button/       # NebulaButton
│   │   ├── card/         # NebulaCard
│   │   ├── table/        # NebulaTable
│   │   └── ...
│   ├── composables/      # 组合式函数
│   ├── directives/       # 自定义指令
│   └── utils/            # 工具函数
└── index.ts              # 统一导出
```

## 技术栈

| 技术                     | 说明         |
| ------------------------ | ------------ |
| Vue 3.5+                 | 基础框架     |
| TypeScript               | 类型安全     |
| Tailwind CSS v4          | 样式方案     |
| Reka UI                  | 无头组件基础 |
| class-variance-authority | 变体管理     |

## 浏览器支持

| 浏览器  | 版本  |
| ------- | ----- |
| Chrome  | >= 90 |
| Firefox | >= 88 |
| Safari  | >= 15 |
| Edge    | >= 90 |
