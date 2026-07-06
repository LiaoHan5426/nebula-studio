<script setup lang="ts">
import { ref } from 'vue';
import { NebulaTabs } from '@nebula-studio/nebula-ui';
import type { NebulaTabItem } from '@nebula-studio/nebula-ui';

const activeTab = ref('tab1');
const tabs: NebulaTabItem[] = [
  { value: 'tab1', label: '标签一' },
  { value: 'tab2', label: '标签二' },
  { value: 'tab3', label: '标签三' },
];

const tabsWithDisabled: NebulaTabItem[] = [
  { value: 'a', label: '可用' },
  { value: 'b', label: '禁用', disabled: true },
  { value: 'c', label: '其他' },
];
const activeTab2 = ref('a');
</script>

<template>
  <div class="doc-section">
    <p>选项卡切换组件，支持禁用项。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <NebulaTabs v-model="activeTab" :tabs="tabs" />
      <p style="margin-top: 12px">当前选中标签：{{ activeTab }}</p>
    </div>
    <pre><code>&lt;NebulaTabs v-model="activeTab" :tabs="tabs" /&gt;

// tabs 数据
const tabs: NebulaTabItem[] = [
  { value: 'tab1', label: '标签一' },
  { value: 'tab2', label: '标签二' },
  { value: 'tab3', label: '标签三' },
];</code></pre>

    <h2>禁用标签</h2>
    <div class="doc-demo">
      <NebulaTabs v-model="activeTab2" :tabs="tabsWithDisabled" />
    </div>
    <pre><code>const tabs: NebulaTabItem[] = [
  { value: 'a', label: '可用' },
  { value: 'b', label: '禁用', disabled: true },
  { value: 'c', label: '其他' },
];
&lt;NebulaTabs v-model="active" :tabs="tabs" /&gt;</code></pre>

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
