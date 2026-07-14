<script setup lang="ts">
import Demo from '@/components/Demo.vue';

import selectBasicDemo from '@/examples/select/SelectBasic.vue?demo';
import selectDisabledDemo from '@/examples/select/SelectDisabled.vue?demo';
</script>

<template>
  <div class="doc-section">
    <p>下拉选择器，支持对象选项和自定义键名。</p>

    <h2 id="basic">基础用法</h2>
    <Demo
      :component="selectBasicDemo.component"
      :source="selectBasicDemo.source"
    />

    <h2 id="disabled">禁用状态</h2>
    <Demo
      :component="selectDisabledDemo.component"
      :source="selectDisabledDemo.source"
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
