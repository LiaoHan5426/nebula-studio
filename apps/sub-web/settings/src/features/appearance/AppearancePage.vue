<script setup lang="ts">
import type { HostCapabilities } from '@nebula-studio/application-contract';
import type { ThemePreference } from '@nebula-studio/tokens';

import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { HOST_CAPABILITIES_KEY } from '@nebula-studio/application-contract';
import { NebulaButton, NebulaPane } from '@nebula-studio/nebula-ui';
import {
  ACCENT_PRESETS,
  PRODUCT_DEFAULT_PREFERENCE,
} from '@nebula-studio/tokens';

import { organizationsApi } from '@/shared/api/system';
import { isSettingsOrgAdmin } from '@/shared/auth/access';

const { t } = useI18n();
const capabilities = inject<HostCapabilities | undefined>(
  HOST_CAPABILITIES_KEY,
  undefined,
);

function readPreference(): ThemePreference {
  return capabilities?.theme?.preference ?? PRODUCT_DEFAULT_PREFERENCE;
}

const preference = ref<ThemePreference>(readPreference());
const customColor = ref(
  preference.value.accent.kind === 'custom'
    ? preference.value.accent.color
    : '#4d7cff',
);
const saving = ref(false);
const organizationSaving = ref(false);
const organizationSaved = ref(false);
const organizationId = localStorage.getItem('nebula_current_org_id') ?? '';
const canManageOrganizationTheme =
  isSettingsOrgAdmin() && Boolean(organizationId);
const preview = computed(() => capabilities?.theme?.resolved);
let unsubscribe: (() => void) | undefined;

onMounted(() => {
  unsubscribe = capabilities?.theme?.subscribe?.(() => {
    preference.value = capabilities?.theme?.preference ?? preference.value;
  });
});

onBeforeUnmount(() => {
  unsubscribe?.();
});

async function commit(next: ThemePreference): Promise<void> {
  if (saving.value) return;
  saving.value = true;
  try {
    if (capabilities?.theme?.setPreference) {
      await capabilities.theme.setPreference(next);
    } else if (capabilities?.theme?.setScheme) {
      await capabilities.theme.setScheme(next.colorScheme);
    }
    preference.value = capabilities?.theme?.preference ?? next;
  } finally {
    saving.value = false;
  }
}

function setScheme(colorScheme: ThemePreference['colorScheme']): void {
  void commit({ ...preference.value, colorScheme });
}

function setDensity(density: ThemePreference['density']): void {
  void commit({ ...preference.value, density });
}

function setContrast(contrast: ThemePreference['contrast']): void {
  void commit({ ...preference.value, contrast });
}

function setPreset(id: string): void {
  void commit({ ...preference.value, accent: { kind: 'preset', id } });
}

function setCustomAccent(): void {
  void commit({
    ...preference.value,
    accent: { kind: 'custom', color: customColor.value },
  });
}

function restoreDefaults(): void {
  customColor.value = ACCENT_PRESETS['nebula-blue'] ?? '#4d7cff';
  void commit(PRODUCT_DEFAULT_PREFERENCE);
}

async function saveOrganizationDefault(): Promise<void> {
  if (!canManageOrganizationTheme || organizationSaving.value) return;
  organizationSaving.value = true;
  organizationSaved.value = false;
  try {
    await organizationsApi.updateTheme(organizationId, preference.value);
    organizationSaved.value = true;
  } finally {
    organizationSaving.value = false;
  }
}
</script>

<template>
  <NebulaPane
    class="panel"
    :title="t('appearance.paneTitle')"
    :description="t('appearance.paneDescription')"
  >
    <section class="block">
      <h3>{{ t('appearance.scheme') }}</h3>
      <div class="row">
        <NebulaButton
          :variant="preference.colorScheme === 'light' ? 'primary' : 'ghost'"
          :disabled="saving"
          @click="setScheme('light')"
        >
          {{ t('appearance.light') }}
        </NebulaButton>
        <NebulaButton
          :variant="preference.colorScheme === 'dark' ? 'primary' : 'ghost'"
          :disabled="saving"
          @click="setScheme('dark')"
        >
          {{ t('appearance.dark') }}
        </NebulaButton>
        <NebulaButton
          :variant="preference.colorScheme === 'system' ? 'primary' : 'ghost'"
          :disabled="saving"
          @click="setScheme('system')"
        >
          {{ t('appearance.system') }}
        </NebulaButton>
      </div>
    </section>

    <section class="block">
      <h3>{{ t('appearance.accent') }}</h3>
      <div class="row">
        <NebulaButton
          v-for="id in Object.keys(ACCENT_PRESETS)"
          :key="id"
          :variant="
            preference.accent.kind === 'preset' && preference.accent.id === id
              ? 'primary'
              : 'ghost'
          "
          :disabled="saving"
          @click="setPreset(id)"
        >
          {{ id }}
        </NebulaButton>
      </div>
      <div class="row">
        <input v-model="customColor" type="color" :disabled="saving" />
        <NebulaButton
          :disabled="saving"
          variant="ghost"
          @click="setCustomAccent"
        >
          {{ t('appearance.customAccent') }}
        </NebulaButton>
      </div>
    </section>

    <section class="block">
      <h3>{{ t('appearance.density') }}</h3>
      <div class="row">
        <NebulaButton
          :variant="preference.density === 'comfortable' ? 'primary' : 'ghost'"
          :disabled="saving"
          @click="setDensity('comfortable')"
        >
          {{ t('appearance.comfortable') }}
        </NebulaButton>
        <NebulaButton
          :variant="preference.density === 'compact' ? 'primary' : 'ghost'"
          :disabled="saving"
          @click="setDensity('compact')"
        >
          {{ t('appearance.compact') }}
        </NebulaButton>
      </div>
    </section>

    <section class="block">
      <h3>{{ t('appearance.contrast') }}</h3>
      <div class="row">
        <NebulaButton
          :variant="preference.contrast === 'normal' ? 'primary' : 'ghost'"
          :disabled="saving"
          @click="setContrast('normal')"
        >
          {{ t('appearance.normal') }}
        </NebulaButton>
        <NebulaButton
          :variant="preference.contrast === 'high' ? 'primary' : 'ghost'"
          :disabled="saving"
          @click="setContrast('high')"
        >
          {{ t('appearance.high') }}
        </NebulaButton>
      </div>
    </section>

    <p class="hint">
      {{ t('appearance.preview') }}：{{ preview?.scheme }} /
      {{ preview?.accentId }} / {{ preview?.density }} / {{ preview?.contrast }}
      {{ saving ? t('appearance.saving') : '' }}
    </p>
    <NebulaButton :disabled="saving" variant="ghost" @click="restoreDefaults">
      {{ t('appearance.restore') }}
    </NebulaButton>
    <NebulaButton
      v-if="canManageOrganizationTheme"
      :disabled="saving || organizationSaving"
      variant="ghost"
      @click="saveOrganizationDefault"
    >
      {{
        organizationSaving
          ? t('appearance.organizationSaving')
          : t('appearance.saveOrganizationDefault')
      }}
    </NebulaButton>
    <span v-if="organizationSaved" class="hint">
      {{ t('appearance.organizationSaved') }}
    </span>
  </NebulaPane>
</template>

<style lang="scss" scoped>
.panel {
  max-width: 640px;
}

.block {
  margin-top: 16px;
}

.block h3 {
  margin: 0 0 8px;
  font-size: 0.88rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.hint {
  margin: 16px 0 8px;
  color: hsl(var(--muted-foreground));
}
</style>
