<script setup lang="ts">
import Demo from '@/components/Demo.vue';

import tagBasicDemo from '@/examples/tag/TagBasic.vue?demo';
import tagTooltipDemo from '@/examples/tag/TagTooltip.vue?demo';
</script>

<template>
  <div class="doc-section">
    <p>标签组件，用于标记和分类，支持多种变体。</p>

    <h2 id="basic">基础用法</h2>
    <Demo :component="tagBasicDemo.component" :source="tagBasicDemo.source" />

    <h2 id="tooltip">带提示</h2>
    <Demo
      :component="tagTooltipDemo.component"
      :source="tagTooltipDemo.source"
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
          <td><code>variant</code></td>
          <td>标签变体</td>
          <td>
            <code>'default' | 'success' | 'warning' | 'danger' | 'info'</code>
          </td>
          <td><code>'default'</code></td>
        </tr>
        <tr>
          <td><code>tooltip</code></td>
          <td>提示文本</td>
          <td><code>string</code></td>
          <td>—</td>
        </tr>
        <tr>
          <td><code>tooltipPlacement</code></td>
          <td>提示位置</td>
          <td><code>'top' | 'bottom' | 'left' | 'right'</code></td>
          <td><code>'top'</code></td>
        </tr>
      </tbody>
    </table>
    <h3>Slots</h3>
    <table>
      <thead>
        <tr>
          <th>插槽名</th>
          <th>说明</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>default</code></td>
          <td>标签内容</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
