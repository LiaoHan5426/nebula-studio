<script setup lang="ts">
import { ref } from 'vue';
import { NebulaAnchor } from '@nebula-studio/nebula-ui';
import type { NebulaAnchorItem } from '@nebula-studio/nebula-ui';

const anchorItems: NebulaAnchorItem[] = [
  { id: 'basic', label: '基础用法' },
  { id: 'custom', label: '自定义标题' },
  { id: 'scroll', label: '滚动追踪' },
  { id: 'api', label: 'API' },
];
const activeAnchor = ref('basic');
</script>

<template>
  <div class="doc-section">
    <p>锚点导航组件，用于页面内锚点跳转和滚动追踪。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <div style="display: flex; gap: 24px">
        <NebulaAnchor :items="anchorItems" :track-scroll="false" />
        <div style="flex: 1">
          <p>点击左侧导航项可跳转到对应锚点。</p>
        </div>
      </div>
    </div>
    <pre><code>&lt;NebulaAnchor :items="items" :track-scroll="false" /&gt;

const items: NebulaAnchorItem[] = [
  { id: 'basic', label: '基础用法' },
  { id: 'custom', label: '自定义标题' },
  { id: 'scroll', label: '滚动追踪' },
  { id: 'api', label: 'API' },
];</code></pre>

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
          <td><code>items</code></td>
          <td>导航项列表</td>
          <td><code>NebulaAnchorItem[]</code></td>
          <td><code>[]</code></td>
        </tr>
        <tr>
          <td><code>title</code></td>
          <td>导航标题</td>
          <td><code>string</code></td>
          <td><code>'On this page'</code></td>
        </tr>
        <tr>
          <td><code>trackScroll</code></td>
          <td>是否追踪滚动位置</td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
        </tr>
        <tr>
          <td><code>backTop</code></td>
          <td>显示回到顶部按钮</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
        <tr>
          <td><code>backTopMode</code></td>
          <td>回到顶部模式</td>
          <td><code>'inline' | 'float'</code></td>
          <td><code>'inline'</code></td>
        </tr>
        <tr>
          <td><code>backTopText</code></td>
          <td>回到顶部文本</td>
          <td><code>string</code></td>
          <td><code>'Back to top'</code></td>
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
          <td><code>update:activeId</code></td>
          <td>当前激活项变化</td>
          <td><code>(id: string)</code></td>
        </tr>
        <tr>
          <td><code>back-top</code></td>
          <td>点击回到顶部</td>
          <td>—</td>
        </tr>
      </tbody>
    </table>
    <h3>NebulaAnchorItem</h3>
    <table>
      <thead>
        <tr>
          <th>属性</th>
          <th>说明</th>
          <th>类型</th>
          <th>必填</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>id</code></td>
          <td>锚点 ID</td>
          <td><code>string</code></td>
          <td>是</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td>显示文本</td>
          <td><code>string</code></td>
          <td>是</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
