<script setup lang="ts">
import Demo from '@/components/Demo.vue';

// eslint-disable-next-line import/no-duplicates
import PaginationBasicSource from '@/examples/pagination/PaginationBasic.vue?raw';
// eslint-disable-next-line import/no-duplicates
import PaginationSizesSource from '@/examples/pagination/PaginationSizes.vue?raw';

import PaginationBasic from '@/examples/pagination/PaginationBasic.vue';
import PaginationSizes from '@/examples/pagination/PaginationSizes.vue';
</script>

<template>
  <div class="doc-section">
    <p>分页导航组件，支持页码切换和每页条数设置。</p>

    <h2 id="basic">基础用法</h2>
    <Demo :component="PaginationBasic" :source="PaginationBasicSource" />

    <h2 id="sizes">自定义每页条数</h2>
    <Demo :component="PaginationSizes" :source="PaginationSizesSource" />

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
          <td>当前页码（v-model）</td>
          <td><code>number</code></td>
          <td><code>1</code></td>
        </tr>
        <tr>
          <td><code>total</code></td>
          <td>数据总条数</td>
          <td><code>number</code></td>
          <td><code>0</code></td>
        </tr>
        <tr>
          <td><code>pageSize</code></td>
          <td>每页条数（v-model:page-size）</td>
          <td><code>number</code></td>
          <td><code>10</code></td>
        </tr>
        <tr>
          <td><code>pageSizes</code></td>
          <td>每页条数选项</td>
          <td><code>number[]</code></td>
          <td><code>[10, 20, 50, 100]</code></td>
        </tr>
        <tr>
          <td><code>showSizeChanger</code></td>
          <td>是否显示条数切换</td>
          <td><code>boolean</code></td>
          <td><code>true</code></td>
        </tr>
        <tr>
          <td><code>disabled</code></td>
          <td>是否禁用</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
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
          <td>页码变化</td>
          <td><code>(page: number)</code></td>
        </tr>
        <tr>
          <td><code>update:pageSize</code></td>
          <td>每页条数变化</td>
          <td><code>(size: number)</code></td>
        </tr>
        <tr>
          <td><code>change</code></td>
          <td>页码或条数变化</td>
          <td><code>({ page, pageSize })</code></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
