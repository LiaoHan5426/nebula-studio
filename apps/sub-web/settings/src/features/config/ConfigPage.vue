<script setup lang="ts">
import type { ConfigItem } from '@/shared/api/configApi';

import { computed, onMounted, ref } from 'vue';

import {
  NebulaButton,
  NebulaDialog,
  NebulaInput,
  NebulaPane,
  NebulaSelect,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { configApi } from '@/shared/api/configApi';
import { useConfirm } from '@/shared/composables/useConfirm';
import { isApiSuccess } from '@/shared/types';

const configs = ref<ConfigItem[]>([]);
const loading = ref(false);
const showCreate = ref(false);
const selectedGroup = ref('');
const selectedScope = ref('');
const previewOpen = ref(false);

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

const matchingConfig = computed(() =>
  configs.value.find(
    (item) =>
      item.key === form.value.key &&
      item.scope === form.value.scope &&
      (item.tenantId ?? '') === (form.value.tenantId ?? ''),
  ),
);
const activeSchema = computed(() => matchingConfig.value?.schema);
const sensitive = computed(
  () =>
    activeSchema.value?.sensitive === true ||
    matchingConfig.value?.sensitive === true ||
    /password|secret|token|credential|private/i.test(form.value.key || ''),
);
const inheritedFrom = computed(() =>
  matchingConfig.value?.inheritedFrom
    ? matchingConfig.value.inheritedFrom
    : form.value.scope === 'GLOBAL'
      ? '平台默认值'
      : form.value.scope === 'TENANT'
        ? '继承平台默认值，可由组织覆盖'
        : '继承平台与组织配置，可由应用覆盖',
);
const changePreview = computed(() => ({
  scope: form.value.scope,
  oldValue: sensitive.value
    ? '••••••（敏感值）'
    : (matchingConfig.value?.value ??
      matchingConfig.value?.inheritedValue ??
      matchingConfig.value?.defaultValue ??
      '未设置或由上级继承'),
  newValue: sensitive.value ? '••••••（敏感值）' : form.value.value,
  impact: matchingConfig.value?.impactScope
    ? matchingConfig.value.impactScope
    : form.value.scope === 'GLOBAL'
      ? '影响所有组织和应用，可能需要重启相关服务'
      : form.value.scope === 'TENANT'
        ? '影响指定组织中的全部应用'
        : '仅影响目标应用实例',
}));

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
    previewOpen.value = false;
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
  const confirmed = await useConfirm(
    `确定删除配置「${config.key}」？删除后将恢复其上级继承值或默认值，依赖该作用域的运行实例可能立即受到影响。`,
  );
  if (!confirmed) return;
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

function isSensitiveConfig(config: ConfigItem): boolean {
  return (
    config.sensitive === true ||
    config.schema?.sensitive === true ||
    /password|secret|token|credential|private/i.test(config.key)
  );
}

function displayValue(config: ConfigItem): string {
  return isSensitiveConfig(config)
    ? '••••••（敏感值已隐藏）'
    : formatValue(config.value);
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
        <NebulaButton variant="secondary" @click="loadConfigs">
          刷新
        </NebulaButton>
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
                  <NebulaTag v-if="isSensitiveConfig(config)" variant="warning">
                    敏感
                  </NebulaTag>
                </div>
                <NebulaButton variant="secondary" @click="handleDelete(config)">
                  删除
                </NebulaButton>
              </div>
              <pre class="config-page__value">{{ displayValue(config) }}</pre>
              <dl class="config-page__metadata">
                <div>
                  <dt>默认值</dt>
                  <dd>{{ config.defaultValue ?? '未声明' }}</dd>
                </div>
                <div>
                  <dt>继承来源</dt>
                  <dd>{{ config.inheritedFrom ?? '当前作用域直接设置' }}</dd>
                </div>
                <div>
                  <dt>影响范围</dt>
                  <dd>{{ config.impactScope ?? config.scope }}</dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </NebulaPane>

    <NebulaDialog
      v-model:open="showCreate"
      title="新建配置"
      description="配置值将按作用域覆盖上级默认值，提交前请检查影响预览。"
    >
      <div class="config-form">
        <label class="field">
          <span>配置键（Key）</span>
          <NebulaInput v-model="form.key" placeholder="如 app.name" />
        </label>
        <label class="field">
          <span>配置值（Value）</span>
          <textarea
            v-model="form.value"
            rows="4"
            placeholder="配置值，支持 JSON"
          ></textarea>
          <small v-if="activeSchema?.description">
            {{ activeSchema.description }}
          </small>
          <small v-if="activeSchema?.enum?.length">
            可选值：{{ activeSchema.enum.join('、') }}
          </small>
          <small v-if="matchingConfig?.defaultValue">
            Schema 默认值：{{ matchingConfig.defaultValue }}
          </small>
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
        <section class="config-meta">
          <div>
            <span>继承层级</span>
            <strong>{{ inheritedFrom }}</strong>
          </div>
          <div>
            <span>敏感性</span>
            <strong>{{
              sensitive ? '敏感配置，将掩码展示' : '普通配置'
            }}</strong>
          </div>
          <div>
            <span>Schema 类型</span>
            <strong>{{ activeSchema?.type ?? form.type ?? 'string' }}</strong>
          </div>
          <div>
            <span>运行影响</span>
            <strong>{{
              activeSchema?.restartRequired ? '保存后需要重启' : '动态生效'
            }}</strong>
          </div>
        </section>
        <section v-if="previewOpen" class="change-preview">
          <h3>变更预览</h3>
          <dl>
            <div>
              <dt>作用域</dt>
              <dd>{{ changePreview.scope }}</dd>
            </div>
            <div>
              <dt>旧值</dt>
              <dd>{{ changePreview.oldValue }}</dd>
            </div>
            <div>
              <dt>新值</dt>
              <dd>{{ changePreview.newValue }}</dd>
            </div>
            <div>
              <dt>潜在影响</dt>
              <dd>{{ changePreview.impact }}</dd>
            </div>
          </dl>
        </section>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showCreate = false">
            取消
          </NebulaButton>
          <NebulaButton
            v-if="!previewOpen"
            variant="outline"
            @click="previewOpen = true"
          >
            预览变更
          </NebulaButton>
          <NebulaButton v-else @click="handleCreate">确认保存</NebulaButton>
        </div>
      </div>
    </NebulaDialog>
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

.config-page__metadata {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-3);
  margin: var(--space-3) 0 0;
}

.config-page__metadata div {
  display: grid;
  gap: var(--space-1);
}

.config-page__metadata dt {
  font-size: 11px;
  color: hsl(var(--muted-foreground));
}

.config-page__metadata dd {
  margin: 0;
  font-size: 12px;
  overflow-wrap: anywhere;
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

.config-form {
  display: grid;
  gap: var(--space-3);
}

.config-meta {
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3);
  background: hsl(var(--muted) / 40%);
  border-radius: var(--radius-md);
}

.config-meta div,
.change-preview dl div {
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr);
  gap: var(--space-3);
}

.config-meta span,
.change-preview dt {
  color: hsl(var(--muted-foreground));
}

.change-preview {
  padding: var(--space-3);
  border: 1px solid hsl(var(--primary) / 30%);
  border-radius: var(--radius-md);
}

.change-preview h3 {
  margin: 0 0 var(--space-2);
}

.change-preview dl,
.change-preview dd {
  margin: 0;
}

.change-preview dl div {
  padding: 8px 0;
  border-bottom: 1px solid hsl(var(--border));
}
</style>
