<script setup lang="ts">
import { NebulaTable, NebulaTableColumn } from '@nebula-studio/nebula-ui';

const tableData = [
  { id: 1, name: '张三', age: 28, address: '北京市朝阳区' },
  { id: 2, name: '李四', age: 32, address: '上海市浦东新区' },
  { id: 3, name: '王五', age: 25, address: '广州市天河区' },
  { id: 4, name: '赵六', age: 30, address: '深圳市南山区' },
];
</script>

<template>
  <div class="doc-section">
    <p>表格组件，用于展示结构化数据。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <NebulaTable :data="tableData" :border="true">
        <NebulaTableColumn field="id" title="ID" :width="80" />
        <NebulaTableColumn field="name" title="姓名" />
        <NebulaTableColumn field="age" title="年龄" :width="100" />
        <NebulaTableColumn field="address" title="地址" />
      </NebulaTable>
    </div>
    <pre><code>&lt;NebulaTable :data="tableData" :border="true"&gt;
  &lt;NebulaTableColumn field="id" title="ID" :width="80" /&gt;
  &lt;NebulaTableColumn field="name" title="姓名" /&gt;
  &lt;NebulaTableColumn field="age" title="年龄" :width="100" /&gt;
  &lt;NebulaTableColumn field="address" title="地址" /&gt;
&lt;/NebulaTable&gt;</code></pre>

    <h2>斑马纹</h2>
    <div class="doc-demo">
      <NebulaTable :data="tableData" :stripe="true" :border="false">
        <NebulaTableColumn field="id" title="ID" :width="80" />
        <NebulaTableColumn field="name" title="姓名" />
        <NebulaTableColumn field="age" title="年龄" :width="100" />
        <NebulaTableColumn field="address" title="地址" />
      </NebulaTable>
    </div>
    <pre><code>&lt;NebulaTable :data="tableData" :stripe="true" :border="false"&gt;
  &lt;NebulaTableColumn field="id" title="ID" /&gt;
  &lt;NebulaTableColumn field="name" title="姓名" /&gt;
  ...
&lt;/NebulaTable&gt;</code></pre>

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
