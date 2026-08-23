import type {
  ApiInterface,
  CompositeInterface,
  DagDefinitionRecord,
} from '@/shared/types';

import type { DagDefinition } from '@nebula-studio/nebula-dag-editor';
import type { PluginNodeSchema } from '@nebula-studio/nebula-low-render';

import type { PublishForm, ServiceTab } from '../publish/types';

import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useNebulaAssembly } from '@nebula-studio/nebula-assembly';

import { approvalApi } from '@/features/approval/api';
import { loadDagNodeSchemas } from '@/features/flows/loadDagNodeSchemas';
import { dagsQueryOptions } from '@/features/flows/queryOptions';
import { interfacesQueryOptions } from '@/features/interfaces/queryOptions';
import { dagApi } from '@/features/monitor/api';
import { interfaceApi } from '@/shared/api/integration';
import { getAuthUserId } from '@/shared/auth/session';
import { useAuth } from '@/shared/composables/useAuth';
import {
  InterfaceStatus,
  InterfaceType,
  isApiSuccess,
  RequestKind,
} from '@/shared/types';
import { useQuery } from '@tanstack/vue-query';

import {
  buildPublishFormFromItem,
  buildPublishSnapshotJson,
  createDefaultCompositeForm,
  isDagComposite,
} from '../publish/mappers';

export function useServicePublish() {
  const { isPlatformAdmin } = useAuth();
  const router = useRouter();
  const { editor: editorHost } = useNebulaAssembly();
  const activeTab = ref<ServiceTab>('all');
  const servicesQuery = useQuery(() =>
    interfacesQueryOptions('publish', { pageSize: 100 }),
  );
  const services = computed(() => servicesQuery.data.value?.items ?? []);
  const loading = computed(() => servicesQuery.isPending.value);

  const showCompositeDialog = ref(false);
  const showFlowEditor = ref(false);
  const showDagEditor = ref(false);
  const showPublishDialog = ref(false);
  const bpmnXml = ref('');
  const editingCompositeId = ref('');
  const editingDagId = ref('');
  const dagDefinition = ref<DagDefinition | string>({ nodes: {} });
  const nodeSchemas = ref<Record<string, PluginNodeSchema>>({});
  const publishTarget = ref<ApiInterface | null>(null);
  const dagsQuery = useQuery(() =>
    dagsQueryOptions(publishTarget.value?.tenantId),
  );
  const dagOptions = computed(() => dagsQuery.data.value ?? []);

  const publishForm = ref<PublishForm>({
    subscriptionMode: 'OPEN',
    orchestrationType: 'ATOMIC',
    flowDefinitionId: '',
    dagDefinitionId: '',
  });

  const compositeForm = ref<Partial<CompositeInterface>>(
    createDefaultCompositeForm(),
  );

  const atomicOptions = computed(() =>
    services.value.filter(
      (item) => item.interfaceType === InterfaceType.ATOMIC,
    ),
  );

  const compositeServices = computed(() =>
    services.value.filter(
      (item) => item.interfaceType === InterfaceType.COMPOSITE,
    ),
  );

  const visibleServices = computed(() => {
    if (activeTab.value === 'atomic') {
      return services.value.filter(
        (item) => item.interfaceType === InterfaceType.ATOMIC,
      );
    }
    if (activeTab.value === 'composite') {
      return services.value.filter(
        (item) => item.interfaceType === InterfaceType.COMPOSITE,
      );
    }
    return services.value;
  });

  async function loadServices() {
    await servicesQuery.refetch();
  }

  async function handlePublish(item: ApiInterface) {
    publishTarget.value = item;
    publishForm.value = buildPublishFormFromItem(item);
    if (publishForm.value.orchestrationType === 'DAG') {
      await dagsQuery.refetch();
    }
    showPublishDialog.value = true;
  }

  async function confirmPublish() {
    const item = publishTarget.value;
    if (!item) return;

    const snapshotJson = buildPublishSnapshotJson(item, publishForm.value);

    if (isPlatformAdmin.value) {
      const payload: Partial<ApiInterface> = {
        status: InterfaceStatus.ACTIVE,
        subscriptionMode: publishForm.value.subscriptionMode,
        orchestrationType: publishForm.value.orchestrationType,
      };
      if (publishForm.value.flowDefinitionId) {
        payload.flowDefinitionId = publishForm.value.flowDefinitionId;
      }
      if (publishForm.value.dagDefinitionId) {
        payload.dagDefinitionId = publishForm.value.dagDefinitionId;
      }
      await interfaceApi.update(item.interfaceId, payload);
    } else {
      await approvalApi.submitRequest({
        resourceId: item.interfaceId,
        resourceType: 'API',
        kind: RequestKind.PUBLISH,
        applicantId: getAuthUserId() || 'current-user',
        reason: `发布服务: ${item.interfaceName}`,
        payload: {
          environment: 'production',
          snapshotJson,
        },
      } as Parameters<typeof approvalApi.submitRequest>[0]);
      router.push('/service/approvals');
    }

    showPublishDialog.value = false;
    publishTarget.value = null;
    await loadServices();
  }

  async function onPublishOrchestrationChange() {
    if (publishForm.value.orchestrationType !== 'DAG' || !publishTarget.value)
      return;
    await dagsQuery.refetch();
  }

  async function handleApprove(item: ApiInterface) {
    await interfaceApi.update(item.interfaceId, {
      status: InterfaceStatus.ACTIVE,
    });
    await loadServices();
  }

  async function handleReject(item: ApiInterface) {
    await interfaceApi.update(item.interfaceId, {
      status: InterfaceStatus.DRAFT,
    });
    await loadServices();
  }

  async function handleOffline(item: ApiInterface) {
    await interfaceApi.update(item.interfaceId, {
      status: InterfaceStatus.INACTIVE,
    });
    await loadServices();
  }

  async function handleDelete(item: ApiInterface) {
    await interfaceApi.delete(item.interfaceId);
    await loadServices();
  }

  function openCreateComposite() {
    compositeForm.value = createDefaultCompositeForm();
    showCompositeDialog.value = true;
  }

  async function ensureDagForComposite(
    item: ApiInterface,
  ): Promise<DagDefinitionRecord> {
    if (item.dagDefinitionId) {
      const existing = await dagApi.get(item.dagDefinitionId);
      if (isApiSuccess(existing)) {
        return existing.data;
      }
    }
    const createRes = await dagApi.create({
      dagName: `${item.interfaceName} DAG`,
      tenantId: item.tenantId,
      dagDefinition: JSON.stringify({ nodes: {} }),
    });
    if (!isApiSuccess(createRes)) {
      throw new Error(createRes.error ?? createRes.message ?? '创建 DAG 失败');
    }
    await interfaceApi.update(item.interfaceId, {
      dagDefinitionId: createRes.data.id,
      orchestrationType: 'DAG',
    });
    return createRes.data;
  }

  async function openDagEditor(item: ApiInterface) {
    editingCompositeId.value = item.interfaceId;
    nodeSchemas.value = await loadDagNodeSchemas(services.value);
    const dag = await ensureDagForComposite(item);
    editingDagId.value = dag.id;
    const detail = await dagApi.get(dag.id);
    if (isApiSuccess(detail) && detail.data?.dagDefinition) {
      dagDefinition.value = detail.data.dagDefinition;
    } else {
      dagDefinition.value = { nodes: {} };
    }
    editorHost.configure({
      size: { height: 'min(72vh, 720px)', width: '100%' },
      readonly: false,
      save: saveDagEditor,
    });
    showDagEditor.value = true;
  }

  async function saveCompositeMeta() {
    const payload = {
      ...compositeForm.value,
      orchestrationType: compositeForm.value.orchestrationType ?? 'BPMN',
      subscriptionMode: compositeForm.value.subscriptionMode ?? 'OPEN',
    };
    const response = payload.interfaceId
      ? await interfaceApi.update(payload.interfaceId, payload)
      : await interfaceApi.create({
          ...payload,
          interfaceType: InterfaceType.COMPOSITE,
        });
    if (isApiSuccess(response)) {
      showCompositeDialog.value = false;
      editingCompositeId.value = response.data.interfaceId;
      if (payload.orchestrationType === 'DAG') {
        await loadServices();
        const saved = services.value.find(
          (item) => item.interfaceId === response.data.interfaceId,
        );
        if (saved) {
          await openDagEditor(saved);
        }
        return;
      }
      const xmlRes = await interfaceApi.getXml(response.data.interfaceId);
      bpmnXml.value = isApiSuccess(xmlRes) ? xmlRes.data : '';
      showFlowEditor.value = true;
      await loadServices();
    }
  }

  async function openCompositeEditor(item: ApiInterface) {
    if (isDagComposite(item)) {
      await openDagEditor(item);
      return;
    }
    editingCompositeId.value = item.interfaceId;
    compositeForm.value = { ...(item as CompositeInterface) };
    const response = await interfaceApi.getXml(item.interfaceId);
    bpmnXml.value = isApiSuccess(response) ? response.data : '';
    showFlowEditor.value = true;
  }

  async function saveDagEditor() {
    if (!editingDagId.value || !editingCompositeId.value) return;
    const definition =
      typeof dagDefinition.value === 'string'
        ? dagDefinition.value
        : JSON.stringify(dagDefinition.value);
    await dagApi.update(editingDagId.value, { dagDefinition: definition });
    await interfaceApi.update(editingCompositeId.value, {
      dagDefinitionId: editingDagId.value,
      orchestrationType: 'DAG',
    });
    showDagEditor.value = false;
    await loadServices();
  }

  async function saveFlowXml() {
    if (!editingCompositeId.value) return;
    await interfaceApi.saveXml(editingCompositeId.value, bpmnXml.value);
    showFlowEditor.value = false;
    await loadServices();
  }

  return {
    services,
    loading,
    activeTab,
    isPlatformAdmin,
    showCompositeDialog,
    showFlowEditor,
    showDagEditor,
    showPublishDialog,
    bpmnXml,
    dagDefinition,
    nodeSchemas,
    publishForm,
    compositeForm,
    dagOptions,
    atomicOptions,
    compositeServices,
    visibleServices,
    loadServices,
    handlePublish,
    confirmPublish,
    onPublishOrchestrationChange,
    handleApprove,
    handleReject,
    handleOffline,
    handleDelete,
    openCreateComposite,
    saveCompositeMeta,
    openCompositeEditor,
    saveDagEditor,
    saveFlowXml,
  };
}
