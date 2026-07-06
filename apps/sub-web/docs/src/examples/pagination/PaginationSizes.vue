<script setup lang="ts">
import { ref } from 'vue';
import { NebulaPagination } from '@nebula-studio/nebula-ui';

const currentPage = ref(1);
const pageSize = ref(10);
</script>

<template>
  <div>
    <NebulaPagination
      v-model="currentPage"
      v-model:page-size="pageSize"
      :total="200"
      :page-sizes="[5, 10, 20, 50]"
      :show-size-changer="true"
    />
    <p style="margin-top: 12px">
      当前页：{{ currentPage }}，每页 {{ pageSize }} 条
    </p>
  </div>
</template>
