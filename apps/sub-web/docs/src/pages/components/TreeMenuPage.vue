<script setup lang="ts">
import { ref } from 'vue';
import { NebulaTreeMenu } from '@nebula-studio/nebula-ui';
import type { NebulaTreeNode } from '@nebula-studio/nebula-ui';

const activeValue = ref('node-1-1');
const treeData: NebulaTreeNode[] = [
  {
    key: 'node-1',
    title: '导航一',
    children: [
      { key: 'node-1-1', title: '选项 1-1' },
      { key: 'node-1-2', title: '选项 1-2' },
    ],
  },
  {
    key: 'node-2',
    title: '导航二',
    children: [
      { key: 'node-2-1', title: '选项 2-1' },
      { key: 'node-2-2', title: '选项 2-2' },
    ],
  },
  {
    key: 'node-3',
    title: '导航三',
  },
];

function handleSelect(value: string) {
  activeValue.value = value;
}
</script>

<template>
  <div class="doc-section">
    <p>树形菜单组件，用于展示层级结构的导航菜单。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <div style="width: 240px">
        <NebulaTreeMenu
          :tree="treeData"
          :active-value="activeValue"
          @select="handleSelect"
        />
      </div>
      <p style="margin-top: 12px">当前选中：{{ activeValue }}</p>
    </div>
    <pre><code>&lt;NebulaTreeMenu :tree="treeData" :active-value="activeValue" @select="handleSelect" /&gt;

const treeData: NebulaTreeNode[] = [
  {
    key: 'node-1',
    title: '导航一',
    children: [
      { key: 'node-1-1', title: '选项 1-1' },
      { key: 'node-1-2', title: '选项 1-2' },
    ],
  },
  { key: 'node-3', title: '导航三' },
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
          <td><code>tree</code></td>
          <td>树形数据</td>
          <td><code>NebulaTreeNode[]</code></td>
          <td><code>[]</code></td>
        </tr>
        <tr>
          <td><code>activeValue</code></td>
          <td>当前激活节点 value</td>
          <td><code>string</code></td>
          <td><code>''</code></td>
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
          <td><code>select</code></td>
          <td>选中节点时触发</td>
          <td><code>(value: string)</code></td>
        </tr>
      </tbody>
    </table>
    <h3>NebulaTreeNode</h3>
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
          <td><code>key</code></td>
          <td>唯一标识</td>
          <td><code>string</code></td>
          <td>是</td>
        </tr>
        <tr>
          <td><code>title</code></td>
          <td>显示文本</td>
          <td><code>string</code></td>
          <td>是</td>
        </tr>
        <tr>
          <td><code>value</code></td>
          <td>节点值（默认使用 key）</td>
          <td><code>string</code></td>
          <td>否</td>
        </tr>
        <tr>
          <td><code>children</code></td>
          <td>子节点</td>
          <td><code>NebulaTreeNode[]</code></td>
          <td>否</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
