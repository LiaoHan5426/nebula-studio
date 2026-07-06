<script setup lang="ts">
import { ref } from 'vue';
import { NebulaSelect } from '@nebula-studio/nebula-ui';

const selected = ref('');
const options = [
  { label: '选项一', value: '1' },
  { label: '选项二', value: '2' },
  { label: '选项三', value: '3' },
  { label: '禁用项', value: '4', disabled: true },
];
</script>

<template>
  <div class="doc-section">
    <p>下拉选择器，支持对象选项和自定义键名。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <NebulaSelect
        v-model="selected"
        :options="options"
        placeholder="请选择"
      />
      <p style="margin-top: 8px; font-size: 12px">
        当前选中: {{ selected || '未选择' }}
      </p>
    </div>
    <pre><code>&lt;script setup&gt;
const selected = ref('');
const options = [
  { label: '选项一', value: '1' },
  { label: '选项二', value: '2' },
  { label: '选项三', value: '3' },
];
&lt;/script&gt;

&lt;template&gt;
  &lt;NebulaSelect v-model="selected" :options="options" placeholder="请选择" /&gt;
&lt;/template&gt;</code></pre>

    <h2>禁用状态</h2>
    <div class="doc-demo">
      <NebulaSelect
        v-model="selected"
        :options="options"
        disabled
        placeholder="禁用选择器"
      />
    </div>
    <pre><code>&lt;NebulaSelect v-model="selected" :options="options" disabled /&gt;</code></pre>

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
          <td><code>unknown</code></td>
          <td>—</td>
        </tr>
        <tr>
          <td><code>options</code></td>
          <td>选项列表</td>
          <td><code>(string | number | object)[]</code></td>
          <td><code>[]</code></td>
        </tr>
        <tr>
          <td><code>labelKey</code></td>
          <td>选项标签键名</td>
          <td><code>string</code></td>
          <td><code>'label'</code></td>
        </tr>
        <tr>
          <td><code>valueKey</code></td>
          <td>选项值键名</td>
          <td><code>string</code></td>
          <td><code>'value'</code></td>
        </tr>
        <tr>
          <td><code>disabledKey</code></td>
          <td>选项禁用键名</td>
          <td><code>string</code></td>
          <td><code>'disabled'</code></td>
        </tr>
        <tr>
          <td><code>placeholder</code></td>
          <td>占位文本</td>
          <td><code>string</code></td>
          <td>—</td>
        </tr>
        <tr>
          <td><code>disabled</code></td>
          <td>是否禁用</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
        <tr>
          <td><code>returnObject</code></td>
          <td>是否返回整个选项对象</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
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
          <td><code>(value: unknown) => void</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
