<script setup lang="ts">
import Demo from '@/components/Demo.vue';

import iconBasicDemo from '@/examples/icon/IconBasic.vue?demo';
import iconCustomDemo from '@/examples/icon/IconCustom.vue?demo';
import iconPresetDemo from '@/examples/icon/IconPreset.vue?demo';
</script>

<template>
  <div class="doc-section">
    <p>图标组件，支持 Iconify 名称、Vue 组件、URL 和内置图标。</p>

    <h2 id="basic">基础用法</h2>
    <Demo :component="iconBasicDemo.component" :source="iconBasicDemo.source" />

    <h2 id="custom">自定义大小和颜色</h2>
    <Demo
      :component="iconCustomDemo.component"
      :source="iconCustomDemo.source"
    />

    <h2 id="preset">内置图标</h2>
    <Demo
      :component="iconPresetDemo.component"
      :source="iconPresetDemo.source"
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
