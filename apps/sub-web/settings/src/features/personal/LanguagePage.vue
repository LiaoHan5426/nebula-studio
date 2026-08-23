<script setup lang="ts">
import type { HostCapabilities } from '@nebula-studio/application-contract';

import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { HOST_CAPABILITIES_KEY } from '@nebula-studio/application-contract';
import {
  NebulaPageHeader,
  NebulaSelect,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

const { t } = useI18n();
const capabilities = inject<HostCapabilities | undefined>(
  HOST_CAPABILITIES_KEY,
  undefined,
);
const language = ref(capabilities?.locale?.locale ?? 'zh-CN');
let stop: (() => void) | undefined;

onMounted(() => {
  stop = capabilities?.locale?.subscribe?.((value) => {
    language.value = value;
  });
});

onBeforeUnmount(() => {
  stop?.();
});

async function save(value: unknown): Promise<void> {
  const next = String(value) === 'en-US' ? 'en-US' : 'zh-CN';
  language.value = next;
  await capabilities?.locale?.setLocale?.(next);
}

const currentLabel = computed(() =>
  language.value === 'en-US' ? t('language.en') : t('language.zh'),
);
</script>

<template>
  <main class="language-page">
    <NebulaPageHeader
      :eyebrow="t('language.eyebrow')"
      :title="t('language.title')"
      :description="t('language.description')"
    />
    <section class="language-card">
      <div>
        <h2>{{ t('language.heading') }}</h2>
        <p>{{ t('language.hint') }}</p>
      </div>
      <NebulaSelect
        :model-value="language"
        :options="[
          { label: t('language.zh'), value: 'zh-CN' },
          { label: t('language.en'), value: 'en-US' },
        ]"
        :aria-label="t('language.heading')"
        @update:model-value="save"
      />
      <NebulaTag>
{{
        t('language.current', { label: currentLabel })
      }}
</NebulaTag>
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
