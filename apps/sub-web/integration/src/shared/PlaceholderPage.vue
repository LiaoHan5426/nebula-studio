<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

const pageTitle = computed(() => (route.meta.title as string) || '页面');
</script>

<template>
  <div class="placeholder-page">
    <div class="placeholder-page__content">
      <div class="placeholder-page__icon">📋</div>
      <h2 class="placeholder-page__title">{{ pageTitle }}</h2>
      <p class="placeholder-page__desc">该页面正在开发中...</p>
    </div>
  </div>
</template>

<style scoped>
.placeholder-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.placeholder-page__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px;
  text-align: center;
}

.placeholder-page__icon {
  font-size: 48px;
  opacity: 0.6;
}

.placeholder-page__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.placeholder-page__desc {
  margin: 0;
  font-size: 14px;
  color: hsl(var(--muted-foreground));
}
</style>
