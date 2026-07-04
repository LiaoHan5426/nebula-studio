# Reader 阅读器

内容渲染组件，支持 Markdown 和纯文本格式。

## 基础用法

```vue
<script setup lang="ts">
import { NebulaReader } from '@nebula-studio/nebula-ui';

const markdownContent = `
# 标题

这是一段 **Markdown** 内容，支持代码高亮：

\`\`\`javascript
console.log('Hello, World!');
\`\`\`
`;
</script>

<template>
  <NebulaReader :content="markdownContent" format="markdown" />
</template>
```

## 纯文本模式

```vue
<template>
  <NebulaReader content="这是纯文本内容" format="plain" />
</template>
```

## API

### Props

| 属性    | 类型                    | 默认值       | 说明            |
| ------- | ----------------------- | ------------ | --------------- |
| content | `string`                | `''`         | 渲染内容        |
| format  | `'markdown' \| 'plain'` | `'markdown'` | 内容格式        |
| class   | `string`                | `''`         | 自定义 CSS 类名 |
