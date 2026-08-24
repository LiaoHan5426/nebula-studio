---
name: git-commit-message
description: >-
  Git commit message specification for the Nebula project. All commit messages must be in Chinese, following the <type>(<scope>): <description> format.
---

# Git 提交信息规范

机器校验以仓库根目录 `commitlint.config.mjs`（`@nebula-studio-internal/commitlint`）为准。本 skill 必须写出能通过 commitlint 的信息；中文是团队约定，commitlint 不检查语言。

本地 `commit-msg` hook 与 CI 都会跑 commitlint。Cursor 源代码管理里的「生成提交信息」按钮**不会**读该配置，不要依赖它；需要合规文案时由 Agent 按本 skill 撰写，或提交前改到过 lint。

## 语言要求

**所有提交信息必须使用中文**，包括标题和正文。

## 格式规范

提交信息分为两部分：标题（首行）和正文（可选），用空行分隔。

### 标题格式

```
<类型>(<范围>): <描述>
```

- **类型**：必填，小写，必须是 commitlint `type-enum` 之一
- **范围**：可选，英文小写（`scope-case` 为 warning）
- **描述**：必填，简洁说明改动内容，以动词开头；结尾不加句号（`.`）

### 类型说明

与 `tools/lint/commitlint/commitlint.config.mjs` 的 `type-enum` 一致：

| 类型 | 说明 | 示例 |
| --- | --- | --- |
| `feat` | 新增功能 | `feat(user): 添加用户注册接口` |
| `fix` | 修复 Bug | `fix(order): 修复订单状态更新失败问题` |
| `docs` | 文档变更 | `docs(api): 更新接口文档` |
| `style` | 代码格式调整（不影响逻辑） | `style(controller): 格式化代码缩进` |
| `refactor` | 代码重构 | `refactor(service): 重构用户服务逻辑` |
| `perf` | 性能优化 | `perf(query): 优化数据库查询性能` |
| `test` | 测试代码变更 | `test(auth): 添加认证单元测试` |
| `build` | 构建系统或外部依赖 | `build(vite): 调整生产打包配置` |
| `ci` | CI 配置或脚本 | `ci: 在质量任务中校验提交信息` |
| `chore` | 杂项工具/配置（非 build/ci） | `chore(deps): 更新依赖版本` |
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

1. 标题（header）不超过 **100** 字符（commitlint `header-max-length`）
2. 标题使用中文，结尾不加句号
3. 类型和范围使用英文小写
4. 正文每行不超过 **100** 字符（conventional `body-max-line-length`）
5. 避免使用模糊描述，如"修复问题"、"优化代码"
6. 本地检查当前提交：`vp run lint:commits`；hook 失败可用 `VITE_GIT_HOOKS=0` 跳过（仅应急，CI 仍会拦）
