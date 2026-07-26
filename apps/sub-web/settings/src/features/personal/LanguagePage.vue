<script setup lang="ts">
import { ref } from 'vue';
import {
  NebulaPageHeader,
  NebulaSelect,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

const STORAGE_KEY = 'nebula.settings.language';
const language = ref(localStorage.getItem(STORAGE_KEY) || 'zh-CN');

function save(value: unknown): void {
  language.value = String(value);
  localStorage.setItem(STORAGE_KEY, language.value);
  document.documentElement.lang = language.value;
}
</script>

<template>
  <main class="language-page">
    <NebulaPageHeader
      eyebrow="Language & region"
      title="语言与区域"
      description="选择界面语言。专业缩写保留英文，并在首次出现时提供中文解释。"
    />
    <section class="language-card">
      <div>
        <h2>界面语言</h2>
        <p>语言偏好保存在当前设备，并由 Shell 与子应用共享。</p>
      </div>
      <NebulaSelect
        :model-value="language"
        :options="[
          { label: '简体中文', value: 'zh-CN' },
          { label: 'English（规划中）', value: 'en-US', disabled: true },
        ]"
        @update:model-value="save"
      />
      <NebulaTag>当前：简体中文</NebulaTag>
    </section>
  </main>
</template>

<style scoped>
.language-page {
  display: grid;
  gap: var(--space-5);
}

.language-card {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 220px auto;
  gap: var(--space-4);
  align-items: center;
  padding: var(--space-5);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
}

.language-card h2,
.language-card p {
  margin: 0;
}

.language-card p {
  margin-top: var(--space-2);
  color: hsl(var(--muted-foreground));
}

@media (width <= 680px) {
  .language-card {
    grid-template-columns: 1fr;
  }
}
</style>
