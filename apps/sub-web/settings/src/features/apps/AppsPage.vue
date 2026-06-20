<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { appsApi } from '@/shared/api/system';
import type { ShellAppRecord } from '@/shared/api/system';
import { isApiSuccess } from '@/shared/types';
import { useConfirm } from '@/shared/composables/useConfirm';

const apps = ref<ShellAppRecord[]>([]);
const loading = ref(false);
const showDialog = ref(false);
const saving = ref(false);

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
  const confirmed = await useConfirm(`确定删除应用 ${app.label}？`);
  if (!confirmed) return;
  const response = await appsApi.delete(app.id);
  if (isApiSuccess(response)) {
    await loadApps();
  }
}
</script>

<template>
  <div class="page">
    <div class="page__actions">
      <NebulaButton variant="primary" @click="openCreate"
        >注册应用</NebulaButton
      >
      <NebulaButton variant="secondary" @click="loadApps">刷新</NebulaButton>
    </div>

    <div class="page__table-wrap">
      <NebulaTable :data="apps" :loading="loading" row-key="id">
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
        <NebulaTableColumn title="操作" width="180">
          <template #default="{ row }">
            <div class="row-actions">
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

    <div
      v-if="showDialog"
      class="modal-overlay"
      @click.self="showDialog = false"
    >
      <NebulaPane title="注册应用" class="modal">
        <label class="field">
          <span>名称</span>
          <input v-model="form.label" />
        </label>
        <label class="field">
          <span>Renderer</span>
          <input v-model="form.renderer" placeholder="integration" />
        </label>
        <label class="field">
          <span>Preload</span>
          <input v-model="form.preload" />
        </label>
        <label class="field">
          <span>排序</span>
          <input v-model.number="form.sortOrder" type="number" />
        </label>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showDialog = false">
            取消
          </NebulaButton>
          <NebulaButton :disabled="saving" @click="saveApp">
            {{ saving ? '保存中…' : '保存' }}
          </NebulaButton>
        </div>
      </NebulaPane>
    </div>
  </div>
</template>

<style scoped lang="scss">
.row-actions {
  display: flex;
  gap: 6px;
}
</style>
