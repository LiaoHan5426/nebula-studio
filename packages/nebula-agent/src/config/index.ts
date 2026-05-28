export type AgentConfig = {
  model: string;
  baseURL: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt: string;
  apiKey?: string;
};

export type AgentsConfig = {
  [agentName: string]: AgentConfig;
};

const defaultConfig: AgentsConfig = {
  'sql-agent': {
    model: 'qwen2.5-coder-7b',
    baseURL: 'http://127.0.0.1:1234/v1',
    temperature: 0.2,
    maxTokens: 2048,
    systemPrompt: 'sql-system',
  },
  'chart-agent': {
    model: 'qwen2.5-7b',
    baseURL: 'http://127.0.0.1:1234/v1',
    temperature: 0.1,
    systemPrompt: 'chart-system',
  },
};

let currentConfig: AgentsConfig = { ...defaultConfig };

export function updateConfig(config: Record<string, AgentConfig | undefined>): void {
  Object.entries(config).forEach(([key, value]) => {
    if (value !== undefined) {
      currentConfig[key] = value;
    }
  });
}

export function getAgentConfig(agentName: string): AgentConfig | undefined {
  return currentConfig[agentName];
}

export function getCurrentConfig(): AgentsConfig {
  return { ...currentConfig };
}

export function resetConfig(): void {
  currentConfig = { ...defaultConfig };
}