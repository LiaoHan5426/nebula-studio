<script setup lang="ts">
import Demo from '@/components/Demo.vue';

import treeMenuBasicDemo from '@/examples/tree-menu/TreeMenuBasic.vue?demo';
</script>

<template>
  <div class="doc-section">
    <p>树形菜单组件，用于展示层级结构的导航菜单。</p>

    <h2 id="basic">基础用法</h2>
    <Demo
      :component="treeMenuBasicDemo.component"
      :source="treeMenuBasicDemo.source"
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
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>key</code></td>
          <td>唯一标识</td>
          <td><code>string</code></td>
        </tr>
        <tr>
          <td><code>title</code></td>
          <td>显示文本</td>
          <td><code>string</code></td>
        </tr>
        <tr>
          <td><code>children</code></td>
          <td>子节点</td>
          <td><code>NebulaTreeNode[]</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
