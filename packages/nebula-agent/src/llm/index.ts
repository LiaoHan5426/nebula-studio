import type { AgentConfig } from '../config';

export type LLMResponse = {
  content: string;
  finishReason: string;
};

export class LLMClient {
  private config: AgentConfig;

  constructor(config: AgentConfig) {
    this.config = config;
  }

  async generate(prompt: string, systemPrompt?: string): Promise<LLMResponse> {
    const body = {
      model: this.config.model,
      messages: [
        {
          role: 'system',
          content: systemPrompt || this.config.systemPrompt,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: this.config.temperature || 0.2,
      max_tokens: this.config.maxTokens || 2048,
    };

    const response = await fetch(`${this.config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && {
          Authorization: `Bearer ${this.config.apiKey}`,
        }),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `LLM API error: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    return {
      content: data.choices[0]?.message?.content || '',
      finishReason: data.choices[0]?.finish_reason || 'unknown',
    };
  }

  async generateSQL(userQuery: string, systemPrompt: string): Promise<string> {
    const response = await this.generate(userQuery, systemPrompt);

    try {
      const parsed = JSON.parse(response.content);
      return parsed.sql || parsed.query || response.content;
    } catch {
      const content = response.content;
      const sqlMatch = content.match(/```sql\s*([\s\S]*?)```/);
      if (sqlMatch && sqlMatch[1]) {
        return sqlMatch[1].trim();
      }

      const codeMatch = content.match(/```\s*([\s\S]*?)```/);
      if (codeMatch && codeMatch[1]) {
        return codeMatch[1].trim();
      }

      return content.trim();
    }
  }
}
