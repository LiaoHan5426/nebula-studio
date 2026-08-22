<script setup lang="ts">
import type { HostCapabilities } from '@nebula-studio/application-contract';
import type { ThemePreference } from '@nebula-studio/tokens';

import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue';

import { HOST_CAPABILITIES_KEY } from '@nebula-studio/application-contract';
import { NebulaButton, NebulaPane } from '@nebula-studio/nebula-ui';
import {
  ACCENT_PRESETS,
  PRODUCT_DEFAULT_PREFERENCE,
} from '@nebula-studio/tokens';

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
</script>

<template>
  <NebulaPane
    class="panel"
    title="外观与主题"
    description="模式、主题色、密度与对比度由 Host 解析为 ResolvedTheme，Remote 只消费 CSS 变量"
  >
    <section class="block">
      <h3>颜色模式</h3>
      <div class="row">
        <NebulaButton
          :variant="preference.colorScheme === 'light' ? 'primary' : 'ghost'"
          :disabled="saving"
          @click="setScheme('light')"
        >
          浅色
        </NebulaButton>
        <NebulaButton
          :variant="preference.colorScheme === 'dark' ? 'primary' : 'ghost'"
          :disabled="saving"
          @click="setScheme('dark')"
        >
          深色
        </NebulaButton>
        <NebulaButton
          :variant="preference.colorScheme === 'system' ? 'primary' : 'ghost'"
          :disabled="saving"
          @click="setScheme('system')"
        >
          跟随系统
        </NebulaButton>
      </div>
    </section>

    <section class="block">
      <h3>主题色</h3>
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
          使用自定义色
        </NebulaButton>
      </div>
    </section>

    <section class="block">
      <h3>密度</h3>
      <div class="row">
        <NebulaButton
          :variant="preference.density === 'comfortable' ? 'primary' : 'ghost'"
          :disabled="saving"
          @click="setDensity('comfortable')"
        >
          舒适
        </NebulaButton>
        <NebulaButton
          :variant="preference.density === 'compact' ? 'primary' : 'ghost'"
          :disabled="saving"
          @click="setDensity('compact')"
        >
          紧凑
        </NebulaButton>
      </div>
    </section>

    <section class="block">
      <h3>对比度</h3>
      <div class="row">
        <NebulaButton
          :variant="preference.contrast === 'normal' ? 'primary' : 'ghost'"
          :disabled="saving"
          @click="setContrast('normal')"
        >
          标准
        </NebulaButton>
        <NebulaButton
          :variant="preference.contrast === 'high' ? 'primary' : 'ghost'"
          :disabled="saving"
          @click="setContrast('high')"
        >
          高对比
        </NebulaButton>
      </div>
    </section>

    <p class="hint">
      预览：{{ preview?.scheme }} / {{ preview?.accentId }} /
      {{ preview?.density }} / {{ preview?.contrast }}
      {{ saving ? '（保存中…）' : '' }}
    </p>
    <NebulaButton :disabled="saving" variant="ghost" @click="restoreDefaults">
      恢复默认
    </NebulaButton>
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
