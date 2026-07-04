import { computed, ref } from 'vue';

import { resourceApi } from '@/shared/api/integration';
import type {
  ResourceCreateRequest,
  ResourceQueryParams,
  ResourceRecord,
  ResourceUpdateRequest,
} from '@/shared/types';
import { isApiSuccess } from '@/shared/types';

export function useResources() {
  const resources = ref<ResourceRecord[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const total = ref(0);
  const currentPage = ref(1);
  const pageSize = ref(20);

  const hasResources = computed(() => resources.value.length > 0);

  async function loadResources(params: ResourceQueryParams) {
    loading.value = true;
    error.value = null;
    try {
      const response = await resourceApi.list({
        ...params,
        page: currentPage.value,
        size: pageSize.value,
      });
      if (isApiSuccess(response)) {
        resources.value = response.data.records ?? [];
        total.value = response.data.total ?? 0;
      } else {
        error.value = response.message ?? '加载资源列表失败';
        resources.value = [];
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载资源列表失败';
      resources.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function loadResource(
    resourceId: string,
  ): Promise<ResourceRecord | null> {
    loading.value = true;
    error.value = null;
    try {
      const response = await resourceApi.get(resourceId);
      if (isApiSuccess(response)) {
        return response.data;
      }
      error.value = response.message ?? '加载资源详情失败';
      return null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载资源详情失败';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function createResource(
    data: ResourceCreateRequest,
  ): Promise<ResourceRecord | null> {
    loading.value = true;
    error.value = null;
    try {
      const response = await resourceApi.create(data);
      if (isApiSuccess(response)) {
        resources.value.unshift(response.data);
        total.value += 1;
        return response.data;
      }
      error.value = response.message ?? '创建资源失败';
      return null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : '创建资源失败';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function updateResource(
    resourceId: string,
    data: ResourceUpdateRequest,
  ): Promise<ResourceRecord | null> {
    loading.value = true;
    error.value = null;
    try {
      const response = await resourceApi.update(resourceId, data);
      if (isApiSuccess(response)) {
        const idx = resources.value.findIndex((r) => r.id === resourceId);
        if (idx >= 0) {
          resources.value[idx] = response.data;
        }
        return response.data;
      }
      error.value = response.message ?? '更新资源失败';
      return null;
    } catch (e) {
      error.value = e instanceof Error ? e.message : '更新资源失败';
      return null;
    } finally {
      loading.value = false;
    }
  }

  async function deleteResource(resourceId: string): Promise<boolean> {
    loading.value = true;
    error.value = null;
    try {
      const response = await resourceApi.delete(resourceId);
      if (isApiSuccess(response)) {
        resources.value = resources.value.filter((r) => r.id !== resourceId);
        total.value = Math.max(0, total.value - 1);
        return true;
      }
      error.value = response.message ?? '删除资源失败';
      return false;
    } catch (e) {
      error.value = e instanceof Error ? e.message : '删除资源失败';
      return false;
    } finally {
      loading.value = false;
    }
  }

  function setPage(page: number) {
    currentPage.value = Math.max(1, page);
  }

  function setPageSize(size: number) {
    pageSize.value = Math.max(1, Math.min(100, size));
  }

  function clearError() {
    error.value = null;
  }

  return {
    resources,
    loading,
    error,
    total,
    currentPage,
    pageSize,
    hasResources,
    loadResources,
    loadResource,
    createResource,
    updateResource,
    deleteResource,
    setPage,
    setPageSize,
    clearError,
  };
}
