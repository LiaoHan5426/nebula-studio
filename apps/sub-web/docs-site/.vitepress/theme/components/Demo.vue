<script setup lang="ts">
import { ref } from 'vue';

const showCode = ref(false);
</script>

<template>
  <div class="demo-container">
    <div class="demo-content">
      <slot />
    </div>
    <div class="demo-actions">
      <button type="button" @click="showCode = !showCode">
        {{ showCode ? '隐藏代码' : '显示代码' }}
      </button>
    </div>
    <div v-if="showCode" class="demo-code">
      <slot name="code" />
    </div>
  </div>
</template>

<style scoped>
.demo-code {
  border-top: 1px solid var(--vp-c-divider);
}

.demo-code :deep(div[class*='language-']) {
  margin: 0;
  border-radius: 0;
}
</style>
