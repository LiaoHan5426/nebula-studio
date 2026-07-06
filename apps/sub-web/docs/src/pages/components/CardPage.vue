<template>
  <div class="doc-section">
    <p>卡片组件，用于信息分组展示。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <NebulaCard title="卡片标题" description="这是卡片描述">
        <p>这是卡片内容区域。</p>
      </NebulaCard>
    </div>
    <pre><code>&lt;NebulaCard title="卡片标题" description="这是卡片描述"&gt;
  &lt;p&gt;这是卡片内容区域。&lt;/p&gt;
&lt;/NebulaCard&gt;</code></pre>

    <h2>仅标题</h2>
    <div class="doc-demo">
      <NebulaCard title="简洁卡片">
        <p>只有标题和内容的卡片。</p>
      </NebulaCard>
    </div>
    <pre><code>&lt;NebulaCard title="简洁卡片"&gt;
  &lt;p&gt;只有标题和内容的卡片。&lt;/p&gt;
&lt;/NebulaCard&gt;</code></pre>

    <h2>带 footer 插槽</h2>
    <div class="doc-demo">
      <NebulaCard title="带底部">
        <p>卡片内容</p>
        <template #footer>
          <div style="display: flex; gap: 8px; justify-content: flex-end">
            <NebulaButton>取消</NebulaButton>
            <NebulaButton variant="primary">确认</NebulaButton>
          </div>
        </template>
      </NebulaCard>
    </div>
    <pre><code>&lt;NebulaCard title="带底部"&gt;
  &lt;p&gt;卡片内容&lt;/p&gt;
  &lt;template #footer&gt;
    &lt;NebulaButton&gt;取消&lt;/NebulaButton&gt;
    &lt;NebulaButton variant="primary"&gt;确认&lt;/NebulaButton&gt;
  &lt;/template&gt;
&lt;/NebulaCard&gt;</code></pre>

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
          <td><code>title</code></td>
          <td>卡片标题</td>
          <td><code>string</code></td>
          <td>—</td>
        </tr>
        <tr>
          <td><code>description</code></td>
          <td>卡片描述</td>
          <td><code>string</code></td>
          <td>—</td>
        </tr>
        <tr>
          <td><code>class</code></td>
          <td>自定义类名</td>
          <td><code>string</code></td>
          <td>—</td>
        </tr>
        <tr>
          <td><code>contentClass</code></td>
          <td>内容区域自定义类名</td>
          <td><code>string</code></td>
          <td>—</td>
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
          <td>卡片内容</td>
        </tr>
        <tr>
          <td><code>footer</code></td>
          <td>卡片底部</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { NebulaButton, NebulaCard } from '@nebula-studio/nebula-ui';
</script>
