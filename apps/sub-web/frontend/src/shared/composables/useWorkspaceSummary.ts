import { onMounted, ref } from 'vue';

import { globalAuthProvider } from '@nebula-studio/auth-provider';

import { fetchWorkspaceSummary } from '@/shared/api/workspaceSummary';

export function useWorkspaceSummary() {
  const loading = ref(true);
  const partial = ref(false);
  const pendingRequestCount = ref(0);
  const taskCount = ref(0);
  const incidentCount = ref(0);
  const resourceCount = ref(0);

  async function refresh(): Promise<void> {
    loading.value = true;
    partial.value = false;
    try {
      const session = globalAuthProvider.getSession();
      const summary = await fetchWorkspaceSummary(session?.userId);
      pendingRequestCount.value = summary.pendingRequestCount;
      taskCount.value = summary.taskCount;
      incidentCount.value = summary.incidentCount;
      resourceCount.value = summary.resourceCount;
    } catch {
      partial.value = true;
    } finally {
      loading.value = false;
    }
  }

  onMounted(() => {
    void refresh();
  });

  return {
    incidentCount,
    pendingRequestCount,
    refreshWorkspaceSummary: refresh,
    resourceCount,
    taskCount,
    workspaceSummaryLoading: loading,
    workspaceSummaryPartial: partial,
  };
}
