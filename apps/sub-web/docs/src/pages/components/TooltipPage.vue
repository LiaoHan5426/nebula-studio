<script setup lang="ts">
import { ref } from 'vue';
import { NebulaTooltip, NebulaButton } from '@nebula-studio/nebula-ui';

const placements = ['top', 'bottom', 'left', 'right'] as const;
</script>

<template>
  <div class="doc-section">
    <p>文字提示气泡，用于展示悬停提示信息。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <NebulaTooltip content="这是一段提示文字">
        <NebulaButton>悬停显示提示</NebulaButton>
      </NebulaTooltip>
    </div>
    <pre><code>&lt;NebulaTooltip content="这是一段提示文字"&gt;
  &lt;NebulaButton&gt;悬停显示提示&lt;/NebulaButton&gt;
&lt;/NebulaTooltip&gt;</code></pre>

    <h2>不同位置</h2>
    <div class="doc-demo">
      <div class="doc-demo-row">
        <NebulaTooltip
          v-for="p in placements"
          :key="p"
          :content="`提示在 ${p}`"
          :placement="p"
        >
          <NebulaButton>{{ p }}</NebulaButton>
        </NebulaTooltip>
      </div>
    </div>
    <pre><code>&lt;NebulaTooltip content="提示在 top" placement="top"&gt;
  &lt;NebulaButton&gt;top&lt;/NebulaButton&gt;
&lt;/NebulaTooltip&gt;
&lt;!-- placement: 'top' | 'bottom' | 'left' | 'right' --&gt;</code></pre>

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
