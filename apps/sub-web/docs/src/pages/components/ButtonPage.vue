<script setup lang="ts">
import { ref } from 'vue';
import { NebulaButton } from '@nebula-studio/nebula-ui';

const loading = ref(false);
function handleClick() {
  loading.value = true;
  setTimeout(() => (loading.value = false), 1500);
}
</script>

<template>
  <div class="doc-section">
    <p>操作按钮，支持多种变体、图标和提示模式。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <div class="doc-demo-row">
        <NebulaButton>默认按钮</NebulaButton>
        <NebulaButton variant="primary">主要按钮</NebulaButton>
        <NebulaButton variant="ghost">幽灵按钮</NebulaButton>
      </div>
    </div>
    <pre><code>&lt;NebulaButton&gt;默认按钮&lt;/NebulaButton&gt;
&lt;NebulaButton variant="primary"&gt;主要按钮&lt;/NebulaButton&gt;
&lt;NebulaButton variant="ghost"&gt;幽灵按钮&lt;/NebulaButton&gt;</code></pre>

    <h2>禁用状态</h2>
    <div class="doc-demo">
      <div class="doc-demo-row">
        <NebulaButton disabled>禁用按钮</NebulaButton>
        <NebulaButton variant="primary" disabled>禁用主要按钮</NebulaButton>
      </div>
    </div>
    <pre><code>&lt;NebulaButton disabled&gt;禁用按钮&lt;/NebulaButton&gt;
&lt;NebulaButton variant="primary" disabled&gt;禁用主要按钮&lt;/NebulaButton&gt;</code></pre>

    <h2>图标按钮</h2>
    <div class="doc-demo">
      <div class="doc-demo-row">
        <NebulaButton icon title="设置">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
            />
          </svg>
        </NebulaButton>
        <NebulaButton variant="primary" :loading="loading" @click="handleClick">
          {{ loading ? '加载中...' : '点击加载' }}
        </NebulaButton>
      </div>
    </div>
    <pre><code>&lt;NebulaButton icon title="设置"&gt;...&lt;/NebulaButton&gt;</code></pre>

    <h2>带提示</h2>
    <div class="doc-demo">
      <div class="doc-demo-row">
        <NebulaButton tooltip="这是一个提示" tooltip-placement="top">
          悬停查看提示
        </NebulaButton>
      </div>
    </div>
    <pre><code>&lt;NebulaButton tooltip="这是一个提示"&gt;悬停查看提示&lt;/NebulaButton&gt;</code></pre>

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
