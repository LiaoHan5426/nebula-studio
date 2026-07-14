<script setup lang="ts">
import { ref } from 'vue';
import { gatewayRequest } from '@/shared/api/executorApi';
import { NebulaButton, NebulaPane } from '@nebula-studio/nebula-ui';

import { useAuth } from '@/shared/composables/useAuth';

const { token } = useAuth();

const tenantId = ref('1_a');

const path = ref('/orders/query');
const method = ref('GET');
const apiKey = ref('demo-api-key-tenant-a');
const body = ref('{}');
const responseText = ref('');
const loading = ref(false);

async function sendRequest() {
  loading.value = true;
  responseText.value = '';
  try {
    const subPath = path.value.startsWith('/') ? path.value : `/${path.value}`;
    const parsedBody = ['POST', 'PUT', 'PATCH'].includes(method.value)
      ? JSON.parse(body.value)
      : undefined;

    const result = await gatewayRequest(tenantId.value, subPath, {
      method: method.value,
      apiKey: apiKey.value,
      token: token.value,
      body: parsedBody,
    });

    let formatted = result.body;
    try {
      formatted = JSON.stringify(JSON.parse(result.body), null, 2);
    } catch {
      /* keep raw */
    }
    responseText.value = `HTTP ${result.status}\n\n${formatted}`;
  } catch (e) {
    responseText.value = e instanceof Error ? e.message : 'Request failed';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page">
    <NebulaPane
      title="服务测试"
      description="模拟外部租户经网关调用已发布服务，请求转发至 demo-camel-executor :8081"
    >
      <div class="page__form">
        <label class="field">
          <span>对接租户 ID</span>
          <input v-model="tenantId" placeholder="例如 1_a" />
        </label>
        <label class="field">
          <span>路径</span>
          <input v-model="path" placeholder="/orders/query" />
        </label>
        <label class="field">
          <span>方法</span>
          <select v-model="method" class="field__select">
            <option>GET</option>
            <option>POST</option>
            <option>PUT</option>
            <option>DELETE</option>
          </select>
        </label>
        <label class="field">
          <span>X-API-Key</span>
          <input v-model="apiKey" />
        </label>
        <label class="field">
          <span>Authorization（JWT，登录后自动注入）</span>
          <input
            :value="token ? `Bearer ${token.slice(0, 24)}…` : '使用 Shell 会话'"
            readonly
            class="field__readonly"
          />
        </label>
        <label v-if="['POST', 'PUT', 'PATCH'].includes(method)" class="field">
          <span>请求体 JSON</span>
          <textarea v-model="body" rows="4" />
        </label>
        <NebulaButton
          variant="primary"
          :disabled="loading"
          @click="sendRequest"
        >
          {{ loading ? '请求中…' : '发送请求' }}
        </NebulaButton>
      </div>
    </NebulaPane>

    <NebulaPane v-if="responseText" title="响应">
      <pre class="page__response-body">{{ responseText }}</pre>
    </NebulaPane>
  </div>
</template>
