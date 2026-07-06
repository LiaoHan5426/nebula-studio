<script setup lang="ts">
import Demo from '@/components/Demo.vue';

// eslint-disable-next-line import/no-duplicates
import RadioGroupBasicSource from '@/examples/radio-group/RadioGroupBasic.vue?raw';
// eslint-disable-next-line import/no-duplicates
import RadioGroupDisabledSource from '@/examples/radio-group/RadioGroupDisabled.vue?raw';

import RadioGroupBasic from '@/examples/radio-group/RadioGroupBasic.vue';
// eslint-disable-next-line import/no-duplicates
import RadioGroupDisabled from '@/examples/radio-group/RadioGroupDisabled.vue';
</script>

<template>
  <div class="doc-section">
    <p>单选框组，在一组互斥选项中进行选择。</p>

    <h2 id="basic">基础用法</h2>
    <Demo :component="RadioGroupBasic" :source="RadioGroupBasicSource" />

    <h2 id="disabled">禁用状态</h2>
    <Demo :component="RadioGroupDisabled" :source="RadioGroupDisabledSource" />

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
