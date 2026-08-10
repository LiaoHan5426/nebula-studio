<script setup lang="ts">
import type { UserRecord } from '@/shared/api/system';

import { onMounted, ref } from 'vue';

import {
  NebulaButton,
  NebulaDialog,
  NebulaInput,
  NebulaSelect,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { usersApi } from '@/shared/api/system';
import EntityListPage from '@/shared/components/EntityListPage.vue';
import { useConfirm } from '@/shared/composables/useConfirm';
import { isApiSuccess } from '@/shared/types';

const users = ref<UserRecord[]>([]);
const loading = ref(false);
const page = ref(1);
const total = ref(0);
const keyword = ref('');
const showDialog = ref(false);
const saving = ref(false);
const selected = ref<UserRecord>();
const detailOpen = ref(false);

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
  const confirmed = await useConfirm(
    `删除用户 ${user.username} 后，其登录会话和角色关联将失效。是否继续？`,
  );
  if (!confirmed) return;
  const response = await usersApi.delete(user.id);
  if (isApiSuccess(response)) {
    await loadUsers();
  }
}

function openDetails(user: UserRecord) {
  selected.value = user;
  detailOpen.value = true;
}
</script>

<template>
  <EntityListPage
    v-model:detail-open="detailOpen"
    title="成员管理"
    description="管理组织成员、账号状态和基础身份信息。"
    eyebrow="Organization & members"
    :result-summary="`共 ${total} 名成员`"
    :loading="loading"
    :empty="!loading && users.length === 0"
    :detail-title="selected?.username || '成员详情'"
    :detail-subtitle="selected?.id || ''"
  >
    <template #actions>
      <NebulaButton variant="primary" @click="openCreate">
        新建用户
      </NebulaButton>
    </template>
    <template #filters>
      <NebulaInput
        v-model="keyword"
        placeholder="搜索用户名、姓名或邮箱"
        class="search"
        @keydown.enter="loadUsers"
      />
    </template>
    <template #filterActions>
      <NebulaButton variant="outline" @click="loadUsers">查询</NebulaButton>
      <NebulaButton variant="secondary" @click="loadUsers">刷新</NebulaButton>
    </template>

    <div class="page__table-wrap">
      <NebulaTable :data="users" row-key="id">
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
        <NebulaTableColumn title="操作" width="230">
          <template #default="{ row }">
            <div class="row-actions">
              <NebulaButton variant="ghost" @click="openDetails(row)">
                详情
              </NebulaButton>
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

    <template #detail>
      <dl v-if="selected" class="entity-detail">
        <div>
          <dt>用户名</dt>
          <dd>{{ selected.username }}</dd>
        </div>
        <div>
          <dt>姓名</dt>
          <dd>{{ selected.realName || '未填写' }}</dd>
        </div>
        <div>
          <dt>邮箱</dt>
          <dd>{{ selected.email || '未填写' }}</dd>
        </div>
        <div>
          <dt>账号状态</dt>
          <dd>{{ selected.status }}</dd>
        </div>
      </dl>
    </template>

    <template #dialogs>
      <NebulaDialog
        v-model:open="showDialog"
        title="新建用户"
        description="创建账号后，可在角色管理中分配访问范围。"
        content-class="settings-form-dialog"
      >
        <div class="dialog-form">
          <label class="field">
            <span>用户名</span>
            <NebulaInput v-model="form.username" placeholder="admin" />
          </label>
          <label class="field">
            <span>密码</span>
            <NebulaInput
              v-model="form.password"
              type="password"
              placeholder="••••••"
            />
          </label>
          <label class="field">
            <span>姓名</span>
            <NebulaInput v-model="form.realName" />
          </label>
          <label class="field">
            <span>邮箱</span>
            <NebulaInput v-model="form.email" />
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
        </div>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showDialog = false">
            取消
          </NebulaButton>
          <NebulaButton :disabled="saving" @click="saveUser">
            {{ saving ? '保存中…' : '保存' }}
          </NebulaButton>
        </div>
      </NebulaDialog>
    </template>
  </EntityListPage>
</template>

<style scoped lang="scss">
.search {
  min-width: 200px;
}

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
