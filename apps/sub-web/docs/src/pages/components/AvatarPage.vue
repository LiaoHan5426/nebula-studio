<script setup lang="ts">
import Demo from '@/components/Demo.vue';

// eslint-disable-next-line import/no-duplicates
import AvatarBasicSource from '@/examples/avatar/AvatarBasic.vue?raw';
// eslint-disable-next-line import/no-duplicates
import AvatarSizeSource from '@/examples/avatar/AvatarSize.vue?raw';
// eslint-disable-next-line import/no-duplicates
import AvatarOnlineSource from '@/examples/avatar/AvatarOnline.vue?raw';

import AvatarBasic from '@/examples/avatar/AvatarBasic.vue';
// eslint-disable-next-line import/no-duplicates
import AvatarSize from '@/examples/avatar/AvatarSize.vue';
// eslint-disable-next-line import/no-duplicates
import AvatarOnline from '@/examples/avatar/AvatarOnline.vue';
</script>

<template>
  <div class="doc-section">
    <p>头像组件，支持图片、文字和图标三种形式。</p>

    <h2 id="basic">基础用法</h2>
    <Demo :component="AvatarBasic" :source="AvatarBasicSource" />

    <h2 id="sizes">不同尺寸</h2>
    <Demo :component="AvatarSize" :source="AvatarSizeSource" />

    <h2 id="online">在线状态</h2>
    <Demo :component="AvatarOnline" :source="AvatarOnlineSource" />

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
