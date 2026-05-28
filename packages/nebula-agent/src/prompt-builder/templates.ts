export type TemplateConfig = {
  name: string;
  content: string;
  description?: string;
};

export type TemplateRegistry = {
  [key: string]: TemplateConfig;
};

const templates: TemplateRegistry = {
  'sql-system': {
    name: 'SQL System Prompt',
    description: '用于指导LLM生成SQL查询语句的系统提示词',
    content: `你是数据库分析专家。

要求：

1. 只能生成 SELECT SQL
2. 禁止 DELETE UPDATE INSERT DROP
3. 返回 JSON
4. 不要解释
5. SQL 必须兼容 {{dbType}}

数据库结构：

{{schema}}`
  },
  'sql-chart': {
    name: 'SQL Chart Prompt',
    description: '用于指导LLM分析数据并推荐图表类型',
    content: `你是数据可视化专家。

请分析以下查询结果并推荐合适的图表类型：

数据：
{{data}}

要求：
1. 分析数据特征（维度、指标、数据分布等）
2. 推荐最合适的图表类型（bar/line/pie/scatter/table/area）
3. 返回 JSON 格式

返回格式：
{
  "chartType": "bar",
  "reason": "推荐理由",
  "xAxis": "维度字段名",
  "yAxis": ["指标字段名"]
}`
  }
};

export function getTemplate(name: string): TemplateConfig | undefined {
  return templates[name];
}

export function getTemplateContent(name: string): string | undefined {
  return templates[name]?.content;
}

export function registerTemplate(config: TemplateConfig): void {
  templates[config.name] = config;
}

export function getAllTemplates(): TemplateRegistry {
  return { ...templates };
}

export function hasTemplate(name: string): boolean {
  return name in templates;
}