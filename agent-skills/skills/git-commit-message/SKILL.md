---
name: git-commit-message
description: >-
  Git commit message specification for the Nebula project. All commit messages must be in Chinese, following the <type>(<scope>): <description> format.
---

# Git 提交信息规范

## 语言要求

**所有提交信息必须使用中文**，包括标题和正文。

## 格式规范

提交信息分为两部分：标题（首行）和正文（可选），用空行分隔。

### 标题格式

```
<类型>(<范围>): <描述>
```

- **类型**：必填，小写字母，标识提交的性质
- **范围**：可选，标识影响的模块或文件
- **描述**：必填，简洁说明改动内容，以动词开头

### 类型说明

| 类型 | 说明 | 示例 |
| --- | --- | --- |
| `feat` | 新增功能 | `feat(user): 添加用户注册接口` |
| `fix` | 修复 Bug | `fix(order): 修复订单状态更新失败问题` |
| `docs` | 文档变更 | `docs(api): 更新接口文档` |
| `style` | 代码格式调整（不影响逻辑） | `style(controller): 格式化代码缩进` |
| `refactor` | 代码重构 | `refactor(service): 重构用户服务逻辑` |
| `test` | 测试代码变更 | `test(auth): 添加认证单元测试` |
| `chore` | 构建/工具配置变更 | `chore(deps): 更新依赖版本` |
| `perf` | 性能优化 | `perf(query): 优化数据库查询性能` |
| `revert` | 回滚提交 | `revert: 撤销 feat(user): 添加用户注册接口` |

### 正文格式（可选）

标题下方空一行后，可添加详细描述：

- 说明改动的原因和背景
- 列出主要变更点
- 说明影响范围

## 示例

```
feat(connector): 添加 MySQL 连接器插件

- 实现 MySQL 数据库连接器
- 支持库表订阅功能
- 添加连接池配置
- 完善错误处理机制
```

```
fix(api): 修复认证接口空指针异常

问题：当请求体为空时，认证接口抛出 NullPointerException
原因：未对请求参数进行空值校验
修复：添加参数校验逻辑
```

```
docs(readme): 更新项目说明文档

- 添加快速开始指南
- 更新架构图
- 补充配置说明
```

## 注意事项

1. 标题长度控制在 50 字符以内
2. 标题使用中文，结尾不加句号
3. 类型和范围使用英文小写
4. 正文每行不超过 72 字符
5. 避免使用模糊描述，如"修复问题"、"优化代码"
