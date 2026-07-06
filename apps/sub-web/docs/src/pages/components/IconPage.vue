<script setup lang="ts">
import { NebulaIcon, PRESET_ICONS } from '@nebula-studio/nebula-ui';

const iconNames = Object.keys(PRESET_ICONS).slice(0, 12);
</script>

<template>
  <div class="doc-section">
    <p>图标组件，支持 Iconify 名称、Vue 组件、URL 和内置图标。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <div class="doc-demo-row">
        <NebulaIcon icon="lucide:home" size="24" />
        <NebulaIcon icon="lucide:settings" size="24" />
        <NebulaIcon icon="lucide:user" size="24" />
        <NebulaIcon icon="lucide:search" size="24" />
      </div>
    </div>
    <pre><code>&lt;NebulaIcon icon="lucide:home" size="24" /&gt;
&lt;NebulaIcon icon="lucide:settings" size="24" /&gt;
&lt;NebulaIcon icon="lucide:user" size="24" /&gt;
&lt;NebulaIcon icon="lucide:search" size="24" /&gt;</code></pre>

    <h2>自定义大小和颜色</h2>
    <div class="doc-demo">
      <div class="doc-demo-row">
        <NebulaIcon icon="lucide:heart" size="16" color="red" />
        <NebulaIcon icon="lucide:heart" size="24" color="green" />
        <NebulaIcon icon="lucide:heart" size="32" color="blue" />
        <NebulaIcon icon="lucide:heart" size="40" color="purple" />
      </div>
    </div>
    <pre><code>&lt;NebulaIcon icon="lucide:heart" size="16" color="red" /&gt;
&lt;NebulaIcon icon="lucide:heart" size="24" color="green" /&gt;
&lt;NebulaIcon icon="lucide:heart" size="32" color="blue" /&gt;
&lt;NebulaIcon icon="lucide:heart" size="40" color="purple" /&gt;</code></pre>

    <h2>内置图标</h2>
    <div class="doc-demo">
      <div class="doc-demo-row">
        <NebulaIcon
          v-for="name in iconNames"
          :key="name"
          :icon="name"
          size="24"
        />
      </div>
    </div>
    <pre><code>import { PRESET_ICONS } from '@nebula-studio/nebula-ui';
const iconNames = Object.keys(PRESET_ICONS);
&lt;NebulaIcon v-for="name in iconNames" :key="name" :icon="name" size="24" /&gt;</code></pre>

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
          <td><code>icon</code></td>
          <td>图标来源（Iconify 名 / Vue 组件 / URL / 内置名）</td>
          <td><code>Component | string</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td>图标大小（数值自动加 px）</td>
          <td><code>string | number</code></td>
          <td><code>'1em'</code></td>
        </tr>
        <tr>
          <td><code>color</code></td>
          <td>图标颜色</td>
          <td><code>string</code></td>
          <td><code>'currentColor'</code></td>
        </tr>
        <tr>
          <td><code>fallback</code></td>
          <td>加载失败时显示占位</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
