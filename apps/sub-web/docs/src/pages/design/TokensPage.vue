<script setup lang="ts">
import type { HostCapabilities } from '@nebula-studio/application-contract';

import { computed, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { HOST_CAPABILITIES_KEY } from '@nebula-studio/application-contract';
import { NebulaPageHeader, NebulaTag } from '@nebula-studio/nebula-ui';
import {
  PRODUCT_DEFAULT_PREFERENCE,
  resolveTheme,
  STATUS_TOKENS,
} from '@nebula-studio/tokens';

const { t } = useI18n();
const capabilities = inject<HostCapabilities | undefined>(
  HOST_CAPABILITIES_KEY,
  undefined,
);

const resolved = computed(
  () =>
    capabilities?.theme?.resolved ??
    resolveTheme(PRODUCT_DEFAULT_PREFERENCE, 'light'),
);

const swatches = computed(() => {
  const tokens = resolved.value.tokens;
  return {
    accent: [
      { name: 'action-primary', value: tokens['action-primary'] },
      {
        name: 'action-primary-content',
        value: tokens['action-primary-content'],
      },
    ],
    status: [
      { name: 'success', value: tokens.success ?? STATUS_TOKENS.light.success },
      { name: 'warning', value: tokens.warning ?? STATUS_TOKENS.light.warning },
      {
        name: 'destructive',
        value: tokens.destructive ?? STATUS_TOKENS.light.destructive,
      },
    ],
  };
});

const rootVars = ref<string[]>([]);

onMounted(() => {
  const styles = getComputedStyle(document.documentElement);
  rootVars.value = [
    '--background',
    '--foreground',
    '--border',
    '--muted',
    '--card',
  ].map((name) => `${name}: ${styles.getPropertyValue(name).trim() || '—'}`);
});
</script>

<template>
  <div class="catalog-page">
    <NebulaPageHeader
      :title="t('design.tokens.title')"
      :description="t('design.tokens.description')"
    />
    <section>
      <h2>{{ t('design.tokens.foundation') }}</h2>
      <pre class="token-json">{{ rootVars.join('\n') }}</pre>
    </section>
    <section>
      <h2>{{ t('design.tokens.accent') }}</h2>
      <p>{{ t('design.tokens.accentHint') }}</p>
      <div class="swatches">
        <article v-for="item in swatches.accent" :key="item.name">
          <div
            class="swatch"
            :style="{ background: `hsl(${item.value})` }"
          ></div>
          <strong>{{ item.name }}</strong>
          <span>{{ item.value }}</span>
        </article>
      </div>
    </section>
    <section>
      <h2>{{ t('design.tokens.status') }}</h2>
      <p>{{ t('design.tokens.statusHint') }}</p>
      <div class="swatches">
        <article v-for="item in swatches.status" :key="item.name">
          <div
            class="swatch"
            :style="{ background: `hsl(${item.value})` }"
          ></div>
          <strong>{{ item.name }}</strong>
          <span>{{ item.value }}</span>
          <NebulaTag>status</NebulaTag>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.catalog-page {
  display: grid;
  gap: var(--space-5);
}

.swatches {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: var(--space-4);
}

.swatch {
  height: 48px;
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
}

.token-json {
  padding: var(--space-4);
  overflow: auto;
  background: hsl(var(--muted) / 40%);
  border-radius: var(--radius-md);
}
</style>
