<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import {
  NebulaButton,
  NebulaInput,
  NebulaPane,
  NebulaSelect,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { configApi } from '@/shared/api/configApi';
import type { ConfigItem } from '@/shared/api/configApi';
import { isApiSuccess } from '@/shared/types';

const configs = ref<ConfigItem[]>([]);
const loading = ref(false);
const showCreate = ref(false);
const selectedGroup = ref('');
const selectedScope = ref('');

const form = ref<Partial<ConfigItem>>({
  key: '',
  value: '',
  scope: 'GLOBAL',
  group: '',
  tenantId: '',
});

const groupedConfigs = computed(() => {
  const groups: Record<string, ConfigItem[]> = {};
  for (const config of configs.value) {
    const group = config.group ?? '未分组';
    if (!groups[group]) groups[group] = [];
    groups[group].push(config);
  }
  return groups;
});

onMounted(async () => {
  await loadConfigs();
});

async function loadConfigs() {
  loading.value = true;
  try {
    const response = await configApi.list({
      scope: selectedScope.value || undefined,
      group: selectedGroup.value || undefined,
    });
    if (isApiSuccess(response)) {
      configs.value = response.data;
    }
  } finally {
    loading.value = false;
  }
}

async function handleCreate() {
  const response = await configApi.save(form.value);
  if (isApiSuccess(response)) {
    showCreate.value = false;
    form.value = {
      key: '',
      value: '',
      scope: 'GLOBAL',
      group: '',
      tenantId: '',
    };
    await loadConfigs();
  }
}

async function handleDelete(config: ConfigItem) {
  await configApi.delete(config.key, config.scope, config.tenantId);
  await loadConfigs();
}

function scopeVariant(scope: string) {
  if (scope === 'GLOBAL') return 'success';
  if (scope === 'TENANT') return 'warning';
  return 'default';
}

function formatValue(value: string): string {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
</script>

<template>
  <div class="config-page">
    <NebulaPane
      title="配置管理"
      description="管理系统配置项，支持按分组和范围查询"
    >
      <div class="config-page__toolbar">
        <NebulaButton @click="showCreate = true">新建配置</NebulaButton>
        <NebulaSelect
          v-model="selectedScope"
          :options="[
            { value: '', label: '全部范围' },
            { value: 'GLOBAL', label: '全局' },
            { value: 'TENANT', label: '租户' },
            { value: 'APPLICATION', label: '应用' },
          ]"
          class="config-page__filter"
          @change="loadConfigs"
        />
        <NebulaButton variant="secondary" @click="loadConfigs"
          >刷新</NebulaButton
        >
      </div>

      <div v-if="loading" class="config-page__empty">加载中…</div>
      <div v-else-if="configs.length === 0" class="config-page__empty">
        暂无配置
      </div>
      <div v-else class="config-page__groups">
        <div
          v-for="(items, groupName) in groupedConfigs"
          :key="groupName"
          class="config-page__group"
        >
          <h3 class="config-page__group-title">{{ groupName }}</h3>
          <div class="config-page__list">
            <div
              v-for="config in items"
              :key="config.id"
              class="config-page__item"
            >
              <div class="config-page__item-head">
                <div>
                  <span class="config-page__key">{{ config.key }}</span>
                  <NebulaTag :variant="scopeVariant(config.scope)">
                    {{ config.scope }}
                  </NebulaTag>
                </div>
                <NebulaButton variant="secondary" @click="handleDelete(config)">
                  删除
                </NebulaButton>
              </div>
              <pre class="config-page__value">{{
                formatValue(config.value)
              }}</pre>
            </div>
          </div>
        </div>
      </div>
    </NebulaPane>

    <!-- 新建配置弹窗 -->
    <div
      v-if="showCreate"
      class="modal-overlay"
      @click.self="showCreate = false"
    >
      <NebulaPane title="新建配置" class="modal">
        <label class="field">
          <span>配置键 (Key)</span>
          <NebulaInput v-model="form.key" placeholder="如 app.name" />
        </label>
        <label class="field">
          <span>配置值 (Value)</span>
          <textarea
            v-model="form.value"
            rows="4"
            placeholder="配置值，支持 JSON"
          />
        </label>
        <label class="field">
          <span>范围</span>
          <NebulaSelect
            v-model="form.scope"
            :options="[
              { value: 'GLOBAL', label: '全局' },
              { value: 'TENANT', label: '租户' },
              { value: 'APPLICATION', label: '应用' },
            ]"
          />
        </label>
        <label class="field">
          <span>分组</span>
          <NebulaInput v-model="form.group" placeholder="如 system、app" />
        </label>
        <label v-if="form.scope === 'TENANT'" class="field">
          <span>租户 ID</span>
          <NebulaInput v-model="form.tenantId" placeholder="租户 ID" />
        </label>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showCreate = false">
            取消
          </NebulaButton>
          <NebulaButton @click="handleCreate">保存</NebulaButton>
        </div>
      </NebulaPane>
    </div>
  </div>
</template>

<style scoped>
.config-page {
  max-width: 1200px;
  padding: 24px;
  margin: 0 auto;
}

.config-page__toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}

.config-page__filter {
  min-width: 140px;
}

.config-page__empty {
  padding: 24px;
  color: hsl(var(--muted-foreground));
  text-align: center;
}

.config-page__groups {
  display: grid;
  gap: 20px;
}

.config-page__group-title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 600;
  color: hsl(var(--muted-foreground));
}

.config-page__list {
  display: grid;
  gap: 8px;
}

.config-page__item {
  padding: 12px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.config-page__item-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.config-page__key {
  margin-right: 8px;
  font-size: 13px;
  font-weight: 600;
}

.config-page__value {
  max-height: 120px;
  padding: 8px;
  margin: 0;
  overflow: auto;
  font-size: 12px;
  line-height: 1.5;
  background: hsl(var(--muted) / 40%);
  border-radius: 4px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 900;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 45%);
}

.modal {
  width: min(480px, 92vw);
}

.field {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
  font-size: 13px;
}

.field textarea {
  padding: 8px 10px;
  font-family: inherit;
  color: hsl(var(--foreground));
  resize: vertical;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.modal__actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}
</style>
