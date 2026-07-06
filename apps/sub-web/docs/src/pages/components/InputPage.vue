<script setup lang="ts">
import { ref } from 'vue';
import { NebulaInput } from '@nebula-studio/nebula-ui';

const textValue = ref('');
const passwordValue = ref('');
const disabledValue = ref('禁用状态');
</script>

<template>
  <div class="doc-section">
    <p>基础表单输入组件，支持多种输入类型。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <NebulaInput v-model="textValue" placeholder="请输入内容" />
      <p style="margin-top: 8px; font-size: 12px">
        当前值: {{ textValue || '空' }}
      </p>
    </div>
    <pre><code>&lt;NebulaInput v-model="value" placeholder="请输入内容" /&gt;</code></pre>

    <h2>输入框类型</h2>
    <div class="doc-demo">
      <NebulaInput type="text" placeholder="文本输入" />
      <NebulaInput type="password" placeholder="密码输入" />
      <NebulaInput type="email" placeholder="邮箱输入" />
      <NebulaInput type="number" placeholder="数字输入" />
    </div>
    <pre><code>&lt;NebulaInput type="text" placeholder="文本输入" /&gt;
&lt;NebulaInput type="password" placeholder="密码输入" /&gt;
&lt;NebulaInput type="email" placeholder="邮箱输入" /&gt;
&lt;NebulaInput type="number" placeholder="数字输入" /&gt;</code></pre>

    <h2>禁用与只读</h2>
    <div class="doc-demo">
      <NebulaInput v-model="disabledValue" disabled />
      <NebulaInput readonly value="只读状态" />
    </div>
    <pre><code>&lt;NebulaInput disabled value="禁用状态" /&gt;
&lt;NebulaInput readonly value="只读状态" /&gt;</code></pre>

    <h2>带提示</h2>
    <div class="doc-demo">
      <NebulaInput placeholder="悬停查看提示" tooltip="这是输入提示" />
    </div>
    <pre><code>&lt;NebulaInput placeholder="悬停查看提示" tooltip="这是输入提示" /&gt;</code></pre>

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
          <td><code>string | number</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>type</code></td>
          <td>输入框类型</td>
          <td>
            <code
              >'text' | 'password' | 'email' | 'number' | 'tel' | 'url'</code
            >
          </td>
          <td><code>'text'</code></td>
        </tr>
        <tr>
          <td><code>placeholder</code></td>
          <td>占位文本</td>
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
          <td><code>readonly</code></td>
          <td>是否只读</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
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
          <td><code>(value: string) => void</code></td>
        </tr>
        <tr>
          <td><code>input</code></td>
          <td>输入时触发</td>
          <td><code>(event: Event) => void</code></td>
        </tr>
        <tr>
          <td><code>change</code></td>
          <td>值变更且失去焦点时触发</td>
          <td><code>(event: Event) => void</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
