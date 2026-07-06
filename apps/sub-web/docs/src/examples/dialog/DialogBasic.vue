<script setup lang="ts">
import { ref } from 'vue';
import { NebulaDialog, NebulaButton } from '@nebula-studio/nebula-ui';

const dialogOpen = ref(false);
</script>

<template>
  <div>
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
</template>
