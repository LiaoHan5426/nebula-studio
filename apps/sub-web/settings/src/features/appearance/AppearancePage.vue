<script setup lang="ts">
import type { HostCapabilities } from '@nebula-studio/application-contract';
import type { ThemePreference } from '@nebula-studio/tokens';

import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { HOST_CAPABILITIES_KEY } from '@nebula-studio/application-contract';
import {
  NebulaButton,
  NebulaPageHeader,
  NebulaPane,
} from '@nebula-studio/nebula-ui';
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
  <main class="appearance-page">
    <NebulaPageHeader
      eyebrow="Theme contract"
      :title="t('pages.appearance.title')"
      :description="t('pages.appearance.description')"
    />
    <NebulaPane
      class="panel"
      :title="t('appearance.paneTitle')"
      :description="t('appearance.paneDescription')"
    >
      <div class="appearance-grid">
        <div class="appearance-controls">
          <section class="block">
            <h3>{{ t('appearance.scheme') }}</h3>
            <div class="row">
              <NebulaButton
                :variant="
                  preference.colorScheme === 'light' ? 'primary' : 'ghost'
                "
                :disabled="saving"
                @click="setScheme('light')"
              >
                {{ t('appearance.light') }}
              </NebulaButton>
              <NebulaButton
                :variant="
                  preference.colorScheme === 'dark' ? 'primary' : 'ghost'
                "
                :disabled="saving"
                @click="setScheme('dark')"
              >
                {{ t('appearance.dark') }}
              </NebulaButton>
              <NebulaButton
                :variant="
                  preference.colorScheme === 'system' ? 'primary' : 'ghost'
                "
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
                  preference.accent.kind === 'preset' &&
                  preference.accent.id === id
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
                :variant="
                  preference.density === 'comfortable' ? 'primary' : 'ghost'
                "
                :disabled="saving"
                @click="setDensity('comfortable')"
              >
                {{ t('appearance.comfortable') }}
              </NebulaButton>
              <NebulaButton
                :variant="
                  preference.density === 'compact' ? 'primary' : 'ghost'
                "
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
                :variant="
                  preference.contrast === 'normal' ? 'primary' : 'ghost'
                "
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
            {{ preview?.accentId }} / {{ preview?.density }} /
            {{ preview?.contrast }}
            {{ saving ? t('appearance.saving') : '' }}
          </p>
          <NebulaButton
            :disabled="saving"
            variant="ghost"
            @click="restoreDefaults"
          >
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
        </div>

        <aside class="theme-preview" aria-label="主题实时预览">
          <div class="theme-preview__bar">
            <span></span><span></span><span></span>
            <b>实时预览</b>
          </div>
          <div class="theme-preview__body">
            <nav aria-label="预览导航">
              <strong>N</strong>
              <i class="is-active"></i><i></i><i></i>
            </nav>
            <main>
              <span class="theme-preview__eyebrow">Workspace</span>
              <h4>清晰、一致的工作界面</h4>
              <p>主题色只强调操作和选中状态，状态语义保持稳定。</p>
              <div class="theme-preview__metrics">
                <article><span>待处理</span><strong>12</strong></article>
                <article>
                  <span>运行状态</span><strong class="is-success">正常</strong>
                </article>
              </div>
              <div class="theme-preview__actions">
                <button type="button">主要操作</button
                ><button type="button">次要操作</button>
              </div>
            </main>
          </div>
          <footer>
            <span>{{ preference.colorScheme }}</span>
            <span>{{ preference.density }}</span>
            <span>{{ preference.contrast }}</span>
          </footer>
        </aside>
      </div>
    </NebulaPane>
  </main>
</template>

<style lang="scss" scoped>
.appearance-page {
  display: grid;
  gap: var(--space-5);
}

.panel {
  max-width: 1040px;
}

.appearance-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 0.8fr);
  gap: clamp(24px, 4vw, 48px);
  align-items: start;
}

.block {
  padding: 18px 0;
  margin: 0;
  border-bottom: 1px solid hsl(var(--border) / 65%);
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

.theme-preview {
  position: sticky;
  top: 16px;
  overflow: hidden;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: calc(var(--radius-lg) + 4px);
  box-shadow: 0 24px 60px hsl(var(--foreground) / 10%);
}

.theme-preview__bar {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 11px 14px;
  background: hsl(var(--muted) / 45%);
  border-bottom: 1px solid hsl(var(--border));
}
.theme-preview__bar span {
  width: 7px;
  height: 7px;
  background: hsl(var(--muted-foreground) / 35%);
  border-radius: 50%;
}
.theme-preview__bar b {
  margin-left: auto;
  font-size: 10px;
  color: hsl(var(--muted-foreground));
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.theme-preview__body {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  min-height: 330px;
}
.theme-preview__body nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  padding: 14px 9px;
  background: hsl(var(--sidebar));
  border-right: 1px solid hsl(var(--border));
}
.theme-preview__body nav strong {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
  border-radius: 8px;
}
.theme-preview__body nav i {
  width: 22px;
  height: 5px;
  background: hsl(var(--muted-foreground) / 24%);
  border-radius: 99px;
}
.theme-preview__body nav i.is-active {
  background: hsl(var(--primary));
}
.theme-preview__body main {
  padding: 24px 20px;
}
.theme-preview__eyebrow {
  font-size: 9px;
  font-weight: 800;
  color: hsl(var(--primary));
  text-transform: uppercase;
  letter-spacing: 0.12em;
}
.theme-preview h4 {
  margin: 7px 0;
  font-size: 20px;
}
.theme-preview p {
  margin: 0;
  font-size: 12px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
}
.theme-preview__metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 22px;
}
.theme-preview__metrics article {
  padding: 12px;
  background: hsl(var(--muted) / 28%);
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-md);
}
.theme-preview__metrics span {
  display: block;
  font-size: 10px;
  color: hsl(var(--muted-foreground));
}
.theme-preview__metrics strong {
  display: block;
  margin-top: 6px;
  font-size: 18px;
}
.theme-preview__metrics strong.is-success {
  font-size: 13px;
  color: hsl(var(--success));
}
.theme-preview__actions {
  display: flex;
  gap: 8px;
  margin-top: 22px;
}
.theme-preview__actions button {
  padding: 8px 11px;
  font: inherit;
  font-size: 11px;
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
  border: 0;
  border-radius: var(--radius-sm);
}
.theme-preview__actions button + button {
  color: hsl(var(--foreground));
  background: transparent;
  border: 1px solid hsl(var(--border));
}
.theme-preview footer {
  display: flex;
  gap: 6px;
  padding: 11px 14px;
  border-top: 1px solid hsl(var(--border));
}
.theme-preview footer span {
  padding: 3px 7px;
  font-size: 9px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 45%);
  border-radius: 99px;
}

@media (width <= 820px) {
  .appearance-grid {
    grid-template-columns: 1fr;
  }
  .theme-preview {
    position: static;
  }
}
</style>
