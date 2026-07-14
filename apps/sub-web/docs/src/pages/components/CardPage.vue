<script setup lang="ts">
import Demo from '@/components/Demo.vue';

import cardBasicDemo from '@/examples/card/CardBasic.vue?demo';
import cardSimpleDemo from '@/examples/card/CardSimple.vue?demo';
import cardFooterDemo from '@/examples/card/CardFooter.vue?demo';
</script>
<template>
  <div class="doc-section">
    <p>卡片组件，用于信息分组展示。</p>

    <h2 id="basic">基础用法</h2>
    <Demo :component="cardBasicDemo.component" :source="cardBasicDemo.source" />

    <h2 id="simple">仅标题</h2>
    <Demo
      :component="cardSimpleDemo.component"
      :source="cardSimpleDemo.source"
    />

    <h2 id="footer">带 footer 插槽</h2>
    <Demo
      :component="cardFooterDemo.component"
      :source="cardFooterDemo.source"
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
