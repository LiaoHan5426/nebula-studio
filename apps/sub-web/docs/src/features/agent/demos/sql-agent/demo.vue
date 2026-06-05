<script setup lang="ts">
import { ref, computed } from 'vue';
import { NebulaButton, NebulaSelect } from '@nebula-studio/nebula-ui';
import DocsDemoSection from '../../../../components/DocsDemoSection.vue';
import { SQLAgent, SQLCrypto, updateConfig } from '@nebula-studio/nebula-agent';

const activeSection = ref<'query' | 'encrypt'>('query');

const userQuery = ref('');
const basicResult = ref<{
  sql: string;
  chartType: string;
  reason: string;
} | null>(null);
const isLoading = ref(false);
const error = ref('');

const config = ref({
  model: 'qwen2.5-coder-7b',
  baseURL: 'http://127.0.0.1:1234/v1',
  temperature: 0.2,
  maxTokens: 2048,
  encryptSQL: true,
  apiBaseURL: '/api',
  database: 'mysql',
});

const databases = [
  { value: 'mysql', label: 'MySQL' },
  { value: 'postgres', label: 'PostgreSQL' },
  { value: 'nebula', label: 'Nebula Graph' },
  { value: 'sqlite', label: 'SQLite' },
];

const configJson = computed(() => JSON.stringify(config.value, null, 2));
const showConfig = ref(false);

async function handleExecute() {
  if (!userQuery.value.trim()) return;

  isLoading.value = true;
  error.value = '';
  basicResult.value = null;

  try {
    updateConfig({
      'sql-agent': {
        model: config.value.model,
        baseURL: config.value.baseURL,
        temperature: config.value.temperature,
        maxTokens: config.value.maxTokens,
        systemPrompt: 'sql-system',
      },
    });

    const agent = new SQLAgent({
      apiConfig: {
        baseURL: config.value.apiBaseURL,
      },
      encryptSQL: config.value.encryptSQL,
    });

    const agentResult = await agent.execute(userQuery.value);
    basicResult.value = {
      sql: agentResult.generatedSQL,
      chartType: agentResult.chartRecommendation.chartType,
      reason: agentResult.chartRecommendation.reason,
    };
  } catch (e) {
    error.value = e instanceof Error ? e.message : '执行失败';
  } finally {
    isLoading.value = false;
  }
}

const sqlInput = ref('SELECT * FROM users WHERE id = 1');
const encrypted = ref('');
const decrypted = ref('');
const cryptoKey = ref('');
const isEncrypting = ref(false);
const isDecrypting = ref(false);

async function handleEncrypt() {
  if (!sqlInput.value.trim()) return;

  isEncrypting.value = true;
  try {
    const crypto = new SQLCrypto(
      cryptoKey.value ? { key: cryptoKey.value } : {},
    );
    encrypted.value = await crypto.encrypt(sqlInput.value);
    if (!cryptoKey.value) {
      cryptoKey.value = crypto.getKeyHex();
    }
  } catch (e) {
    encrypted.value = e instanceof Error ? e.message : '加密失败';
  } finally {
    isEncrypting.value = false;
  }
}

async function handleDecrypt() {
  if (!encrypted.value.trim()) return;

  isDecrypting.value = true;
  try {
    const crypto = new SQLCrypto({ key: cryptoKey.value });
    decrypted.value = await crypto.decrypt(encrypted.value);
  } catch (e) {
    decrypted.value = e instanceof Error ? e.message : '解密失败';
  } finally {
    isDecrypting.value = false;
  }
}
</script>

<template>
  <section id="sql-agent-demo">
    <DocsDemoSection
      title="SQL Agent 演示"
      description="体验自然语言转 SQL 的强大功能"
    >
      <div class="sql-agent-demo">
        <div class="demo-card">
          <div class="section-tabs">
            <button
              :class="['tab-btn', { active: activeSection === 'query' }]"
              @click="activeSection = 'query'"
            >
              SQL 查询
            </button>
            <button
              :class="['tab-btn', { active: activeSection === 'encrypt' }]"
              @click="activeSection = 'encrypt'"
            >
              SQL 加密
            </button>
          </div>

          <div v-if="activeSection === 'query'" class="section-content">
            <div class="config-section">
              <div class="config-header" @click="showConfig = !showConfig">
                <span class="config-title">配置选项</span>
                <span class="config-toggle">{{
                  showConfig ? '收起' : '展开'
                }}</span>
              </div>
              <div v-show="showConfig" class="config-content">
                <div class="config-grid">
                  <div class="config-item">
                    <label>模型名称</label>
                    <input
                      v-model="config.model"
                      type="text"
                      class="config-input"
                    />
                  </div>
                  <div class="config-item">
                    <label>API 地址</label>
                    <input
                      v-model="config.baseURL"
                      type="text"
                      class="config-input"
                    />
                  </div>
                  <div class="config-item">
                    <label>温度参数</label>
                    <input
                      v-model.number="config.temperature"
                      type="number"
                      step="0.1"
                      class="config-input"
                    />
                  </div>
                  <div class="config-item">
                    <label>最大 Token</label>
                    <input
                      v-model.number="config.maxTokens"
                      type="number"
                      class="config-input"
                    />
                  </div>
                  <div class="config-item">
                    <label>数据库类型</label>
                    <NebulaSelect
                      v-model="config.database"
                      :options="databases"
                    />
                  </div>
                  <div class="config-item">
                    <label>后端 API 地址</label>
                    <input
                      v-model="config.apiBaseURL"
                      type="text"
                      class="config-input"
                    />
                  </div>
                </div>
                <div class="config-summary">
                  <h4>当前配置</h4>
                  <pre>{{ configJson }}</pre>
                </div>
              </div>
            </div>

            <div class="input-section">
              <input
                v-model="userQuery"
                type="text"
                placeholder="请输入查询语句，如：显示各部门的销售额"
                class="query-input"
                @keyup.enter="handleExecute"
              />
              <NebulaButton
                type="primary"
                @click="handleExecute"
                :loading="isLoading"
                class="execute-btn"
              >
                执行查询
              </NebulaButton>
            </div>

            <div v-if="error" class="error-message">
              {{ error }}
            </div>

            <div v-if="basicResult" class="result-section">
              <div class="result-card">
                <h4>生成的 SQL</h4>
                <pre class="sql-code">{{ basicResult.sql }}</pre>
              </div>
              <div class="result-card">
                <h4>推荐图表类型</h4>
                <span class="chart-type">{{ basicResult.chartType }}</span>
                <p class="chart-reason">{{ basicResult.reason }}</p>
              </div>
            </div>
          </div>

          <div v-if="activeSection === 'encrypt'" class="section-content">
            <div class="encrypt-grid">
              <div class="encrypt-item">
                <label>原始 SQL</label>
                <input
                  v-model="sqlInput"
                  type="text"
                  placeholder="输入要加密的 SQL"
                  class="sql-input"
                />
                <NebulaButton
                  type="primary"
                  @click="handleEncrypt"
                  :loading="isEncrypting"
                  class="action-btn"
                >
                  加密
                </NebulaButton>
              </div>

              <div class="encrypt-item">
                <label>加密密钥 (自动生成)</label>
                <input
                  v-model="cryptoKey"
                  type="text"
                  placeholder="32字节十六进制密钥"
                  class="key-input"
                />
              </div>

              <div class="encrypt-item">
                <label>加密结果</label>
                <textarea
                  v-model="encrypted"
                  readonly
                  class="result-textarea"
                  placeholder="加密后的内容"
                ></textarea>
              </div>

              <div class="encrypt-item">
                <label>解密结果</label>
                <textarea
                  v-model="decrypted"
                  readonly
                  class="result-textarea"
                  placeholder="解密后的内容"
                ></textarea>
                <NebulaButton
                  type="default"
                  @click="handleDecrypt"
                  :loading="isDecrypting"
                  :disabled="!encrypted"
                  class="action-btn"
                >
                  解密
                </NebulaButton>
              </div>
            </div>

            <div class="encrypt-tips">
              <h4>安全提示</h4>
              <ul>
                <li>使用 AES-GCM 算法进行加密，提供认证加密</li>
                <li>每次加密使用随机初始化向量 (IV)</li>
                <li>密钥长度为 256 位 (32 字节)</li>
                <li>前端加密后，后端需要使用相同密钥解密</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DocsDemoSection>
  </section>
</template>

<style lang="scss" scoped>
.sql-agent-demo {
  width: 100%;
}

.demo-card {
  overflow: hidden;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.section-tabs {
  display: flex;
  background: hsl(var(--accent) / 24%);
  border-bottom: 1px solid hsl(var(--border));
}

.tab-btn {
  flex: 1;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--muted-foreground));
  cursor: pointer;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  transition: all 0.3s;

  &:hover {
    color: hsl(var(--primary));
    background: hsl(var(--card));
  }

  &.active {
    color: hsl(var(--primary));
    background: hsl(var(--card));
    border-bottom-color: hsl(var(--primary));
  }
}

.section-content {
  padding: 16px;
}

.config-section {
  margin-bottom: 16px;
  overflow: hidden;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.config-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  cursor: pointer;
  background: hsl(var(--background));

  &:hover {
    background: hsl(var(--accent) / 8%);
  }
}

.config-title {
  font-size: 14px;
  font-weight: 500;
  color: hsl(var(--foreground));
}

.config-toggle {
  font-size: 13px;
  color: hsl(var(--primary));
}

.config-content {
  padding: 16px;
  background: hsl(var(--card));
}

.config-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.config-item {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 14px;
    font-weight: 500;
    color: hsl(var(--muted-foreground));
  }

  .config-input {
    box-sizing: border-box;
    padding: 8px 12px;
    font-size: 14px;
    color: hsl(var(--foreground));
    background: hsl(var(--background));
    border: 1px solid hsl(var(--border));
    border-radius: 4px;
  }
}

.config-summary {
  padding: 12px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;

  h4 {
    margin: 0 0 8px;
    font-size: 14px;
    color: hsl(var(--muted-foreground));
  }

  pre {
    padding: 12px;
    margin: 0;
    overflow-x: auto;
    font-family: Monaco, Consolas, monospace;
    font-size: 13px;
    color: hsl(var(--foreground));
    background: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 4px;
  }
}

.input-section {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;

  .query-input {
    box-sizing: border-box;
    flex: 1;
    padding: 8px 12px;
    font-size: 14px;
    color: hsl(var(--foreground));
    background: hsl(var(--background));
    border: 1px solid hsl(var(--border));
    border-radius: 4px;
  }

  .execute-btn {
    white-space: nowrap;
  }
}

.error-message {
  padding: 8px 12px;
  margin-bottom: 16px;
  color: hsl(var(--destructive-foreground));
  background: hsl(var(--destructive) / 12%);
  border: 1px solid hsl(var(--destructive) / 24%);
  border-radius: 4px;
}

.result-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.result-card {
  padding: 12px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;

  h4 {
    margin: 0 0 8px;
    font-size: 14px;
    color: hsl(var(--muted-foreground));
  }
}

.sql-code {
  padding: 12px;
  margin: 0;
  overflow-x: auto;
  font-family: Monaco, Consolas, monospace;
  font-size: 13px;
  color: hsl(var(--foreground));
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
}

.chart-type {
  display: inline-block;
  padding: 4px 12px;
  font-size: 14px;
  color: hsl(var(--primary-foreground));
  background: hsl(var(--primary));
  border-radius: 4px;
}

.chart-reason {
  margin: 8px 0 0;
  font-size: 13px;
  color: hsl(var(--muted-foreground));
}

.encrypt-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.encrypt-item {
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 14px;
    font-weight: 500;
    color: hsl(var(--muted-foreground));
  }

  .sql-input,
  .key-input {
    box-sizing: border-box;
    width: 100%;
    padding: 8px 12px;
    font-size: 14px;
    color: hsl(var(--foreground));
    background: hsl(var(--background));
    border: 1px solid hsl(var(--border));
    border-radius: 4px;
  }

  .result-textarea {
    box-sizing: border-box;
    width: 100%;
    height: 100px;
    padding: 12px;
    font-family: Monaco, Consolas, monospace;
    font-size: 13px;
    color: hsl(var(--foreground));
    resize: vertical;
    background: hsl(var(--background));
    border: 1px solid hsl(var(--border));
    border-radius: 4px;
  }

  .action-btn {
    align-self: flex-start;
  }
}

.encrypt-tips {
  padding: 12px;
  margin-top: 16px;
  background: hsl(var(--accent) / 12%);
  border: 1px solid hsl(var(--accent) / 24%);
  border-radius: 8px;

  h4 {
    margin: 0 0 8px;
    font-size: 14px;
    color: hsl(var(--primary));
  }

  ul {
    padding-left: 20px;
    margin: 0;

    li {
      margin-bottom: 4px;
      font-size: 13px;
      color: hsl(var(--muted-foreground));

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}
</style>
