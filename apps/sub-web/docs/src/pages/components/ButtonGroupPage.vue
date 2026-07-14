<script setup lang="ts">
import Demo from '@/components/Demo.vue';

import buttonGroupBasicDemo from '@/examples/button-group/ButtonGroupBasic.vue?demo';
import buttonGroupVerticalDemo from '@/examples/button-group/ButtonGroupVertical.vue?demo';
</script>

<template>
  <div class="doc-section">
    <p>按钮组组件，将多个按钮组合在一起。</p>

    <h2 id="basic">基础用法</h2>
    <Demo
      :component="buttonGroupBasicDemo.component"
      :source="buttonGroupBasicDemo.source"
    />

    <h2 id="vertical">垂直排列</h2>
    <Demo
      :component="buttonGroupVerticalDemo.component"
      :source="buttonGroupVerticalDemo.source"
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
          <td><code>orientation</code></td>
          <td>排列方向</td>
          <td><code>'horizontal' | 'vertical'</code></td>
          <td>—</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
