# Nebula Code Editor

`@nebula-studio/nebula-code-editor` 是代码编辑器的稳定业务边界。

- 默认入口导出 provider-neutral 的 `NebulaCodeEditor`、事件和选项类型。
- Monaco 通过异步 provider chunk 加载，不进入基础 UI 或应用同步入口。
- 业务优先依赖默认入口；只有 provider 专用诊断工具才能使用 `./monaco`。
- CodeMirror 可作为并列 provider 增加。TipTap 属于富文本编辑器，应放入独立包。

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { NebulaCodeEditor } from '@nebula-studio/nebula-code-editor';

const source = ref('');
</script>

<template>
  <NebulaCodeEditor v-model="source" language="json" />
</template>
```

校验命令：

```bash
vp run @nebula-studio/nebula-code-editor#typecheck
vp run @nebula-studio/nebula-code-editor#test
vp run @nebula-studio/nebula-code-editor#build
vp run @nebula-studio/nebula-code-editor#check:bundle
```
