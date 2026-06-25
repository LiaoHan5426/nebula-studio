import type { SQLPromptParams } from './sql/builder';

export type AgentType = 'sql' | 'chart' | 'code';

export type PromptParams = {
  sql?: SQLPromptParams;
  [key: string]: unknown;
};

export async function buildPrompt(
  agent: AgentType,
  params: PromptParams,
): Promise<string> {
  switch (agent) {
    case 'sql': {
      const { buildSQLPrompt } = await import('./sql/builder');
      const sqlParams = params.sql;
      if (!sqlParams) {
        throw new Error('SQL prompt params are required');
      }
      return buildSQLPrompt('', sqlParams);
    }
    case 'chart': {
      const template = await import('./templates');
      const chartTemplate = template.getTemplateContent('sql-chart');
      if (!chartTemplate) {
        throw new Error('Chart prompt template not found');
      }
      return chartTemplate;
    }
    case 'code':
      throw new Error('Code agent prompt not implemented');
    default:
      throw new Error(`Unsupported agent type: ${agent}`);
  }
}

export * from './templates';
