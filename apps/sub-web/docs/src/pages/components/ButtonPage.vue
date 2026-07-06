<script setup lang="ts">
import Demo from '@/components/Demo.vue';

// eslint-disable-next-line import/no-duplicates
import ButtonBasicSource from '@/examples/button/ButtonBasic.vue?raw';
// eslint-disable-next-line import/no-duplicates
import ButtonDisabledSource from '@/examples/button/ButtonDisabled.vue?raw';
// eslint-disable-next-line import/no-duplicates
import ButtonIconSource from '@/examples/button/ButtonIcon.vue?raw';
// eslint-disable-next-line import/no-duplicates
import ButtonTooltipSource from '@/examples/button/ButtonTooltip.vue?raw';

import ButtonBasic from '@/examples/button/ButtonBasic.vue';
// eslint-disable-next-line import/no-duplicates
import ButtonDisabled from '@/examples/button/ButtonDisabled.vue';
// eslint-disable-next-line import/no-duplicates
import ButtonIcon from '@/examples/button/ButtonIcon.vue';
// eslint-disable-next-line import/no-duplicates
import ButtonTooltip from '@/examples/button/ButtonTooltip.vue';
</script>

<template>
  <div class="doc-section">
    <p>操作按钮，支持多种变体、图标和提示模式。</p>

    <h2 id="basic">基础用法</h2>
    <Demo :component="ButtonBasic" :source="ButtonBasicSource" />

    <h2 id="disabled">禁用状态</h2>
    <Demo :component="ButtonDisabled" :source="ButtonDisabledSource" />

    <h2 id="icon">图标按钮</h2>
    <Demo :component="ButtonIcon" :source="ButtonIconSource" />

    <h2 id="tooltip">带提示</h2>
    <Demo :component="ButtonTooltip" :source="ButtonTooltipSource" />

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
          <td><code>variant</code></td>
          <td>按钮变体</td>
          <td><code>'primary' | 'secondary' | 'ghost'</code></td>
          <td><code>'secondary'</code></td>
        </tr>
        <tr>
          <td><code>type</code></td>
          <td>原生 type 属性</td>
          <td><code>string</code></td>
          <td><code>'button'</code></td>
        </tr>
        <tr>
          <td><code>icon</code></td>
          <td>是否为图标按钮模式</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
        <tr>
          <td><code>disabled</code></td>
          <td>是否禁用</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
        <tr>
          <td><code>active</code></td>
          <td>是否激活状态</td>
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
          <td>按钮内容</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
