<script setup lang="ts">
import { ref } from 'vue';
import { NebulaCheckbox } from '@nebula-studio/nebula-ui';

const checked = ref(false);
const checked2 = ref(true);
</script>

<template>
  <div class="doc-section">
    <p>复选框组件，用于在一组选项中进行多选。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <div class="doc-demo-row">
        <NebulaCheckbox v-model="checked">选项一</NebulaCheckbox>
        <NebulaCheckbox v-model="checked2">选项二（已选中）</NebulaCheckbox>
        <NebulaCheckbox disabled>禁用项</NebulaCheckbox>
      </div>
      <p style="margin-top: 8px; font-size: 12px">
        状态: {{ checked }}, {{ checked2 }}
      </p>
    </div>
    <pre><code>&lt;NebulaCheckbox v-model="checked"&gt;选项一&lt;/NebulaCheckbox&gt;
&lt;NebulaCheckbox disabled&gt;禁用项&lt;/NebulaCheckbox&gt;</code></pre>

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
          <td>绑定值</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td>标签文本</td>
          <td><code>string</code></td>
          <td>—</td>
        </tr>
        <tr>
          <td><code>disabled</code></td>
          <td>是否禁用</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
        <tr>
          <td><code>tooltip</code></td>
          <td>提示文本</td>
          <td><code>string</code></td>
          <td>—</td>
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
          <td>值变更时触发</td>
          <td><code>(value: boolean) => void</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
