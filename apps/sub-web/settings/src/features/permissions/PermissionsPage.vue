<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  NebulaButton,
  NebulaPane,
  NebulaSwitch,
  NebulaTable,
  NebulaTableColumn,
  NebulaTag,
} from '@nebula-studio/nebula-ui';

import { permissionsApi } from '@/shared/api/system';
import type { PermissionNode } from '@/shared/api/system';
import { isApiSuccess } from '@/shared/types';
import { useConfirm } from '@/shared/composables/useConfirm';
import {
  PERM_TYPE_OPTIONS,
  isButtonPermType,
  permTypeLabel,
} from '@/shared/permissionType';

const tree = ref<PermissionNode[]>([]);
const loading = ref(false);
const showDialog = ref(false);
const saving = ref(false);
const editingId = ref<string | null>(null);
const parentIdLocked = ref(false);
const parentCodeById = ref(new Map<string, string>());
const statusUpdatingId = ref<string | null>(null);

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
  const confirmed = await useConfirm(`确定删除权限「${node.permName}」？`);
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
  <div class="page">
    <div class="page__actions">
      <NebulaButton variant="primary" @click="openCreate()"
        >新建权限</NebulaButton
      >
      <NebulaButton variant="secondary" @click="loadTree">
        {{ loading ? '加载中…' : '刷新' }}
      </NebulaButton>
    </div>

    <div class="page__table-wrap permissions-table">
      <NebulaTable
        :data="tree"
        :loading="loading"
        row-key="id"
        :tree-config="treeConfig"
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
              <NebulaSwitch
                :model-value="isActive(row)"
                :class="{ 'is-busy': statusUpdatingId === row.id }"
                @update:model-value="toggleStatus(row, $event)"
              />
              <span class="status-label">正常</span>
            </div>
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn title="创建时间" width="168">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </NebulaTableColumn>
        <NebulaTableColumn title="操作" width="220" fixed="right">
          <template #default="{ row }">
            <div class="row-actions">
              <NebulaButton variant="ghost" @click="openEdit(row)"
                >编辑</NebulaButton
              >
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

    <div
      v-if="showDialog"
      class="modal-overlay"
      @click.self="showDialog = false"
    >
      <NebulaPane :title="dialogTitle" class="modal">
        <label class="field">
          <span>权限名称</span>
          <input v-model="form.permName" />
        </label>
        <label class="field">
          <span>权限编码</span>
          <input v-model="form.permCode" :readonly="Boolean(editingId)" />
        </label>
        <label class="field">
          <span>类型</span>
          <select v-model="form.permType">
            <option
              v-for="option in PERM_TYPE_OPTIONS"
              :key="option.value"
              :value="option.value"
            >
              {{ option.label }}
            </option>
          </select>
        </label>
        <label class="field">
          <span>父级 ID</span>
          <input
            v-model="form.parentId"
            placeholder="留空表示根节点"
            :readonly="parentIdLocked || Boolean(editingId)"
          />
        </label>
        <label class="field">
          <span>排序</span>
          <input v-model.number="form.sortOrder" type="number" min="0" />
        </label>
        <label class="field">
          <span>描述</span>
          <input v-model="form.description" />
        </label>
        <div class="modal__actions">
          <NebulaButton variant="secondary" @click="showDialog = false">
            取消
          </NebulaButton>
          <NebulaButton :disabled="saving" @click="savePermission">
            {{ saving ? '保存中…' : '保存' }}
          </NebulaButton>
        </div>
      </NebulaPane>
    </div>
  </div>
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
</style>
