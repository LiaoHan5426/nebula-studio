<script setup lang="ts">
import { ref } from 'vue';
import { NebulaButton, NebulaPane } from '@nebula-studio/nebula-ui';

import { useAuth } from '@/shared/composables/useAuth';
import { useTenant } from '@/shared/composables/useTenant';

const { token } = useAuth();
const { currentTenantId } = useTenant();

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
    const url = `/api/integration/gateway/${currentTenantId.value}${path.value.startsWith('/') ? path.value : `/${path.value}`}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`;
    }
    if (apiKey.value) {
      headers['X-API-Key'] = apiKey.value;
    }
    headers['X-Tenant-Id'] = currentTenantId.value;

    const res = await fetch(url, {
      method: method.value,
      headers,
      body: ['POST', 'PUT', 'PATCH'].includes(method.value)
        ? body.value
        : undefined,
    });
    const text = await res.text();
    let formatted = text;
    try {
      formatted = JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      /* keep raw text */
    }
    responseText.value = `HTTP ${res.status}\n\n${formatted}`;
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
      title="接口网关"
      description="通过集成网关路由测试已发布接口，支持 JWT、API Key 与租户头"
    >
      <div class="page__form">
        <label class="field">
          <span>租户（来自 Header 选择器）</span>
          <input :value="currentTenantId" readonly class="field__readonly" />
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
        <NebulaButton :disabled="loading" @click="sendRequest">
          {{ loading ? '请求中…' : '发送请求' }}
        </NebulaButton>
      </div>
    </NebulaPane>

    <NebulaPane v-if="responseText" title="响应" class="page__response">
      <pre class="page__response-body">{{ responseText }}</pre>
    </NebulaPane>
  </div>
</template>

<style scoped>
.page {
  padding: 24px;
  max-width: 900px;
  margin: 0 auto;
}

.page__form {
  display: grid;
  gap: 12px;
}

.field {
  display: grid;
  gap: 6px;
  font-size: 13px;
}

.field input,
.field textarea,
.field__select {
  padding: 8px 10px;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
  background: hsl(var(--background));
  color: hsl(var(--foreground));
  font-family: inherit;
}

.field__readonly {
  color: hsl(var(--muted-foreground));
  background: hsl(var(--muted) / 30%);
}

.page__response {
  margin-top: 20px;
}

.page__response-body {
  padding: 12px;
  font-size: 12px;
  overflow: auto;
  border-radius: 6px;
  background: hsl(var(--muted) / 40%);
}
</style>
