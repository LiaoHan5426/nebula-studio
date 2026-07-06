<script setup lang="ts">
import { ref } from 'vue';
import { NebulaTreeMenu } from '@nebula-studio/nebula-ui';
import type { NebulaTreeNode } from '@nebula-studio/nebula-ui';

const activeValue = ref('node-1-1');
const treeData: NebulaTreeNode[] = [
  {
    key: 'node-1',
    title: '导航一',
    children: [
      { key: 'node-1-1', title: '选项 1-1' },
      { key: 'node-1-2', title: '选项 1-2' },
    ],
  },
  {
    key: 'node-2',
    title: '导航二',
    children: [
      { key: 'node-2-1', title: '选项 2-1' },
      { key: 'node-2-2', title: '选项 2-2' },
    ],
  },
  {
    key: 'node-3',
    title: '导航三',
  },
];

function handleSelect(value: string) {
  activeValue.value = value;
}
</script>

<template>
  <div>
    <div style="width: 240px">
      <NebulaTreeMenu
        :tree="treeData"
        :active-value="activeValue"
        @select="handleSelect"
      />
    </div>
    <p style="margin-top: 12px">当前选中：{{ activeValue }}</p>
  </div>
</template>
