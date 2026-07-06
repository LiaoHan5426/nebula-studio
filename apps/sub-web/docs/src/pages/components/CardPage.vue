<script setup lang="ts">
import Demo from '@/components/Demo.vue';

// eslint-disable-next-line import/no-duplicates
import CardBasicSource from '@/examples/card/CardBasic.vue?raw';
// eslint-disable-next-line import/no-duplicates
import CardSimpleSource from '@/examples/card/CardSimple.vue?raw';
// eslint-disable-next-line import/no-duplicates
import CardFooterSource from '@/examples/card/CardFooter.vue?raw';

import CardBasic from '@/examples/card/CardBasic.vue';
// eslint-disable-next-line import/no-duplicates
import CardSimple from '@/examples/card/CardSimple.vue';
// eslint-disable-next-line import/no-duplicates
import CardFooter from '@/examples/card/CardFooter.vue';
</script>
<template>
  <div class="doc-section">
    <p>卡片组件，用于信息分组展示。</p>

    <h2 id="basic">基础用法</h2>
    <Demo :component="CardBasic" :source="CardBasicSource" />

    <h2 id="simple">仅标题</h2>
    <Demo :component="CardSimple" :source="CardSimpleSource" />

    <h2 id="footer">带 footer 插槽</h2>
    <Demo :component="CardFooter" :source="CardFooterSource" />

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
