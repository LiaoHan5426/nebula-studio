<script setup lang="ts">
import Demo from '@/components/Demo.vue';

// eslint-disable-next-line import/no-duplicates
import DrawerBasicSource from '@/examples/drawer/DrawerBasic.vue?raw';
// eslint-disable-next-line import/no-duplicates
import DrawerLeftSource from '@/examples/drawer/DrawerLeft.vue?raw';

import DrawerBasic from '@/examples/drawer/DrawerBasic.vue';
import DrawerLeft from '@/examples/drawer/DrawerLeft.vue';
</script>

<template>
  <div class="doc-section">
    <p>抽屉组件，从屏幕边缘滑出的浮层面板。</p>

    <h2 id="basic">基础用法</h2>
    <Demo :component="DrawerBasic" :source="DrawerBasicSource" />

    <h2 id="left">左侧抽屉</h2>
    <Demo :component="DrawerLeft" :source="DrawerLeftSource" />

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
          <td><code>open</code></td>
          <td>是否显示（v-model:open）</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
        <tr>
          <td><code>title</code></td>
          <td>标题</td>
          <td><code>string</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>subtitle</code></td>
          <td>副标题</td>
          <td><code>string</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>width</code></td>
          <td>抽屉宽度</td>
          <td><code>string</code></td>
          <td><code>'380px'</code></td>
        </tr>
        <tr>
          <td><code>placement</code></td>
          <td>弹出方向</td>
          <td><code>'right' | 'left'</code></td>
          <td><code>'right'</code></td>
        </tr>
      </tbody>
    </table>
    <h3>Events</h3>
    <table>
      <thead>
        <tr>
          <th>事件名</th>
          <th>说明</th>
          <th>回调参数</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>update:open</code></td>
          <td>显示状态变化</td>
          <td><code>(value: boolean)</code></td>
        </tr>
        <tr>
          <td><code>close</code></td>
          <td>关闭时触发</td>
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
          <td>抽屉内容</td>
        </tr>
        <tr>
          <td><code>header</code></td>
          <td>自定义头部</td>
        </tr>
        <tr>
          <td><code>footer</code></td>
          <td>底部区域</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
