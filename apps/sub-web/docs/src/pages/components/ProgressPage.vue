<script setup lang="ts">
import Demo from '@/components/Demo.vue';

// eslint-disable-next-line import/no-duplicates
import ProgressBasicSource from '@/examples/progress/ProgressBasic.vue?raw';
// eslint-disable-next-line import/no-duplicates
import ProgressMultipleSource from '@/examples/progress/ProgressMultiple.vue?raw';
// eslint-disable-next-line import/no-duplicates
import ProgressDynamicSource from '@/examples/progress/ProgressDynamic.vue?raw';

import ProgressBasic from '@/examples/progress/ProgressBasic.vue';
// eslint-disable-next-line import/no-duplicates
import ProgressMultiple from '@/examples/progress/ProgressMultiple.vue';
// eslint-disable-next-line import/no-duplicates
import ProgressDynamic from '@/examples/progress/ProgressDynamic.vue';
</script>

<template>
  <div class="doc-section">
    <p>进度条组件，用于展示操作进度。</p>

    <h2 id="basic">基础用法</h2>
    <Demo :component="ProgressBasic" :source="ProgressBasicSource" />

    <h2 id="multiple">不同进度</h2>
    <Demo :component="ProgressMultiple" :source="ProgressMultipleSource" />

    <h2 id="dynamic">动态进度</h2>
    <Demo :component="ProgressDynamic" :source="ProgressDynamicSource" />

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

<style scoped>
.doc-section {
  max-width: 800px;
}

.doc-section h2 {
  padding-bottom: 8px;
  margin-top: 32px;
  font-size: 22px;
  font-weight: 600;
  border-bottom: 1px solid hsl(var(--border));
}

.doc-section p {
  margin-top: 8px;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}

.doc-section pre {
  padding: 16px;
  margin: 16px 0;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.6;
  background: hsl(var(--muted) / 24%);
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.doc-section code {
  font-family: 'Fira Code', 'Cascadia Code', Consolas, monospace;
  font-size: 13px;
}

.doc-section table {
  width: 100%;
  margin: 16px 0;
  font-size: 14px;
  border-collapse: collapse;
}

.doc-section table th {
  padding: 10px 14px;
  font-weight: 600;
  text-align: left;
  background: hsl(var(--muted) / 16%);
  border: 1px solid hsl(var(--border));
}

.doc-section table td {
  padding: 10px 14px;
  border: 1px solid hsl(var(--border));
}

.doc-section table tr:hover td {
  background: hsl(var(--muted) / 8%);
}
</style>
