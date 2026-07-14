<script setup lang="ts">
import Demo from '@/components/Demo.vue';

import tooltipBasicDemo from '@/examples/tooltip/TooltipBasic.vue?demo';
import tooltipPlacementDemo from '@/examples/tooltip/TooltipPlacement.vue?demo';
</script>

<template>
  <div class="doc-section">
    <p>文字提示气泡，用于展示悬停提示信息。</p>

    <h2 id="basic">基础用法</h2>
    <Demo
      :component="tooltipBasicDemo.component"
      :source="tooltipBasicDemo.source"
    />

    <h2 id="placement">不同位置</h2>
    <Demo
      :component="tooltipPlacementDemo.component"
      :source="tooltipPlacementDemo.source"
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
          <td><code>content</code></td>
          <td>提示内容（必填）</td>
          <td><code>string</code></td>
          <td>—</td>
        </tr>
        <tr>
          <td><code>placement</code></td>
          <td>提示位置</td>
          <td><code>'top' | 'bottom' | 'left' | 'right'</code></td>
          <td>—</td>
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
          <td>触发提示的元素</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
