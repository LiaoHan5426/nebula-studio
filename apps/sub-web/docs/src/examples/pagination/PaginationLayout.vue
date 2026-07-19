<script setup lang="ts">
import { ref } from 'vue';
import { NebulaPagination } from '@nebula-studio/nebula-ui';

const page = ref(4);
</script>

<template>
  <div class="pagination-layout-demo">
    <p>左对齐</p>
    <NebulaPagination v-model="page" :total="120" align="start" />
    <p>居中</p>
    <NebulaPagination v-model="page" :total="120" align="center" />
    <p>右对齐</p>
    <NebulaPagination v-model="page" :total="120" align="end" />
    <p>两端布局（可调整模块顺序）</p>
    <NebulaPagination
      v-model="page"
      :total="120"
      align="between"
      :layout="['total', 'pager', 'jumper']"
    />
  </div>
</template>

<style scoped>
.pagination-layout-demo {
  display: grid;
  gap: 10px;
  width: 100%;
}

.pagination-layout-demo p {
  margin: 8px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
}
</style>
