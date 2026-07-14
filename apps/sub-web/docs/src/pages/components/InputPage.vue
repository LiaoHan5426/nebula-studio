<script setup lang="ts">
import Demo from '@/components/Demo.vue';

import inputBasicDemo from '@/examples/input/InputBasic.vue?demo';
import inputTypesDemo from '@/examples/input/InputTypes.vue?demo';
import inputDisabledDemo from '@/examples/input/InputDisabled.vue?demo';
import inputTooltipDemo from '@/examples/input/InputTooltip.vue?demo';
</script>

<template>
  <div class="doc-section">
    <p>基础表单输入组件，支持多种输入类型。</p>

    <h2 id="basic">基础用法</h2>
    <Demo
      :component="inputBasicDemo.component"
      :source="inputBasicDemo.source"
    />

    <h2 id="types">输入框类型</h2>
    <Demo
      :component="inputTypesDemo.component"
      :source="inputTypesDemo.source"
    />

    <h2 id="disabled">禁用与只读</h2>
    <Demo
      :component="inputDisabledDemo.component"
      :source="inputDisabledDemo.source"
    />

    <h2 id="tooltip">带提示</h2>
    <Demo
      :component="inputTooltipDemo.component"
      :source="inputTooltipDemo.source"
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
