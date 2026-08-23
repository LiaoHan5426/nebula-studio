<script setup lang="ts">
import type { ShellAppRecord } from '@/shared/api/system';

import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  NebulaButton,
  NebulaDialog,
  NebulaInput,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { appsApi } from '@/shared/api/system';
import EntityListPage from '@/shared/components/EntityListPage.vue';
import { useConfirm } from '@/shared/composables/useConfirm';
import { isApiSuccess } from '@/shared/types';

const { t } = useI18n();
const apps = ref<ShellAppRecord[]>([]);
const loading = ref(false);
const showDialog = ref(false);
const saving = ref(false);
const selected = ref<ShellAppRecord>();
const detailOpen = ref(false);

const form = ref({
  label: '',
  renderer: '',
  preload: '',
  sortOrder: 0,
  status: 'ACTIVE',
});

onMounted(() => {
  void loadApps();
});

async function loadApps() {
  loading.value = true;
  try {
    const response = await appsApi.page({ page: 1, size: 50 });
    if (isApiSuccess(response)) {
      apps.value = response.data.records ?? [];
    }
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  form.value = {
    label: '',
    renderer: '',
    preload: '',
    sortOrder: 0,
    status: 'ACTIVE',
  };
  showDialog.value = true;
}

async function saveApp() {
  saving.value = true;
  try {
    const response = await appsApi.create({
      label: form.value.label.trim(),
      renderer: form.value.renderer.trim() || undefined,
      preload: form.value.preload.trim() || undefined,
      sortOrder: form.value.sortOrder,
      status: form.value.status,
    });
    if (isApiSuccess(response)) {
      showDialog.value = false;
      await loadApps();
    }
  } finally {
    saving.value = false;
  }
}

async function toggleStatus(app: ShellAppRecord) {
  const next = app.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const response = await appsApi.updateStatus(app.id, next);
  if (isApiSuccess(response)) {
    await loadApps();
  }
}

async function removeApp(app: ShellAppRecord) {
  const confirmed = await useConfirm(
    t('apps.confirmDelete', { name: app.label }),
  );
  if (!confirmed) return;
  const response = await appsApi.delete(app.id);
  if (isApiSuccess(response)) {
    await loadApps();
  }
}

function openDetails(app: ShellAppRecord) {
  selected.value = app;
  detailOpen.value = true;
}
</script>

<template>
  <EntityListPage
    v-model:detail-open="detailOpen"
    :title="t('apps.title')"
    :description="t('apps.description')"
    :eyebrow="t('apps.eyebrow')"
    :result-summary="t('apps.summary', { total: apps.length })"
    :loading="loading"
    :empty="!loading && apps.length === 0"
    :detail-title="selected?.label || t('apps.detail')"
    :detail-subtitle="selected?.id || ''"
  >
    <template #actions>
      <NebulaButton variant="primary" @click="openCreate">
        注册应用
      </NebulaButton>
      <NebulaButton variant="secondary" @click="loadApps">刷新</NebulaButton>
    </template>

    <div class="page__table-wrap">
      <NebulaTable :data="apps" row-key="id">
        <NebulaTableColumn field="label" title="名称" min-width="120" />
        <NebulaTableColumn field="renderer" title="Renderer" min-width="120" />
        <NebulaTableColumn field="preload" title="Preload" min-width="120" />
        <NebulaTableColumn field="sortOrder" title="排序" width="80" />
        <NebulaTableColumn field="status" title="状态" width="90">
          <template #default="{ row }">
            <NebulaTag
              :variant="row.status === 'ACTIVE' ? 'success' : 'default'"
            >
              {{ row.status === 'ACTIVE' ? '启用' : '禁用' }}
            </NebulaTag>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn title="操作" width="230">
          <template #default="{ row }">
            <div class="row-actions">
              <NebulaButton variant="ghost" @click="openDetails(row)">
                详情
              </NebulaButton>
              <NebulaButton variant="secondary" @click="toggleStatus(row)">
                {{ row.status === 'ACTIVE' ? '禁用' : '启用' }}
              </NebulaButton>
              <NebulaButton variant="ghost" @click="removeApp(row)">
                删除
              </NebulaButton>
            </div>
          </template>
        </NebulaTableColumn>
      </NebulaTable>
    </div>

    <template #detail>
      <dl v-if="selected" class="entity-detail">
        <div>
          <dt>应用名称</dt>
          <dd>{{ selected.label }}</dd>
        </div>
        <div>
          <dt>Renderer</dt>
          <dd>{{ selected.renderer || '未配置' }}</dd>
        </div>
        <div>
          <dt>Preload</dt>
          <dd>{{ selected.preload || '未配置' }}</dd>
        </div>
        <div>
          <dt>状态</dt>
          <dd>{{ selected.status }}</dd>
        </div>
      </dl>
    </template>

    <template #dialogs>
      <NebulaDialog
        v-model:open="showDialog"
        title="注册应用"
        description="应用注册会影响 Shell 导航和桌面窗口入口。"
      >
        <label class="field">
          <span>名称</span>
          <NebulaInput v-model="form.label" />
        </label>
        <label class="field">
          <span>Renderer</span>
          <NebulaInput v-model="form.renderer" placeholder="integration" />
        </label>
        <label class="field">
          <span>Preload</span>
          <NebulaInput v-model="form.preload" />
        </label>
        <label class="field">
          <span>排序</span>
          <NebulaInput v-model="form.sortOrder" type="number" />
        </label>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showDialog = false">
            取消
          </NebulaButton>
          <NebulaButton :disabled="saving" @click="saveApp">
            {{ saving ? '保存中…' : '保存' }}
          </NebulaButton>
        </div>
      </NebulaDialog>
    </template>
  </EntityListPage>
</template>

<style scoped lang="scss">
.row-actions {
  display: flex;
  gap: 6px;
}

.entity-detail {
  display: grid;
  margin: 0;
}

.entity-detail div {
  display: grid;
  grid-template-columns: 100px minmax(0, 1fr);
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid hsl(var(--border));
}

.entity-detail dt {
  color: hsl(var(--muted-foreground));
}

.entity-detail dd {
  margin: 0;
}
</style>
