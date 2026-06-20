<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { rolesApi } from '@/shared/api/system';
import type { RoleRecord } from '@/shared/api/system';
import { isApiSuccess } from '@/shared/types';
import { useConfirm } from '@/shared/composables/useConfirm';

const roles = ref<RoleRecord[]>([]);
const loading = ref(false);
const showDialog = ref(false);
const saving = ref(false);

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
  const confirmed = await useConfirm(`确定删除角色 ${role.roleName}？`);
  if (!confirmed) return;
  const response = await rolesApi.delete(role.id);
  if (isApiSuccess(response)) {
    await loadRoles();
  }
}
</script>

<template>
  <div class="page">
    <div class="page__actions">
      <NebulaButton variant="primary" @click="openCreate"
        >新建角色</NebulaButton
      >
      <NebulaButton variant="secondary" @click="loadRoles">刷新</NebulaButton>
    </div>

    <div class="page__table-wrap">
      <NebulaTable :data="roles" :loading="loading" row-key="id">
        <NebulaTableColumn field="roleName" title="角色名称" min-width="120" />
        <NebulaTableColumn field="roleCode" title="角色编码" min-width="120" />
        <NebulaTableColumn field="description" title="描述" min-width="160" />
        <NebulaTableColumn field="status" title="状态" width="90">
          <template #default="{ row }">
            <NebulaTag
              :variant="row.status === 'ACTIVE' ? 'success' : 'default'"
            >
              {{ row.status === 'ACTIVE' ? '正常' : '禁用' }}
            </NebulaTag>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn title="操作" width="100">
          <template #default="{ row }">
            <NebulaButton variant="ghost" @click="removeRole(row)"
              >删除</NebulaButton
            >
          </template>
        </NebulaTableColumn>
      </NebulaTable>
    </div>

    <div
      v-if="showDialog"
      class="modal-overlay"
      @click.self="showDialog = false"
    >
      <NebulaPane title="新建角色" class="modal">
        <label class="field">
          <span>角色名称</span>
          <input v-model="form.roleName" />
        </label>
        <label class="field">
          <span>角色编码</span>
          <input v-model="form.roleCode" />
        </label>
        <label class="field">
          <span>描述</span>
          <input v-model="form.description" />
        </label>
        <label class="field">
          <span>状态</span>
          <select v-model="form.status">
            <option value="ACTIVE">正常</option>
            <option value="INACTIVE">禁用</option>
          </select>
        </label>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showDialog = false">
            取消
          </NebulaButton>
          <NebulaButton :disabled="saving" @click="saveRole">
            {{ saving ? '保存中…' : '保存' }}
          </NebulaButton>
        </div>
      </NebulaPane>
    </div>
  </div>
</template>
