<script setup lang="ts">
import { NebulaAvatar } from '@nebula-studio/nebula-ui';
</script>

<template>
  <div class="doc-section">
    <p>头像组件，支持图片、文字和图标三种形式。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <div class="doc-demo-row">
        <NebulaAvatar text="张" />
        <NebulaAvatar text="李" />
        <NebulaAvatar text="王" />
      </div>
    </div>
    <pre><code>&lt;NebulaAvatar text="张" /&gt;
&lt;NebulaAvatar text="李" /&gt;
&lt;NebulaAvatar text="王" /&gt;</code></pre>

    <h2>不同尺寸</h2>
    <div class="doc-demo">
      <div class="doc-demo-row">
        <NebulaAvatar text="小" size="sm" />
        <NebulaAvatar text="中" size="md" />
        <NebulaAvatar text="大" size="lg" />
      </div>
    </div>
    <pre><code>&lt;NebulaAvatar text="小" size="sm" /&gt;
&lt;NebulaAvatar text="中" size="md" /&gt;
&lt;NebulaAvatar text="大" size="lg" /&gt;</code></pre>

    <h2>在线状态</h2>
    <div class="doc-demo">
      <div class="doc-demo-row">
        <NebulaAvatar text="在" :online="true" />
        <NebulaAvatar text="离" :online="false" />
      </div>
    </div>
    <pre><code>&lt;NebulaAvatar text="在" :online="true" /&gt;
&lt;NebulaAvatar text="离" :online="false" /&gt;</code></pre>

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
          <td><code>src</code></td>
          <td>图片地址</td>
          <td><code>string</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>alt</code></td>
          <td>图片描述</td>
          <td><code>string</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>text</code></td>
          <td>文字内容（无图片时显示）</td>
          <td><code>string</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td>头像大小</td>
          <td><code>'sm' | 'md' | 'lg'</code></td>
          <td><code>'md'</code></td>
        </tr>
        <tr>
          <td><code>online</code></td>
          <td>在线状态指示</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
