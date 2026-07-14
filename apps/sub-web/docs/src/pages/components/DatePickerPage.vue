<script setup lang="ts">
import Demo from '@/components/Demo.vue';

import datePickerBasicDemo from '@/examples/date-picker/DatePickerBasic.vue?demo';
import datePickerDatetimeDemo from '@/examples/date-picker/DatePickerDatetime.vue?demo';
import datePickerRangeDemo from '@/examples/date-picker/DatePickerRange.vue?demo';
</script>

<template>
  <div class="doc-section">
    <p>日期选择器，支持日期、日期时间和日期范围选择。</p>

    <h2 id="basic">基础用法</h2>
    <Demo
      :component="datePickerBasicDemo.component"
      :source="datePickerBasicDemo.source"
    />

    <h2 id="datetime">日期时间选择</h2>
    <Demo
      :component="datePickerDatetimeDemo.component"
      :source="datePickerDatetimeDemo.source"
    />

    <h2 id="range">日期时间范围</h2>
    <Demo
      :component="datePickerRangeDemo.component"
      :source="datePickerRangeDemo.source"
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
          <td>绑定值（v-model）</td>
          <td><code>string | [string, string] | null</code></td>
          <td>—</td>
        </tr>
        <tr>
          <td><code>type</code></td>
          <td>选择器类型</td>
          <td><code>'date' | 'datetime' | 'datetimerange'</code></td>
          <td><code>'date'</code></td>
        </tr>
        <tr>
          <td><code>placeholder</code></td>
          <td>占位文本</td>
          <td><code>string</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>disabled</code></td>
          <td>是否禁用</td>
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
          <td>值变化时触发</td>
          <td><code>(value)</code></td>
        </tr>
        <tr>
          <td><code>change</code></td>
          <td>确认选择时触发</td>
          <td><code>(value)</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
