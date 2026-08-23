<script setup lang="ts">
import type { HostCapabilities } from '@nebula-studio/application-contract';
import type { ThemePreference } from '@nebula-studio/tokens';

import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { HOST_CAPABILITIES_KEY } from '@nebula-studio/application-contract';
import { NebulaButton, NebulaPageHeader } from '@nebula-studio/nebula-ui';
import {
  ACCENT_PRESETS,
  applyResolvedTheme,
  PRODUCT_DEFAULT_PREFERENCE,
  resolveTheme,
} from '@nebula-studio/tokens';

const { t } = useI18n();
const capabilities = inject<HostCapabilities | undefined>(
  HOST_CAPABILITIES_KEY,
  undefined,
);
const previewEl = ref<HTMLElement | null>(null);
const preference = ref<ThemePreference>(
  capabilities?.theme?.preference ?? PRODUCT_DEFAULT_PREFERENCE,
);
const customColor = ref(
  preference.value.accent.kind === 'custom'
    ? preference.value.accent.color
    : '#4d7cff',
);
let unsubscribe: (() => void) | undefined;

function paintPreview(next = preference.value): void {
  const resolved = capabilities?.theme?.resolved ?? resolveTheme(next, 'light');
  if (previewEl.value) {
    applyResolvedTheme(previewEl.value, resolveTheme(next, resolved.scheme));
  }
}

onMounted(() => {
  unsubscribe = capabilities?.theme?.subscribe?.(() => {
    preference.value = capabilities?.theme?.preference ?? preference.value;
    paintPreview();
  });
  paintPreview();
});

onBeforeUnmount(() => {
  unsubscribe?.();
});

async function commit(next: ThemePreference): Promise<void> {
  preference.value = next;
  if (capabilities?.theme?.setPreference) {
    await capabilities.theme.setPreference(next);
    return;
  }
  applyResolvedTheme(
    document.documentElement,
    resolveTheme(next, next.colorScheme === 'dark' ? 'dark' : 'light'),
  );
  paintPreview(next);
}

const previewLabel = computed(
  () =>
    `${preference.value.colorScheme} / ${
      preference.value.accent.kind === 'preset'
        ? preference.value.accent.id
        : 'custom'
    } / ${preference.value.density} / ${preference.value.contrast}`,
);
</script>

<template>
  <div class="catalog-page">
    <NebulaPageHeader
      :title="t('design.theme.title')"
      :description="t('design.theme.description')"
    />
    <p>{{ t('design.theme.standaloneHint') }}</p>
    <section>
      <h3>{{ t('design.theme.scheme') }}</h3>
      <div class="row">
        <NebulaButton
          v-for="scheme in ['light', 'dark', 'system'] as const"
          :key="scheme"
          :variant="preference.colorScheme === scheme ? 'primary' : 'ghost'"
          @click="commit({ ...preference, colorScheme: scheme })"
        >
          {{ scheme }}
        </NebulaButton>
      </div>
    </section>
    <section>
      <h3>{{ t('design.theme.accent') }}</h3>
      <div class="row">
        <NebulaButton
          v-for="id in Object.keys(ACCENT_PRESETS)"
          :key="id"
          :variant="
            preference.accent.kind === 'preset' && preference.accent.id === id
              ? 'primary'
              : 'ghost'
          "
          @click="commit({ ...preference, accent: { kind: 'preset', id } })"
        >
          {{ id }}
        </NebulaButton>
        <input v-model="customColor" type="color" />
        <NebulaButton
          variant="ghost"
          @click="
            commit({
              ...preference,
              accent: { kind: 'custom', color: customColor },
            })
          "
        >
          custom
        </NebulaButton>
      </div>
    </section>
    <section>
      <h3>
        {{ t('design.theme.density') }} / {{ t('design.theme.contrast') }}
      </h3>
      <div class="row">
        <NebulaButton
          v-for="density in ['comfortable', 'compact'] as const"
          :key="density"
          :variant="preference.density === density ? 'primary' : 'ghost'"
          @click="commit({ ...preference, density })"
        >
          {{ density }}
        </NebulaButton>
        <NebulaButton
          v-for="contrast in ['normal', 'high'] as const"
          :key="contrast"
          :variant="preference.contrast === contrast ? 'primary' : 'ghost'"
          @click="commit({ ...preference, contrast })"
        >
          {{ contrast }}
        </NebulaButton>
      </div>
    </section>
    <section ref="previewEl" class="preview">
      <h3>{{ t('design.theme.preview') }}</h3>
      <p>{{ previewLabel }}</p>
      <NebulaButton variant="primary">Primary</NebulaButton>
    </section>
  </div>
</template>

<style scoped>
.catalog-page,
.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.catalog-page {
  display: grid;
  gap: var(--space-5);
}

.preview {
  padding: var(--space-5);
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
}
</style>
