<script setup lang="ts">
import Demo from '@/components/Demo.vue';

import avatarBasicDemo from '@/examples/avatar/AvatarBasic.vue?demo';
import avatarSizeDemo from '@/examples/avatar/AvatarSize.vue?demo';
import avatarOnlineDemo from '@/examples/avatar/AvatarOnline.vue?demo';
</script>

<template>
  <div class="doc-section">
    <p>头像组件，支持图片、文字和图标三种形式。</p>

    <h2 id="basic">基础用法</h2>
    <Demo
      :component="avatarBasicDemo.component"
      :source="avatarBasicDemo.source"
    />

    <h2 id="sizes">不同尺寸</h2>
    <Demo
      :component="avatarSizeDemo.component"
      :source="avatarSizeDemo.source"
    />

    <h2 id="online">用户状态</h2>
    <Demo
      :component="avatarOnlineDemo.component"
      :source="avatarOnlineDemo.source"
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
          <td>兼容旧版在线状态指示</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
        <tr>
          <td><code>status</code></td>
          <td>用户状态指示</td>
          <td><code>'online' | 'offline' | 'away' | 'busy'</code></td>
          <td>—</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
