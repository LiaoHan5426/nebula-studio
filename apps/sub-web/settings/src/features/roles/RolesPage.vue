<script setup lang="ts">
import type { RoleRecord } from '@/shared/api/system';

import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  NebulaButton,
  NebulaDialog,
  NebulaInput,
  NebulaSelect,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { rolesApi } from '@/shared/api/system';
import EntityListPage from '@/shared/components/EntityListPage.vue';
import { useConfirm } from '@/shared/composables/useConfirm';
import { isApiSuccess } from '@/shared/types';

const { t } = useI18n();
const roles = ref<RoleRecord[]>([]);
const loading = ref(false);
const showDialog = ref(false);
const saving = ref(false);
const selected = ref<RoleRecord>();
const detailOpen = ref(false);

const form = ref({
  roleName: '',
  roleCode: '',
  description: '',
  status: 'ACTIVE',
});

onMounted(() => {
  void loadRoles();
});

async function loadRoles() {
  loading.value = true;
  try {
    const response = await rolesApi.list();
    if (isApiSuccess(response)) {
      roles.value = response.data ?? [];
    }
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  form.value = {
    roleName: '',
    roleCode: '',
    description: '',
    status: 'ACTIVE',
  };
  showDialog.value = true;
}

async function saveRole() {
  saving.value = true;
  try {
    const response = await rolesApi.create({
      roleName: form.value.roleName.trim(),
      roleCode: form.value.roleCode.trim(),
      description: form.value.description.trim() || undefined,
      status: form.value.status,
    });
    if (isApiSuccess(response)) {
      showDialog.value = false;
      await loadRoles();
    }
  } finally {
    saving.value = false;
  }
}

async function removeRole(role: RoleRecord) {
  const confirmed = await useConfirm(
    t('roles.confirmDelete', { name: role.roleName }),
  );
  if (!confirmed) return;
  const response = await rolesApi.delete(role.id);
  if (isApiSuccess(response)) {
    await loadRoles();
  }
}

function openDetails(role: RoleRecord) {
  selected.value = role;
  detailOpen.value = true;
}
</script>

<template>
  <EntityListPage
    v-model:detail-open="detailOpen"
    :title="t('roles.title')"
    :description="t('roles.description')"
    :eyebrow="t('roles.eyebrow')"
    :result-summary="t('roles.summary', { total: roles.length })"
    :loading="loading"
    :empty="!loading && roles.length === 0"
    :detail-title="selected?.roleName || t('roles.detail')"
    :detail-subtitle="selected?.roleCode || ''"
  >
    <template #actions>
      <NebulaButton variant="primary" @click="openCreate">
        {{ t('roles.create') }}
      </NebulaButton>
      <NebulaButton variant="secondary" @click="loadRoles">
        {{ t('common.refresh') }}
      </NebulaButton>
    </template>

    <div class="page__table-wrap">
      <NebulaTable :data="roles" row-key="id">
        <NebulaTableColumn
          field="roleName"
          :title="t('roles.name')"
          min-width="120"
        />
        <NebulaTableColumn
          field="roleCode"
          :title="t('roles.code')"
          min-width="120"
        />
        <NebulaTableColumn
          field="description"
          :title="t('roles.descriptionCol')"
          min-width="160"
        />
        <NebulaTableColumn field="status" :title="t('roles.status')" width="90">
          <template #default="{ row }">
            <NebulaTag
              :variant="row.status === 'ACTIVE' ? 'success' : 'default'"
            >
              {{ row.status === 'ACTIVE' ? '正常' : '禁用' }}
            </NebulaTag>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn :title="t('roles.actions')" width="160">
          <template #default="{ row }">
            <NebulaButton variant="ghost" @click="openDetails(row)">
              详情
            </NebulaButton>
            <NebulaButton variant="ghost" @click="removeRole(row)">
              删除
            </NebulaButton>
          </template>
        </NebulaTableColumn>
      </NebulaTable>
    </div>

    <template #detail>
      <dl v-if="selected" class="entity-detail">
        <div>
          <dt>角色名称</dt>
          <dd>{{ selected.roleName }}</dd>
        </div>
        <div>
          <dt>角色编码</dt>
          <dd>{{ selected.roleCode }}</dd>
        </div>
        <div>
          <dt>状态</dt>
          <dd>{{ selected.status }}</dd>
        </div>
        <div>
          <dt>继承来源</dt>
          <dd>直接角色；后端继承关系可用后将显示上游角色。</dd>
        </div>
        <div>
          <dt>实际权限</dt>
          <dd>由角色权限、继承权限和组织策略合并计算。</dd>
        </div>
      </dl>
    </template>

    <template #dialogs>
      <NebulaDialog
        v-model:open="showDialog"
        title="新建角色"
        description="角色保存后可在权限矩阵中配置访问能力。"
      >
        <label class="field">
          <span>角色名称</span>
          <NebulaInput v-model="form.roleName" />
        </label>
        <label class="field">
          <span>角色编码</span>
          <NebulaInput v-model="form.roleCode" />
        </label>
        <label class="field">
          <span>描述</span>
          <NebulaInput v-model="form.description" />
        </label>
        <label class="field">
          <span>状态</span>
          <NebulaSelect
            v-model="form.status"
            :options="[
              { value: 'ACTIVE', label: '正常' },
              { value: 'INACTIVE', label: '禁用' },
            ]"
          />
        </label>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showDialog = false">
            取消
          </NebulaButton>
          <NebulaButton :disabled="saving" @click="saveRole">
            {{ saving ? '保存中…' : '保存' }}
          </NebulaButton>
        </div>
      </NebulaDialog>
    </template>
  </EntityListPage>
</template>

<style scoped>
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
