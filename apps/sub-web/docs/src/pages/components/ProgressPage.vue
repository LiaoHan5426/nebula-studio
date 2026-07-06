<script setup lang="ts">
import { ref } from 'vue';
import { NebulaProgress } from '@nebula-studio/nebula-ui';

const dynamicValue = ref(30);
</script>

<template>
  <div class="doc-section">
    <p>进度条组件，用于展示操作进度。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <NebulaProgress :model-value="50" />
    </div>
    <pre><code>&lt;NebulaProgress :model-value="50" /&gt;</code></pre>

    <h2>不同进度</h2>
    <div class="doc-demo">
      <NebulaProgress :model-value="20" />
      <NebulaProgress :model-value="60" />
      <NebulaProgress :model-value="100" />
    </div>
    <pre><code>&lt;NebulaProgress :model-value="20" /&gt;
&lt;NebulaProgress :model-value="60" /&gt;
&lt;NebulaProgress :model-value="100" /&gt;</code></pre>

    <h2>动态进度</h2>
    <div class="doc-demo">
      <NebulaProgress v-model="dynamicValue" />
      <div class="doc-demo-row" style="margin-top: 12px">
        <NebulaButton @click="dynamicValue = Math.max(0, dynamicValue - 10)"
          >-10</NebulaButton
        >
        <NebulaButton
          variant="primary"
          @click="dynamicValue = Math.min(100, dynamicValue + 10)"
          >+10</NebulaButton
        >
        <span style="font-size: 12px">{{ dynamicValue }}%</span>
      </div>
    </div>
    <pre><code>&lt;NebulaProgress v-model="value" /&gt;
&lt;NebulaButton @click="value -= 10"&gt;-10&lt;/NebulaButton&gt;
&lt;NebulaButton @click="value += 10"&gt;+10&lt;/NebulaButton&gt;</code></pre>

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
          <td>当前进度值</td>
          <td><code>number</code></td>
          <td><code>0</code></td>
        </tr>
        <tr>
          <td><code>max</code></td>
          <td>最大值</td>
          <td><code>number</code></td>
          <td><code>100</code></td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td>自定义类名</td>
          <td><code>string</code></td>
          <td>—</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
