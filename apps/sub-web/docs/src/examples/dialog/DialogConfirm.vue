<script setup lang="ts">
import { ref } from 'vue';
import { NebulaDialog, NebulaButton } from '@nebula-studio/nebula-ui';

const confirmOpen = ref(false);

function handleConfirm() {
  confirmOpen.value = false;
}
</script>

<template>
  <div>
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
</template>
