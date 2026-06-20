<script setup lang="ts">
import { onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaPane,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { usersApi } from '@/shared/api/system';
import type { UserRecord } from '@/shared/api/system';
import { isApiSuccess } from '@/shared/types';
import { useConfirm } from '@/shared/composables/useConfirm';

const users = ref<UserRecord[]>([]);
const loading = ref(false);
const page = ref(1);
const total = ref(0);
const keyword = ref('');
const showDialog = ref(false);
const saving = ref(false);

const form = ref({
  username: '',
  password: '',
  realName: '',
  email: '',
  status: 'ACTIVE',
});

onMounted(() => {
  void loadUsers();
});

async function loadUsers() {
  loading.value = true;
  try {
    const response = await usersApi.page({
      page: page.value,
      size: 20,
      keyword: keyword.value.trim() || undefined,
    });
    if (isApiSuccess(response)) {
      users.value = response.data.records ?? [];
      total.value = response.data.total ?? 0;
    }
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  form.value = {
    username: '',
    password: '',
    realName: '',
    email: '',
    status: 'ACTIVE',
  };
  showDialog.value = true;
}

async function saveUser() {
  saving.value = true;
  try {
    const response = await usersApi.create({
      username: form.value.username.trim(),
      password: form.value.password,
      realName: form.value.realName.trim() || undefined,
      email: form.value.email.trim() || undefined,
      status: form.value.status,
    });
    if (isApiSuccess(response)) {
      showDialog.value = false;
      await loadUsers();
    }
  } finally {
    saving.value = false;
  }
}

async function toggleStatus(user: UserRecord) {
  const next = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  const response = await usersApi.updateStatus(user.id, next);
  if (isApiSuccess(response)) {
    await loadUsers();
  }
}

async function removeUser(user: UserRecord) {
  const confirmed = await useConfirm(`确定删除用户 ${user.username}？`);
  if (!confirmed) return;
  const response = await usersApi.delete(user.id);
  if (isApiSuccess(response)) {
    await loadUsers();
  }
}
</script>

<template>
  <div class="page">
    <div class="page__actions">
      <input
        v-model="keyword"
        class="search"
        placeholder="搜索用户名"
        @keyup.enter="loadUsers"
      />
      <NebulaButton variant="primary" @click="openCreate"
        >新建用户</NebulaButton
      >
      <NebulaButton variant="secondary" @click="loadUsers">刷新</NebulaButton>
    </div>

    <div class="page__table-wrap">
      <NebulaTable :data="users" :loading="loading" row-key="id">
        <NebulaTableColumn field="username" title="用户名" min-width="120" />
        <NebulaTableColumn field="realName" title="姓名" min-width="100" />
        <NebulaTableColumn field="email" title="邮箱" min-width="140" />
        <NebulaTableColumn field="status" title="状态" width="90">
          <template #default="{ row }">
            <NebulaTag
              :variant="row.status === 'ACTIVE' ? 'success' : 'default'"
            >
              {{ row.status === 'ACTIVE' ? '正常' : '禁用' }}
            </NebulaTag>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn title="操作" width="180">
          <template #default="{ row }">
            <div class="row-actions">
              <NebulaButton variant="secondary" @click="toggleStatus(row)">
                {{ row.status === 'ACTIVE' ? '禁用' : '启用' }}
              </NebulaButton>
              <NebulaButton variant="ghost" @click="removeUser(row)">
                删除
              </NebulaButton>
            </div>
          </template>
        </NebulaTableColumn>
      </NebulaTable>
    </div>

    <p class="hint">共 {{ total }} 条</p>

    <div
      v-if="showDialog"
      class="modal-overlay"
      @click.self="showDialog = false"
    >
      <NebulaPane title="新建用户" class="modal">
        <label class="field">
          <span>用户名</span>
          <input v-model="form.username" placeholder="admin" />
        </label>
        <label class="field">
          <span>密码</span>
          <input v-model="form.password" type="password" placeholder="••••••" />
        </label>
        <label class="field">
          <span>姓名</span>
          <input v-model="form.realName" />
        </label>
        <label class="field">
          <span>邮箱</span>
          <input v-model="form.email" />
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
          <NebulaButton :disabled="saving" @click="saveUser">
            {{ saving ? '保存中…' : '保存' }}
          </NebulaButton>
        </div>
      </NebulaPane>
    </div>
  </div>
</template>

<style scoped lang="scss">
.search {
  min-width: 200px;
  padding: 8px 10px;
  font: inherit;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.row-actions {
  display: flex;
  gap: 6px;
}

.hint {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}
</style>
