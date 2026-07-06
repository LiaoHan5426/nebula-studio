<script setup lang="ts">
import { ref } from 'vue';
import { NebulaRadioGroup } from '@nebula-studio/nebula-ui';
import type { NebulaRadioOption } from '@nebula-studio/nebula-ui';

const selected = ref('a');
const options: NebulaRadioOption[] = [
  { value: 'a', label: '选项 A' },
  { value: 'b', label: '选项 B' },
  { value: 'c', label: '选项 C' },
  { value: 'd', label: '禁用项', disabled: true },
];
</script>

<template>
  <div class="doc-section">
    <p>单选框组，在一组互斥选项中进行选择。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <NebulaRadioGroup v-model="selected" :options="options" />
      <p style="margin-top: 8px; font-size: 12px">当前选中: {{ selected }}</p>
    </div>
    <pre><code>&lt;script setup&gt;
import { ref } from 'vue';
import { NebulaRadioGroup } from '@nebula-studio/nebula-ui';
import type { NebulaRadioOption } from '@nebula-studio/nebula-ui';

const selected = ref('a');
const options: NebulaRadioOption[] = [
  { value: 'a', label: '选项 A' },
  { value: 'b', label: '选项 B' },
  { value: 'c', label: '选项 C' },
];
&lt;/script&gt;

&lt;NebulaRadioGroup v-model="selected" :options="options" /&gt;</code></pre>

    <h2>禁用状态</h2>
    <div class="doc-demo">
      <NebulaRadioGroup v-model="selected" :options="options" disabled />
    </div>
    <pre><code>&lt;NebulaRadioGroup v-model="selected" :options="options" disabled /&gt;</code></pre>

    <h2>API</h2>
    <h3>Props</h3>
    <table>
      <thead>
        <tr>
          <th>属性</th>
          <th>说明</th>
          <th>类型</th>
          <th>默认值</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>modelValue</code></td>
          <td>绑定值</td>
          <td><code>string</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>options</code></td>
          <td>选项列表</td>
          <td><code>NebulaRadioOption[]</code></td>
          <td><code>[]</code></td>
        </tr>
        <tr>
          <td><code>disabled</code></td>
          <td>是否禁用</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
      </tbody>
    </table>
    <h3>NebulaRadioOption</h3>
    <table>
      <thead>
        <tr>
          <th>属性</th>
          <th>说明</th>
          <th>类型</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>value</code></td>
          <td>选项值</td>
          <td><code>string</code></td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td>显示文本</td>
          <td><code>string</code></td>
        </tr>
        <tr>
          <td><code>disabled</code></td>
          <td>是否禁用</td>
          <td><code>boolean</code></td>
        </tr>
      </tbody>
    </table>
    <h3>Events</h3>
    <table>
      <thead>
        <tr>
          <th>事件名</th>
          <th>说明</th>
          <th>回调参数</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>update:modelValue</code></td>
          <td>值变更时触发</td>
          <td><code>(value: string) => void</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
