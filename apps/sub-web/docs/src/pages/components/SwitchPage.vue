<script setup lang="ts">
import { ref } from 'vue';
import { NebulaSwitch } from '@nebula-studio/nebula-ui';

const switchValue = ref(false);
const switchValue2 = ref(true);
</script>

<template>
  <div class="doc-section">
    <p>开关组件，用于在两种状态之间切换。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <div class="doc-demo-row">
        <NebulaSwitch v-model="switchValue" />
        <NebulaSwitch v-model="switchValue2" label="带标签" />
      </div>
      <p style="margin-top: 8px; font-size: 12px">
        状态: {{ switchValue }}, {{ switchValue2 }}
      </p>
    </div>
    <pre><code>&lt;NebulaSwitch v-model="value" /&gt;
&lt;NebulaSwitch v-model="value" label="带标签" /&gt;</code></pre>

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
          <td><code>tooltip</code></td>
          <td>提示文本</td>
          <td><code>string</code></td>
          <td>—</td>
        </tr>
        <tr>
          <td><code>tooltipPlacement</code></td>
          <td>提示位置</td>
          <td><code>'top' | 'bottom' | 'left' | 'right'</code></td>
          <td><code>'top'</code></td>
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
