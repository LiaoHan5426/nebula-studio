<script setup lang="ts">
import { ref } from 'vue';
import { NebulaDatePicker } from '@nebula-studio/nebula-ui';

const dateValue = ref<string | null>(null);
const datetimeValue = ref<string | null>(null);
const rangeValue = ref<[string, string] | null>(null);
</script>

<template>
  <div class="doc-section">
    <p>日期选择器，支持日期、日期时间和日期范围选择。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <NebulaDatePicker v-model="dateValue" placeholder="选择日期" />
      <p style="margin-top: 12px">选中值：{{ dateValue ?? '未选择' }}</p>
    </div>
    <pre><code>&lt;NebulaDatePicker v-model="dateValue" placeholder="选择日期" /&gt;</code></pre>

    <h2>日期时间选择</h2>
    <div class="doc-demo">
      <NebulaDatePicker
        v-model="datetimeValue"
        type="datetime"
        placeholder="选择日期时间"
      />
      <p style="margin-top: 12px">选中值：{{ datetimeValue ?? '未选择' }}</p>
    </div>
    <pre><code>&lt;NebulaDatePicker v-model="value" type="datetime" placeholder="选择日期时间" /&gt;</code></pre>

    <h2>日期时间范围</h2>
    <div class="doc-demo">
      <NebulaDatePicker
        v-model="rangeValue"
        type="datetimerange"
        placeholder="选择范围"
      />
      <p style="margin-top: 12px">
        选中值：{{ rangeValue ? rangeValue.join(' ~ ') : '未选择' }}
      </p>
    </div>
    <pre><code>&lt;NebulaDatePicker v-model="rangeValue" type="datetimerange" /&gt;</code></pre>

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
