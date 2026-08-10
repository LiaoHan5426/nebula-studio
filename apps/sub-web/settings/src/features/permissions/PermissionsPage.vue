<script setup lang="ts">
import type { PermissionNode } from '@/shared/api/system';

import { computed, onMounted, ref } from 'vue';

import {
  NebulaButton,
  NebulaDialog,
  NebulaInput,
  NebulaSelect,
  NebulaSwitch,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { permissionsApi } from '@/shared/api/system';
import EntityListPage from '@/shared/components/EntityListPage.vue';
import { useConfirm } from '@/shared/composables/useConfirm';
import {
  isButtonPermType,
  PERM_TYPE_OPTIONS,
  permTypeLabel,
} from '@/shared/permissionType';
import { isApiSuccess } from '@/shared/types';

const tree = ref<PermissionNode[]>([]);
const loading = ref(false);
const showDialog = ref(false);
const saving = ref(false);
const editingId = ref<null | string>(null);
const parentIdLocked = ref(false);
const parentCodeById = ref(new Map<string, string>());
const statusUpdatingId = ref<null | string>(null);
const viewMode = ref<'matrix' | 'tree'>('tree');
const keyword = ref('');
const selected = ref<PermissionNode>();
const detailOpen = ref(false);

const form = ref({
  permName: '',
  permCode: '',
  permType: 'MENU',
  parentId: '',
  description: '',
  sortOrder: 0,
});

const dialogTitle = computed(() => (editingId.value ? '编辑权限' : '新建权限'));

const treeConfig = {
  children: 'children',
  expandAll: true,
  indent: 18,
  line: true,
};
const flatPermissions = computed(() => {
  const result: PermissionNode[] = [];
  const visit = (nodes: PermissionNode[]) => {
    for (const node of nodes) {
      result.push(node);
      if (node.children?.length) visit(node.children);
    }
  };
  visit(tree.value);
  return result;
});
const tableRows = computed(() => {
  const query = keyword.value.trim().toLowerCase();
  if (!query) {
    return viewMode.value === 'tree' ? tree.value : flatPermissions.value;
  }
  return flatPermissions.value.filter((permission) =>
    [
      permission.permName,
      permission.permCode,
      permission.description,
      permission.permType,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
      .includes(query),
  );
});

onMounted(() => {
  void loadTree();
});

function indexTree(
  nodes: PermissionNode[],
  parentCode = '',
): Map<string, string> {
  const map = new Map<string, string>();
  for (const node of nodes) {
    map.set(node.id, parentCode);
    if (node.children?.length) {
      const childMap = indexTree(node.children, node.permCode);
      childMap.forEach((value, key) => map.set(key, value));
    }
  }
  return map;
}

async function loadTree() {
  loading.value = true;
  try {
    const response = await permissionsApi.tree();
    if (isApiSuccess(response)) {
      tree.value = response.data ?? [];
      parentCodeById.value = indexTree(tree.value);
    }
  } finally {
    loading.value = false;
  }
}

function openCreate(parentId = '') {
  editingId.value = null;
  parentIdLocked.value = Boolean(parentId);
  form.value = {
    permName: '',
    permCode: '',
    permType: 'MENU',
    parentId,
    description: '',
    sortOrder: 0,
  };
  showDialog.value = true;
}

function openEdit(node: PermissionNode) {
  editingId.value = node.id;
  parentIdLocked.value = false;
  form.value = {
    permName: node.permName,
    permCode: node.permCode,
    permType: node.permType ?? 'MENU',
    parentId: node.parentId ?? '',
    description: node.description ?? '',
    sortOrder: node.sortOrder ?? 0,
  };
  showDialog.value = true;
}

function openDetail(node: PermissionNode) {
  selected.value = node;
  detailOpen.value = true;
}

async function savePermission() {
  saving.value = true;
  try {
    const payload = {
      permName: form.value.permName.trim(),
      permCode: form.value.permCode.trim(),
      permType: form.value.permType,
      parentId: form.value.parentId || undefined,
      description: form.value.description.trim() || undefined,
      sortOrder: form.value.sortOrder,
    };
    const response = editingId.value
      ? await permissionsApi.update(editingId.value, payload)
      : await permissionsApi.create(payload);
    if (isApiSuccess(response)) {
      showDialog.value = false;
      await loadTree();
    }
  } finally {
    saving.value = false;
  }
}

async function removePermission(node: PermissionNode) {
  const confirmed = await useConfirm(
    `确定删除权限「${node.permName}」？该权限及其下级继承关系可能从已绑定角色中失效，请先确认没有业务角色依赖。`,
  );
  if (!confirmed) return;
  const response = await permissionsApi.delete(node.id);
  if (isApiSuccess(response)) {
    await loadTree();
  }
}

async function toggleStatus(node: PermissionNode, enabled: boolean) {
  const next = enabled ? 'ACTIVE' : 'INACTIVE';
  if (node.status === next) return;
  statusUpdatingId.value = node.id;
  try {
    const response = await permissionsApi.updateStatus(node.id, next);
    if (isApiSuccess(response)) {
      node.status = next;
    }
  } finally {
    statusUpdatingId.value = null;
  }
}

function formatTime(value?: string) {
  if (!value) return '-';
  return String(value).replace('T', ' ').slice(0, 19);
}

function isActive(row: PermissionNode): boolean {
  return row.status !== 'INACTIVE';
}

function isButtonPermission(row: PermissionNode): boolean {
  return isButtonPermType(row.permType);
}

function parentCode(row: PermissionNode): string {
  return parentCodeById.value.get(row.id) || '-';
}
</script>

<template>
  <EntityListPage
    v-model:detail-open="detailOpen"
    title="权限管理"
    description="在权限树与矩阵之间切换，核对父级继承、冲突与实际权限来源。"
    eyebrow="Access control"
    :result-summary="`${tableRows.length} 项权限`"
    :loading="loading"
    :empty="!loading && tableRows.length === 0"
    detail-title="权限详情"
    :detail-subtitle="selected?.permCode"
  >
    <template #actions>
      <NebulaButton variant="primary" @click="openCreate()">
        新建权限
      </NebulaButton>
      <NebulaButton variant="secondary" @click="loadTree">
        {{ loading ? '加载中…' : '刷新' }}
      </NebulaButton>
      <div class="view-switch" role="group" aria-label="权限视图">
        <NebulaButton
          :variant="viewMode === 'tree' ? 'primary' : 'outline'"
          @click="viewMode = 'tree'"
        >
          权限树
        </NebulaButton>
        <NebulaButton
          :variant="viewMode === 'matrix' ? 'primary' : 'outline'"
          @click="viewMode = 'matrix'"
        >
          权限矩阵
        </NebulaButton>
      </div>
    </template>

    <template #filters>
      <NebulaInput
        v-model="keyword"
        placeholder="搜索权限名称、编码或类型"
        aria-label="搜索权限"
      />
    </template>

    <p class="permission-context">
      实际权限来源 = 直接角色 + 继承角色 + 组织策略。当前列表展示平台权限定义；
      角色继承与冲突标记将在角色绑定数据中同步呈现。
    </p>

    <div class="page__table-wrap permissions-table">
      <NebulaTable
        :data="tableRows"
        :loading="loading"
        row-key="id"
        :tree-config="
          viewMode === 'tree' && !keyword.trim() ? treeConfig : undefined
        "
        max-height="640"
      >
        <NebulaTableColumn
          field="permName"
          title="名称"
          min-width="180"
          tree-node
          show-overflow="ellipsis"
        />
        <NebulaTableColumn field="permCode" title="权限标识" min-width="160">
          <template #default="{ row }">
            <NebulaTag variant="info">{{ row.permCode }}</NebulaTag>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn title="父级标识" min-width="140">
          <template #default="{ row }">
            <NebulaTag v-if="parentCode(row) !== '-'" variant="info">
              {{ parentCode(row) }}
            </NebulaTag>
            <span v-else class="muted">-</span>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn title="权限按钮" width="96" align="center">
          <template #default="{ row }">
            <NebulaTag
              :variant="isButtonPermission(row) ? 'success' : 'default'"
            >
              {{ isButtonPermission(row) ? '是' : '否' }}
            </NebulaTag>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn
          field="permType"
          title="类型"
          width="88"
          align="center"
        >
          <template #default="{ row }">
            {{ permTypeLabel(row.permType) }}
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn
          field="sortOrder"
          title="排序"
          width="72"
          align="center"
        />
        <NebulaTableColumn title="状态" width="140" align="center">
          <template #default="{ row }">
            <div class="status-cell">
              <span class="status-label">停用</span>
              <span
                class="status-switch"
                :class="{ 'is-busy': statusUpdatingId === row.id }"
              >
                <NebulaSwitch
                  :model-value="isActive(row)"
                  @update:model-value="toggleStatus(row, $event)"
                />
              </span>
              <span class="status-label">正常</span>
            </div>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn title="创建时间" width="168">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn
          v-if="viewMode === 'matrix'"
          title="实际权限来源"
          min-width="150"
        >
          <template #default>平台权限定义</template>
        </NebulaTableColumn>
        <NebulaTableColumn v-if="viewMode === 'matrix'" title="冲突" width="88">
          <template #default>
            <NebulaTag variant="success">无冲突</NebulaTag>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn title="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="row-actions">
              <NebulaButton variant="ghost" @click="openDetail(row)">
                详情
              </NebulaButton>
              <NebulaButton variant="ghost" @click="openEdit(row)">
                编辑
              </NebulaButton>
              <NebulaButton variant="ghost" @click="openCreate(row.id)">
                新增下级
              </NebulaButton>
              <NebulaButton
                variant="ghost"
                class="danger"
                @click="removePermission(row)"
              >
                删除
              </NebulaButton>
            </div>
          </template>
        </NebulaTableColumn>
      </NebulaTable>
    </div>

    <template #detail>
      <dl v-if="selected" class="permission-detail">
        <div>
          <dt>权限名称</dt>
          <dd>{{ selected.permName }}</dd>
        </div>
        <div>
          <dt>权限编码</dt>
          <dd>{{ selected.permCode }}</dd>
        </div>
        <div>
          <dt>类型</dt>
          <dd>{{ permTypeLabel(selected.permType) }}</dd>
        </div>
        <div>
          <dt>父级来源</dt>
          <dd>{{ parentCode(selected) }}</dd>
        </div>
        <div>
          <dt>实际来源</dt>
          <dd>平台权限定义</dd>
        </div>
        <div>
          <dt>冲突状态</dt>
          <dd>未发现冲突</dd>
        </div>
      </dl>
    </template>

    <template #dialogs>
      <NebulaDialog
        v-model:open="showDialog"
        :title="dialogTitle"
        description="权限编码保存后不可修改；父级关系将影响角色的继承权限。"
      >
        <label class="field">
          <span>权限名称</span>
          <NebulaInput v-model="form.permName" />
        </label>
        <label class="field">
          <span>权限编码</span>
          <NebulaInput v-model="form.permCode" :readonly="Boolean(editingId)" />
        </label>
        <label class="field">
          <span>类型</span>
          <NebulaSelect v-model="form.permType" :options="PERM_TYPE_OPTIONS" />
        </label>
        <label class="field">
          <span>父级 ID</span>
          <NebulaInput
            v-model="form.parentId"
            placeholder="留空表示根节点"
            :readonly="parentIdLocked || Boolean(editingId)"
          />
        </label>
        <label class="field">
          <span>排序</span>
          <NebulaInput v-model="form.sortOrder" type="number" />
        </label>
        <label class="field">
          <span>描述</span>
          <NebulaInput v-model="form.description" />
        </label>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showDialog = false">
            取消
          </NebulaButton>
          <NebulaButton :disabled="saving" @click="savePermission">
            {{ saving ? '保存中…' : '保存' }}
          </NebulaButton>
        </div>
      </NebulaDialog>
    </template>
  </EntityListPage>
</template>

<style scoped lang="scss">
.permissions-table {
  :deep(.nebula-table) {
    --vxe-ui-table-border-color: hsl(var(--border) / 72%);
    --vxe-ui-table-header-background-color: hsl(var(--muted) / 28%);
    --vxe-ui-table-row-hover-background-color: hsl(var(--muted) / 18%);
    --vxe-ui-font-color: hsl(var(--foreground));
    --vxe-ui-table-header-font-color: hsl(var(--muted-foreground));
  }
}

.row-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
}

.danger {
  color: hsl(var(--destructive));
}

.status-cell {
  display: inline-flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
}

.status-label {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.is-busy {
  pointer-events: none;
  opacity: 0.6;
}

.muted {
  color: hsl(var(--muted-foreground));
}

.view-switch {
  display: flex;
  gap: 4px;
  margin-left: auto;
}

.permission-context {
  padding: 10px 12px;
  margin: 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 40%);
  border-radius: var(--radius-md);
}

.permission-detail {
  display: grid;
  gap: var(--space-3);
  margin: 0;
}

.permission-detail div {
  display: grid;
  gap: var(--space-1);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid hsl(var(--border));
}

.permission-detail dt {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.permission-detail dd {
  margin: 0;
}
</style>
