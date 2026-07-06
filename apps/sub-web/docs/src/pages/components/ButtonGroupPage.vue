<script setup lang="ts">
import { NebulaButton, NebulaButtonGroup } from '@nebula-studio/nebula-ui';
</script>

<template>
  <div class="doc-section">
    <p>按钮组组件，将多个按钮组合在一起。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <NebulaButtonGroup>
        <NebulaButton>左</NebulaButton>
        <NebulaButton>中</NebulaButton>
        <NebulaButton>右</NebulaButton>
      </NebulaButtonGroup>
    </div>
    <pre><code>&lt;NebulaButtonGroup&gt;
  &lt;NebulaButton&gt;左&lt;/NebulaButton&gt;
  &lt;NebulaButton&gt;中&lt;/NebulaButton&gt;
  &lt;NebulaButton&gt;右&lt;/NebulaButton&gt;
&lt;/NebulaButtonGroup&gt;</code></pre>

    <h2>垂直排列</h2>
    <div class="doc-demo">
      <NebulaButtonGroup orientation="vertical">
        <NebulaButton variant="primary">操作一</NebulaButton>
        <NebulaButton variant="primary">操作二</NebulaButton>
        <NebulaButton variant="primary">操作三</NebulaButton>
      </NebulaButtonGroup>
    </div>
    <pre><code>&lt;NebulaButtonGroup orientation="vertical"&gt;
  &lt;NebulaButton variant="primary"&gt;操作一&lt;/NebulaButton&gt;
  &lt;NebulaButton variant="primary"&gt;操作二&lt;/NebulaButton&gt;
  &lt;NebulaButton variant="primary"&gt;操作三&lt;/NebulaButton&gt;
&lt;/NebulaButtonGroup&gt;</code></pre>

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
