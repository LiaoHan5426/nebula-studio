<template>
  <div class="doc-section">
    <p>标签组件，用于标记和分类，支持多种变体。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <div class="doc-demo-row">
        <NebulaTag>默认标签</NebulaTag>
        <NebulaTag variant="success">成功</NebulaTag>
        <NebulaTag variant="warning">警告</NebulaTag>
        <NebulaTag variant="danger">危险</NebulaTag>
        <NebulaTag variant="info">信息</NebulaTag>
      </div>
    </div>
    <pre><code>&lt;NebulaTag&gt;默认标签&lt;/NebulaTag&gt;
&lt;NebulaTag variant="success"&gt;成功&lt;/NebulaTag&gt;
&lt;NebulaTag variant="warning"&gt;警告&lt;/NebulaTag&gt;
&lt;NebulaTag variant="danger"&gt;危险&lt;/NebulaTag&gt;
&lt;NebulaTag variant="info"&gt;信息&lt;/NebulaTag&gt;</code></pre>

    <h2>带提示</h2>
    <div class="doc-demo">
      <div class="doc-demo-row">
        <NebulaTag tooltip="这是一个带提示的标签">悬停查看</NebulaTag>
      </div>
    </div>
    <pre><code>&lt;NebulaTag tooltip="这是一个带提示的标签"&gt;悬停查看&lt;/NebulaTag&gt;</code></pre>

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
          <td>标签变体</td>
          <td>
            <code>'default' | 'success' | 'warning' | 'danger' | 'info'</code>
          </td>
          <td><code>'default'</code></td>
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
          <td>标签内容</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { NebulaTag } from '@nebula-studio/nebula-ui';
</script>
