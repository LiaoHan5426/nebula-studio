<script setup lang="ts">
import Demo from '@/components/Demo.vue';

import checkboxBasicDemo from '@/examples/checkbox/CheckboxBasic.vue?demo';
</script>

<template>
  <div class="doc-section">
    <p>复选框组件，用于在一组选项中进行多选。</p>

    <h2 id="basic">基础用法</h2>
    <Demo
      :component="checkboxBasicDemo.component"
      :source="checkboxBasicDemo.source"
    />

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
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td>标签文本</td>
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
          <td><code>tooltip</code></td>
          <td>提示文本</td>
          <td><code>string</code></td>
          <td>—</td>
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
          <td><code>(value: boolean) => void</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
