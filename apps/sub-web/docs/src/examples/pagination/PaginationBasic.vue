<script setup lang="ts">
import { ref } from 'vue';
import { NebulaPagination } from '@nebula-studio/nebula-ui';

const currentPage = ref(1);
</script>

<template>
  <div>
    <NebulaPagination v-model="currentPage" :total="100" />
    <p style="margin-top: 12px">当前页：{{ currentPage }}</p>
  </div>
</template>
