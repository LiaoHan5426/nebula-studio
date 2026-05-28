export const sqlAgentApiRows = [
  {
    name: 'SQLAgent',
    type: 'Class',
    description: 'SQL 代理类，提供自然语言转 SQL、执行查询、图表生成等功能',
  },
  {
    name: 'SQLAgent.execute(userQuery)',
    type: 'Promise<SQLAgentResult>',
    description: '执行完整的查询流程：理解意图 → 生成 SQL → 验证 → 执行 → 推荐图表',
  },
  {
    name: 'SQLAgent.generateSQL(userQuery)',
    type: 'Promise<string>',
    description: '仅生成 SQL，不执行查询',
  },
  {
    name: 'SQLAgent.executeSQL(sql)',
    type: 'Promise<QueryResult>',
    description: '执行 SQL 语句',
  },
  {
    name: 'SQLAgent.validateSQL(sql)',
    type: 'ValidationResult',
    description: '验证 SQL 语句的合法性',
  },
  {
    name: 'SQLAgent.registerParserExtension(extension)',
    type: 'void',
    description: '注册自定义解析器扩展，用于支持未支持的数据库语法',
  },
  {
    name: 'SQLCrypto',
    type: 'Class',
    description: 'SQL 加密工具类，使用 AES-GCM 算法',
  },
  {
    name: 'SQLCrypto.encrypt(sql)',
    type: 'Promise<string>',
    description: '加密 SQL 语句',
  },
  {
    name: 'SQLCrypto.decrypt(encrypted)',
    type: 'Promise<string>',
    description: '解密 SQL 语句',
  },
  {
    name: 'SQLCrypto.getKeyHex()',
    type: 'string',
    description: '获取当前密钥（十六进制）',
  },
  {
    name: 'SQLCrypto.setKeyHex(key)',
    type: 'void',
    description: '设置加密密钥（32字节十六进制）',
  },
  {
    name: 'SQLValidator',
    type: 'Class',
    description: 'SQL 验证器，用于 SQL 语法检查和权限控制',
  },
  {
    name: 'SQLValidator.validate(sql)',
    type: 'ValidationResult',
    description: '验证 SQL 语句',
  },
  {
    name: 'SQLValidator.registerExtension(extension)',
    type: 'void',
    description: '注册数据库扩展',
  },
  {
    name: 'SQLValidator.getTableList(sql)',
    type: 'string[]',
    description: '提取 SQL 中的表名',
  },
  {
    name: 'updateConfig(config)',
    type: 'void',
    description: '更新全局配置',
  },
  {
    name: 'getAgentConfig(agentName)',
    type: 'AgentConfig | undefined',
    description: '获取指定 agent 的配置',
  },
];

export const sqlAgentTypeRows = [
  {
    name: 'AgentConfig',
    type: 'interface',
    description: 'AI Agent 配置',
  },
  {
    name: 'SQLAgentOptions',
    type: 'interface',
    description: 'SQL Agent 选项配置',
  },
  {
    name: 'SQLAgentResult',
    type: 'interface',
    description: 'SQL Agent 执行结果',
  },
  {
    name: 'QueryResult',
    type: 'interface',
    description: '查询结果数据结构',
  },
  {
    name: 'ValidationResult',
    type: 'interface',
    description: 'SQL 验证结果',
  },
  {
    name: 'ChartRecommendation',
    type: 'interface',
    description: '图表推荐结果',
  },
];
