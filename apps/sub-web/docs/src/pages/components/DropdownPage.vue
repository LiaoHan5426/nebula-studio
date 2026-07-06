<script setup lang="ts">
import { ref } from 'vue';
import {
  NebulaDropdown,
  NebulaDropdownItem,
  NebulaDropdownDivider,
  NebulaButton,
} from '@nebula-studio/nebula-ui';

const dropdownOpen = ref(false);
</script>

<template>
  <div class="doc-section">
    <p>下拉菜单组件，用于展示操作菜单列表。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <NebulaDropdown v-model:open="dropdownOpen">
        <template #trigger>
          <NebulaButton>下拉菜单 ▾</NebulaButton>
        </template>
        <NebulaDropdownItem>选项一</NebulaDropdownItem>
        <NebulaDropdownItem>选项二</NebulaDropdownItem>
        <NebulaDropdownItem>选项三</NebulaDropdownItem>
      </NebulaDropdown>
    </div>
    <pre><code>&lt;NebulaDropdown&gt;
  &lt;template #trigger&gt;
    &lt;NebulaButton&gt;下拉菜单 ▾&lt;/NebulaButton&gt;
  &lt;/template&gt;
  &lt;NebulaDropdownItem&gt;选项一&lt;/NebulaDropdownItem&gt;
  &lt;NebulaDropdownItem&gt;选项二&lt;/NebulaDropdownItem&gt;
  &lt;NebulaDropdownItem&gt;选项三&lt;/NebulaDropdownItem&gt;
&lt;/NebulaDropdown&gt;</code></pre>

    <h2>带分割线和禁用</h2>
    <div class="doc-demo">
      <NebulaDropdown placement="bottom-start">
        <template #trigger>
          <NebulaButton variant="primary">操作菜单 ▾</NebulaButton>
        </template>
        <NebulaDropdownItem>编辑</NebulaDropdownItem>
        <NebulaDropdownItem>复制</NebulaDropdownItem>
        <NebulaDropdownDivider />
        <NebulaDropdownItem disabled>删除</NebulaDropdownItem>
      </NebulaDropdown>
    </div>
    <pre><code>&lt;NebulaDropdown placement="bottom-start"&gt;
  &lt;template #trigger&gt;
    &lt;NebulaButton variant="primary"&gt;操作菜单 ▾&lt;/NebulaButton&gt;
  &lt;/template&gt;
  &lt;NebulaDropdownItem&gt;编辑&lt;/NebulaDropdownItem&gt;
  &lt;NebulaDropdownItem&gt;复制&lt;/NebulaDropdownItem&gt;
  &lt;NebulaDropdownDivider /&gt;
  &lt;NebulaDropdownItem disabled&gt;删除&lt;/NebulaDropdownItem&gt;
&lt;/NebulaDropdown&gt;</code></pre>

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
