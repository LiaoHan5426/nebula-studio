<script setup lang="ts">
import { NebulaButton, NebulaPane } from '@nebula-studio/nebula-ui';

import ServiceAuthorizeGrantDialog from './components/authorize/ServiceAuthorizeGrantDialog.vue';
import ServiceAuthorizeHeader from './components/authorize/ServiceAuthorizeHeader.vue';
import ServiceAuthorizeTable from './components/authorize/ServiceAuthorizeTable.vue';
import { useServiceAuthorize } from './composables/useServiceAuthorize';

const {
  tenants,
  selectedTenantId,
  allowedSummary,
  authorizeRows,
  loading,
  actingId,
  showGrantDialog,
  grantDialogTitle,
  grantTarget,
  grantForm,
  refreshAll,
  openGrantDialog,
  closeGrantDialog,
  submitGrant,
  handleRevoke,
} = useServiceAuthorize();
</script>

<template>
  <div class="page">
    <NebulaPane
      title="服务授权"
      description="为对接租户授予服务调用权限，并可配置有效期、服务时间段、总调用次数与调用频率。网关会在鉴权时校验上述策略。"
    >
      <div class="page__toolbar">
        <ServiceAuthorizeHeader
          :tenants="tenants"
          :selected-tenant-id="selectedTenantId"
          :allowed-summary="allowedSummary"
          @update:selected-tenant-id="selectedTenantId = $event"
        />
        <NebulaButton variant="outline" @click="refreshAll">刷新</NebulaButton>
      </div>

      <div v-if="!selectedTenantId" class="page__empty">
        请先创建租户后再进行服务授权
      </div>

      <div v-else class="page__table-wrap">
        <ServiceAuthorizeTable
          :rows="authorizeRows"
          :loading="loading"
          :acting-id="actingId"
          @grant="openGrantDialog"
          @revoke="handleRevoke"
        />
      </div>
    </NebulaPane>

    <ServiceAuthorizeGrantDialog
      :open="showGrantDialog"
      :title="grantDialogTitle"
      :target="grantTarget"
      :form="grantForm"
      :acting-id="actingId"
      @close="closeGrantDialog"
      @submit="submitGrant"
      @update:form="grantForm = $event"
    />
  </div>
</template>

<style scoped>
.page__toolbar {
  flex-wrap: wrap;
  align-items: flex-end;
}
</style>
