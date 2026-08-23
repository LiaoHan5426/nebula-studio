<script setup lang="ts">
import type { OrganizationNode, OrgPolicy } from '@/shared/api/system';

import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import {
  NebulaButton,
  NebulaDialog,
  NebulaInput,
  NebulaPane,
} from '@nebula-studio/nebula-ui';

import { organizationsApi, orgPolicyApi } from '@/shared/api/system';
import { useConfirm } from '@/shared/composables/useConfirm';
import { isApiSuccess } from '@/shared/types';

import OrganizationTreeNode from './OrganizationTreeNode.vue';

const { t } = useI18n();
const tree = ref<OrganizationNode[]>([]);
const policy = ref<OrgPolicy>({ enabled: false, multiOrgEnabled: false });
const loading = ref(false);
const savingPolicy = ref(false);
const showDialog = ref(false);
const saving = ref(false);

const form = ref({
  orgName: '',
  orgCode: '',
  parentId: '',
  description: '',
  status: 'ACTIVE',
});

onMounted(() => {
  void loadAll();
});

async function loadAll() {
  loading.value = true;
  try {
    const [treeRes, policyRes] = await Promise.all([
      organizationsApi.tree(),
      orgPolicyApi.get(),
    ]);
    if (isApiSuccess(treeRes)) {
      tree.value = treeRes.data ?? [];
    }
    if (isApiSuccess(policyRes)) {
      policy.value = policyRes.data;
    }
  } finally {
    loading.value = false;
  }
}

function openCreate(parentId = '') {
  form.value = {
    orgName: '',
    orgCode: '',
    parentId,
    description: '',
    status: 'ACTIVE',
  };
  showDialog.value = true;
}

async function saveOrganization() {
  saving.value = true;
  try {
    const response = await organizationsApi.create({
      orgName: form.value.orgName.trim(),
      orgCode: form.value.orgCode.trim(),
      parentId: form.value.parentId || undefined,
      description: form.value.description.trim() || undefined,
      status: form.value.status,
    });
    if (isApiSuccess(response)) {
      showDialog.value = false;
      await loadAll();
    }
  } finally {
    saving.value = false;
  }
}

async function removeOrganization(node: OrganizationNode) {
  const confirmed = await useConfirm(
    t('orgs.confirmDelete', { name: node.orgName }),
  );
  if (!confirmed) return;
  const response = await organizationsApi.delete(node.id);
  if (isApiSuccess(response)) {
    await loadAll();
  }
}

async function savePolicy() {
  savingPolicy.value = true;
  try {
    const response = await orgPolicyApi.update({ ...policy.value });
    if (isApiSuccess(response)) {
      policy.value = response.data;
    }
  } finally {
    savingPolicy.value = false;
  }
}
</script>

<template>
  <div class="page">
    <NebulaPane :title="t('orgs.policy')" :description="t('orgs.policyHint')">
      <label class="toggle">
        <input v-model="policy.enabled" type="checkbox" />
        <span>{{ t('orgs.enable') }}</span>
      </label>
      <label class="toggle">
        <input
          v-model="policy.multiOrgEnabled"
          type="checkbox"
          :disabled="!policy.enabled"
        />
        <span>{{ t('orgs.multi') }}</span>
      </label>
      <div class="page__actions">
        <NebulaButton :disabled="savingPolicy" @click="savePolicy">
          {{ savingPolicy ? t('common.saving') : t('orgs.savePolicy') }}
        </NebulaButton>
      </div>
    </NebulaPane>

    <div class="page__actions">
      <NebulaButton variant="primary" @click="openCreate()">
        {{ t('orgs.create') }}
      </NebulaButton>
      <NebulaButton variant="secondary" @click="loadAll">
        {{ loading ? t('common.loading') : t('common.refresh') }}
      </NebulaButton>
    </div>

    <NebulaPane :title="t('orgs.tree')">
      <div v-if="tree.length === 0 && !loading" class="empty">
        {{ t('orgs.empty') }}
      </div>
      <OrganizationTreeNode
        v-for="node in tree"
        :key="node.id"
        :node="node"
        @add-child="openCreate"
        @remove="removeOrganization"
      />
    </NebulaPane>

    <NebulaDialog
      v-model:open="showDialog"
      title="新建组织"
      description="创建后可继续添加下级组织，并在成员管理中分配人员。"
    >
      <label class="field">
        <span>组织名称</span>
        <NebulaInput v-model="form.orgName" />
      </label>
      <label class="field">
        <span>组织编码</span>
        <NebulaInput v-model="form.orgCode" />
      </label>
      <label class="field">
        <span>父级 ID</span>
        <NebulaInput v-model="form.parentId" placeholder="留空表示根组织" />
      </label>
      <label class="field">
        <span>描述</span>
        <NebulaInput v-model="form.description" />
      </label>
      <div class="modal__actions">
        <NebulaButton variant="secondary" @click="showDialog = false">
          取消
        </NebulaButton>
        <NebulaButton :disabled="saving" @click="saveOrganization">
          {{ saving ? '保存中…' : '保存' }}
        </NebulaButton>
      </div>
    </NebulaDialog>
  </div>
</template>

<style scoped lang="scss">
.toggle {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-top: 10px;
  font-size: 14px;
}

.empty {
  padding: 12px 0;
  color: hsl(var(--muted-foreground));
}
</style>
