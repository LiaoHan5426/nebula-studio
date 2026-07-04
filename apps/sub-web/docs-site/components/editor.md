# Editor 编辑器

基于 Monaco Editor 的代码编辑器组件，支持多种语言和模式。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { NebulaEditor } from '@nebula-studio/nebula-ui';

const content = ref('// 在此输入代码');
</script>

<template>
  <NebulaEditor v-model="content" language="javascript" />
</template>
```

## Markdown 模式

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { NebulaEditor } from '@nebula-studio/nebula-ui';

const markdown = ref('# Hello\n\n这是 Markdown 内容');
</script>

<template>
  <NebulaEditor v-model="markdown" language="markdown" />
</template>
```

## 只读模式

```vue
<template>
  <NebulaEditor model-value="只读内容" language="sql" readonly />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `string` | `''` | 编辑器内容（v-model） |
| language | `string` | `'plaintext'` | 语言模式（javascript, typescript, sql, markdown 等） |
| readonly | `boolean` | `false` | 是否只读 |
| height | `string \| number` | `'300px'` | 编辑器高度 |
| theme | `string` | `'vs'` | 编辑器主题 |
| class | `string` | `''` | 自定义 CSS 类名 |

### Events

| 事件名            | 参数              | 说明           |
| ----------------- | ----------------- | -------------- |
| update:modelValue | `(value: string)` | 内容变化时触发 |
