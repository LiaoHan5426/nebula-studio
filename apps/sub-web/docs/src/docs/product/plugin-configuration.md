# 插件安装与配置

## 识别插件

平台 descriptor 提供插件身份；Camel descriptor 只补充 Connector、配置 Schema 和 DAG 节点能力，不能覆盖平台身份。

## 配置

表单由 `configSchema` 生成。检查必填项、默认值和敏感字段；DAG 节点由 `nodeSchema` 生成，不维护第二份静态字段表。

## 安装与治理

先安装测试，再提交启用。测试失败、运行异常或版本不兼容时停止启用并保留诊断信息。
