<script setup lang="ts">
import { ref } from 'vue';
import { NebulaInput } from '@nebula-studio/nebula-ui';

const textValue = ref('');
</script>

<template>
  <div>
    <NebulaInput v-model="textValue" placeholder="请输入内容" />
    <p style="margin-top: 8px; font-size: 12px">
      当前值: {{ textValue || '空' }}
    </p>
  </div>
</template>
