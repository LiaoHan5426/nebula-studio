import { computed, ref } from 'vue';
import {
  readWebAuthSession,
  writeWebAuthSession,
} from '@nebula-studio/app-shell';

import { authMeApi, authModeApi, switchOrgApi } from '@/shared/api/systemAuth';
import { setCurrentOrgId } from '@/shared/api/client';
import type { OrgSummary } from '@/shared/types';
import { isApiSuccess } from '@/shared/types';

const orgEnabled = ref(false);
const multiOrgEnabled = ref(false);
const orgOptions = ref<OrgSummary[]>([]);
const currentOrgId = ref('');
const currentOrgName = ref('');
const loading = ref(false);

export function useOrganization() {
  const canSwitchOrg = computed(
    () =>
      orgEnabled.value && multiOrgEnabled.value && orgOptions.value.length > 1,
  );

  async function loadOrganizationContext(): Promise<void> {
    const session = readWebAuthSession();
    if (!session?.user && !session?.token) {
      resetOrganizationSession();
      return;
    }

    loading.value = true;
    try {
      const modeRes = await authModeApi.getMode();
      if (isApiSuccess(modeRes)) {
        orgEnabled.value = modeRes.data.orgEnabled;
        multiOrgEnabled.value = modeRes.data.multiOrgEnabled;
      }

      if (!orgEnabled.value) {
        orgOptions.value = [];
        currentOrgId.value = '';
        currentOrgName.value = '';
        return;
      }

      const meRes = await authMeApi.getMe();
      if (isApiSuccess(meRes)) {
        orgOptions.value = meRes.data.organizations ?? [];
        currentOrgId.value = meRes.data.currentOrgId ?? '';
        currentOrgName.value =
          meRes.data.currentOrgName ??
          orgOptions.value.find((org) => org.id === currentOrgId.value)
            ?.orgName ??
          '';
        setCurrentOrgId(currentOrgId.value);
      }
    } finally {
      loading.value = false;
    }
  }

  async function switchOrganization(orgId: string): Promise<void> {
    if (!orgId || orgId === currentOrgId.value) return;

    loading.value = true;
    try {
      const response = await switchOrgApi.switchOrg(orgId);
      if (!isApiSuccess(response)) return;

      currentOrgId.value = response.data.currentOrgId ?? orgId;
      currentOrgName.value = response.data.currentOrgName ?? '';
      setCurrentOrgId(currentOrgId.value);

      const session = readWebAuthSession();
      if (session && response.data.token) {
        writeWebAuthSession({
          ...session,
          token: response.data.token,
        });
      }

      const match = orgOptions.value.find(
        (org) => org.id === currentOrgId.value,
      );
      if (match) {
        currentOrgName.value = match.orgName;
      }
    } finally {
      loading.value = false;
    }
  }

  function resetOrganizationSession(): void {
    orgEnabled.value = false;
    multiOrgEnabled.value = false;
    orgOptions.value = [];
    currentOrgId.value = '';
    currentOrgName.value = '';
  }

  return {
    orgEnabled,
    multiOrgEnabled,
    orgOptions,
    currentOrgId,
    currentOrgName,
    orgLoading: loading,
    canSwitchOrg,
    loadOrganizationContext,
    switchOrganization,
    resetOrganizationSession,
  };
}
