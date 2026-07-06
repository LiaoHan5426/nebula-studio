<script setup lang="ts">
import { ref } from 'vue';
import { NebulaDialog, NebulaButton } from '@nebula-studio/nebula-ui';

const dialogOpen = ref(false);
const confirmOpen = ref(false);

function handleConfirm() {
  confirmOpen.value = false;
}
</script>

<template>
  <div class="doc-section">
    <p>对话框组件，用于弹出提示信息或操作确认。</p>

    <h2>基础用法</h2>
    <div class="doc-demo">
      <NebulaButton @click="dialogOpen = true">打开对话框</NebulaButton>
      <NebulaDialog
        v-model:open="dialogOpen"
        title="提示"
        description="这是一个基础对话框"
      >
        <p>这里是对话框的内容区域。</p>
        <div style="margin-top: 16px; text-align: right">
          <NebulaButton variant="ghost" @click="dialogOpen = false"
            >取消</NebulaButton
          >
          <NebulaButton
            variant="primary"
            style="margin-left: 8px"
            @click="dialogOpen = false"
            >确定</NebulaButton
          >
        </div>
      </NebulaDialog>
    </div>
    <pre><code>&lt;NebulaButton @click="dialogOpen = true"&gt;打开对话框&lt;/NebulaButton&gt;
&lt;NebulaDialog v-model:open="dialogOpen" title="提示" description="这是一个基础对话框"&gt;
  &lt;p&gt;这里是对话框的内容区域。&lt;/p&gt;
&lt;/NebulaDialog&gt;</code></pre>

    <h2>确认对话框</h2>
    <div class="doc-demo">
      <NebulaButton variant="primary" @click="confirmOpen = true"
        >删除确认</NebulaButton
      >
      <NebulaDialog
        v-model:open="confirmOpen"
        title="确认删除"
        description="此操作不可撤销"
      >
        <p>确定要删除这条记录吗？</p>
        <div style="margin-top: 16px; text-align: right">
          <NebulaButton variant="ghost" @click="confirmOpen = false"
            >取消</NebulaButton
          >
          <NebulaButton
            variant="primary"
            style="margin-left: 8px"
            @click="handleConfirm"
            >删除</NebulaButton
          >
        </div>
      </NebulaDialog>
    </div>
    <pre><code>&lt;NebulaDialog v-model:open="open" title="确认删除" description="此操作不可撤销"&gt;
  &lt;p&gt;确定要删除这条记录吗？&lt;/p&gt;
&lt;/NebulaDialog&gt;</code></pre>

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
          <td><code>description</code></td>
          <td>描述</td>
          <td><code>string</code></td>
          <td><code>''</code></td>
        </tr>
        <tr>
          <td><code>contentClass</code></td>
          <td>内容区域自定义类名</td>
          <td><code>string</code></td>
          <td><code>''</code></td>
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
          <td>对话框内容</td>
        </tr>
        <tr>
          <td><code>trigger</code></td>
          <td>触发器元素</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
