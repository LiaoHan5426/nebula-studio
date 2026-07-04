# Select 选择器

下拉选择组件，支持基础选项和对象选项。

## 基础用法

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { NebulaSelect } from '@nebula-studio/nebula-ui';

const value = ref('opt1');
const options = ['选项一', '选项二', '选项三'];
</script>

<template>
  <NebulaSelect v-model="value" :options="options" />
</template>
```

## 对象选项

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { NebulaSelect } from '@nebula-studio/nebula-ui';

const selected = ref(1);
const options = [
  { label: '北京', value: 1 },
  { label: '上海', value: 2 },
  { label: '广州', value: 3, disabled: true },
];
</script>

<template>
  <NebulaSelect v-model="selected" :options="options" />
</template>
```

## 返回整个对象

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { NebulaSelect } from '@nebula-studio/nebula-ui';

const selected = ref(null);
const options = [
  { name: '苹果', id: 'apple' },
  { name: '香蕉', id: 'banana' },
];
</script>

<template>
  <NebulaSelect
    v-model="selected"
    :options="options"
    label-key="name"
    value-key="id"
    return-object
  />
</template>
```

## API

### Props

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| modelValue | `unknown` | — | 绑定值（v-model） |
| options | `readonly NebulaSelectOption[]` | `[]` | 选项列表 |
| labelKey | `string` | `'label'` | 对象选项的标签字段名（支持点号路径） |
| valueKey | `string` | `'value'` | 对象选项的值字段名（支持点号路径） |
| disabledKey | `string` | `'disabled'` | 对象选项的禁用字段名 |
| placeholder | `string` | `'Select'` | 占位文本 |
| disabled | `boolean` | `false` | 是否禁用 |
| returnObject | `boolean` | `false` | 是否返回整个选项对象 |

### Events

| 事件名 | 参数 | 说明 |
| --- | --- | --- |
| update:modelValue | `(value: unknown)` | 选中值变化时触发 |
| change | `(value: unknown, option: NebulaSelectOption)` | 选中值变化时触发 |
| blur | — | 失去焦点时触发 |
| focus | — | 获得焦点时触发 |

### Slots

| 插槽名 | 说明 |
| --- | --- |
| selected | 自定义选中项展示，作用域提供 `{ value, label, option, disabled, index }` |
| option | 自定义选项展示，作用域提供 `{ value, label, option, selected, disabled, index }` |
