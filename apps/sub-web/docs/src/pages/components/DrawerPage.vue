<script setup lang="ts">
import { ref } from 'vue';
import { NebulaDrawer, NebulaButton } from '@nebula-studio/nebula-ui';

const drawerOpen = ref(false);
const leftDrawer = ref(false);
</script>

<template>
  <div class="doc-section">
    <p>抽屉组件，从屏幕边缘滑出的浮层面板。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <NebulaButton @click="drawerOpen = true">打开右侧抽屉</NebulaButton>
      <NebulaDrawer
        v-model:open="drawerOpen"
        title="抽屉标题"
        subtitle="副标题说明"
      >
        <p>这里是抽屉的内容区域。</p>
        <p style="margin-top: 8px">可以在这里放置任意内容。</p>
      </NebulaDrawer>
    </div>
    <pre><code>&lt;NebulaButton @click="drawerOpen = true"&gt;打开右侧抽屉&lt;/NebulaButton&gt;
&lt;NebulaDrawer v-model:open="drawerOpen" title="抽屉标题" subtitle="副标题说明"&gt;
  &lt;p&gt;这里是抽屉的内容区域。&lt;/p&gt;
&lt;/NebulaDrawer&gt;</code></pre>

    <h2>左侧抽屉</h2>
    <div class="doc-demo">
      <NebulaButton variant="primary" @click="leftDrawer = true"
        >打开左侧抽屉</NebulaButton
      >
      <NebulaDrawer
        v-model:open="leftDrawer"
        title="左侧抽屉"
        placement="left"
        width="320px"
      >
        <p>从左侧滑出的抽屉面板。</p>
      </NebulaDrawer>
    </div>
    <pre><code>&lt;NebulaDrawer v-model:open="open" title="左侧抽屉" placement="left" width="320px"&gt;
  &lt;p&gt;从左侧滑出的抽屉面板。&lt;/p&gt;
&lt;/NebulaDrawer&gt;</code></pre>

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
          <td><code>open</code></td>
          <td>是否显示（v-model:open）</td>
          <td><code>boolean</code></td>
          <td><code>false</code></td>
        </tr>
        <tr>
          <td><code>title</code></td>
          <td>标题</td>
          <td><code>string</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>subtitle</code></td>
          <td>副标题</td>
          <td><code>string</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>width</code></td>
          <td>抽屉宽度</td>
          <td><code>string</code></td>
          <td><code>'380px'</code></td>
        </tr>
        <tr>
          <td><code>placement</code></td>
          <td>弹出方向</td>
          <td><code>'right' | 'left'</code></td>
          <td><code>'right'</code></td>
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
          <td><code>update:open</code></td>
          <td>显示状态变化</td>
          <td><code>(value: boolean)</code></td>
        </tr>
        <tr>
          <td><code>close</code></td>
          <td>关闭时触发</td>
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
          <td>抽屉内容</td>
        </tr>
        <tr>
          <td><code>header</code></td>
          <td>自定义头部</td>
        </tr>
        <tr>
          <td><code>footer</code></td>
          <td>底部区域</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
