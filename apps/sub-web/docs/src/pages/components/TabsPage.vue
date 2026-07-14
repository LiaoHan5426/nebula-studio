<script setup lang="ts">
import Demo from '@/components/Demo.vue';

import tabsBasicDemo from '@/examples/tabs/TabsBasic.vue?demo';
import tabsDisabledDemo from '@/examples/tabs/TabsDisabled.vue?demo';
</script>

<template>
  <div class="doc-section">
    <p>选项卡切换组件，支持禁用项。</p>

    <h2 id="basic">基础用法</h2>
    <Demo :component="tabsBasicDemo.component" :source="tabsBasicDemo.source" />

    <h2 id="disabled">禁用标签</h2>
    <Demo
      :component="tabsDisabledDemo.component"
      :source="tabsDisabledDemo.source"
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
          <td><code>modelValue</code></td>
          <td>当前激活的标签 value</td>
          <td><code>string</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>tabs</code></td>
          <td>标签项列表</td>
          <td><code>NebulaTabItem[]</code></td>
          <td><code>[]</code></td>
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
          <td><code>update:modelValue</code></td>
          <td>标签切换时触发</td>
          <td><code>(value: string)</code></td>
        </tr>
      </tbody>
    </table>
    <h3>NebulaTabItem</h3>
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
          <td><code>value</code></td>
          <td>唯一标识</td>
          <td><code>string</code></td>
          <td>是</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td>显示文本</td>
          <td><code>string</code></td>
          <td>是</td>
        </tr>
        <tr>
          <td><code>disabled</code></td>
          <td>是否禁用</td>
          <td><code>boolean</code></td>
          <td>否</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
