<script setup lang="ts">
import Demo from '@/components/Demo.vue';

// eslint-disable-next-line import/no-duplicates
import DropdownBasicSource from '@/examples/dropdown/DropdownBasic.vue?raw';
// eslint-disable-next-line import/no-duplicates
import DropdownDividerSource from '@/examples/dropdown/DropdownDivider.vue?raw';

import DropdownBasic from '@/examples/dropdown/DropdownBasic.vue';
import DropdownDivider from '@/examples/dropdown/DropdownDivider.vue';
</script>

<template>
  <div class="doc-section">
    <p>下拉菜单组件，用于展示操作菜单列表。</p>

    <h2 id="basic">基础用法</h2>
    <Demo :component="DropdownBasic" :source="DropdownBasicSource" />

    <h2 id="divider">带分割线和禁用</h2>
    <Demo :component="DropdownDivider" :source="DropdownDividerSource" />

    <h2>API</h2>
    <h3>NebulaDropdown Props</h3>
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
          <td>是否展开（v-model:open）</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
        <tr>
          <td><code>placement</code></td>
          <td>弹出位置</td>
          <td><code>'bottom-end' | 'bottom-start'</code></td>
          <td><code>'bottom-end'</code></td>
        </tr>
        <tr>
          <td><code>offset</code></td>
          <td>偏移量</td>
          <td><code>number</code></td>
          <td><code>8</code></td>
        </tr>
      </tbody>
    </table>
    <h3>NebulaDropdownItem Props</h3>
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
          <td><code>disabled</code></td>
          <td>是否禁用</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
        <tr>
          <td><code>shortcut</code></td>
          <td>快捷键提示</td>
          <td><code>string</code></td>
          <td><code>''</code></td>
        </tr>
      </tbody>
    </table>
    <h3>NebulaDropdownItem Events</h3>
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
          <td><code>click</code></td>
          <td>点击时触发</td>
          <td><code>(event: MouseEvent)</code></td>
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
          <td><code>trigger</code></td>
          <td>触发元素</td>
        </tr>
        <tr>
          <td><code>default</code></td>
          <td>菜单内容</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
