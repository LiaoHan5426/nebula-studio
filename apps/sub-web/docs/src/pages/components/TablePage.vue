<script setup lang="ts">
import Demo from '@/components/Demo.vue';

// eslint-disable-next-line import/no-duplicates
import TableBasicSource from '@/examples/table/TableBasic.vue?raw';
// eslint-disable-next-line import/no-duplicates
import TableStripeSource from '@/examples/table/TableStripe.vue?raw';

import TableBasic from '@/examples/table/TableBasic.vue';
// eslint-disable-next-line import/no-duplicates
import TableStripe from '@/examples/table/TableStripe.vue';
</script>

<template>
  <div class="doc-section">
    <p>表格组件，用于展示结构化数据。</p>

    <h2 id="basic">基础用法</h2>
    <Demo :component="TableBasic" :source="TableBasicSource" />

    <h2 id="stripe">斑马纹</h2>
    <Demo :component="TableStripe" :source="TableStripeSource" />

    <h2>API</h2>
    <h3>NebulaTable Props</h3>
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
          <td><code>data</code></td>
          <td>表格数据</td>
          <td><code>unknown[]</code></td>
          <td><code>[]</code></td>
        </tr>
        <tr>
          <td><code>border</code></td>
          <td>边框模式</td>
          <td><code>boolean | 'full' | 'inner' | 'outer'</code></td>
          <td><code>true</code></td>
        </tr>
        <tr>
          <td><code>stripe</code></td>
          <td>斑马纹</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
        <tr>
          <td><code>loading</code></td>
          <td>加载状态</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
        <tr>
          <td><code>size</code></td>
          <td>表格尺寸</td>
          <td><code>'mini' | 'small' | 'medium'</code></td>
          <td><code>'small'</code></td>
        </tr>
        <tr>
          <td><code>height</code></td>
          <td>表格高度</td>
          <td><code>string | number</code></td>
          <td>—</td>
        </tr>
        <tr>
          <td><code>maxHeight</code></td>
          <td>最大高度</td>
          <td><code>string | number</code></td>
          <td>—</td>
        </tr>
        <tr>
          <td><code>rowKey</code></td>
          <td>行数据 key</td>
          <td><code>string</code></td>
          <td>—</td>
        </tr>
      </tbody>
    </table>
    <h3>NebulaTableColumn Props</h3>
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
          <td><code>field</code></td>
          <td>字段名</td>
          <td><code>string</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>title</code></td>
          <td>列标题</td>
          <td><code>string</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>width</code></td>
          <td>列宽</td>
          <td><code>string | number</code></td>
          <td>—</td>
        </tr>
        <tr>
          <td><code>minWidth</code></td>
          <td>最小宽度</td>
          <td><code>string | number</code></td>
          <td>—</td>
        </tr>
        <tr>
          <td><code>fixed</code></td>
          <td>固定列</td>
          <td><code>'left' | 'right' | ''</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>align</code></td>
          <td>对齐方式</td>
          <td><code>'left' | 'center' | 'right'</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>sortable</code></td>
          <td>是否可排序</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
