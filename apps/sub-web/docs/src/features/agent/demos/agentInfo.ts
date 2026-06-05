export interface AgentInfo {
  title: string;
  description: string;
  features?: string[];
}

export const sqlAgentInfo: AgentInfo = {
  title: 'SQL Agent',
  description:
    'AI 驱动的 SQL 查询代理，支持自然语言转 SQL、自动图表生成和 SQL 加密传输。通过自然语言描述，自动生成符合语法规范的 SQL 查询语句，并推荐合适的图表类型进行数据可视化。',
  features: [
    '自然语言转 SQL：支持中文和英文查询',
    '多数据库支持：MySQL、PostgreSQL、Nebula Graph、SQLite',
    '自动图表推荐：根据查询结果智能推荐图表类型',
    'SQL 加密传输：支持 AES-GCM 加密算法，保障数据安全',
    'SQL 验证：语法检查和权限控制',
  ],
};
