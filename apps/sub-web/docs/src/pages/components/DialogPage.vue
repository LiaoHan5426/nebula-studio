<script setup lang="ts">
import Demo from '@/components/Demo.vue';

import dialogBasicDemo from '@/examples/dialog/DialogBasic.vue?demo';
import dialogConfirmDemo from '@/examples/dialog/DialogConfirm.vue?demo';
</script>

<template>
  <div class="doc-section">
    <p>对话框组件，用于弹出提示信息或操作确认。</p>

    <h2 id="basic">基础用法</h2>
    <Demo
      :component="dialogBasicDemo.component"
      :source="dialogBasicDemo.source"
    />

    <h2 id="confirm">确认对话框</h2>
    <Demo
      :component="dialogConfirmDemo.component"
      :source="dialogConfirmDemo.source"
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
          <td><code>description</code></td>
          <td>描述</td>
          <td><code>string</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>contentClass</code></td>
          <td>内容区域自定义类名</td>
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
          <td><code>update:open</code></td>
          <td>显示状态变化</td>
          <td><code>(value: boolean)</code></td>
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
          <td>对话框内容</td>
        </tr>
        <tr>
          <td><code>trigger</code></td>
          <td>触发器元素</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
