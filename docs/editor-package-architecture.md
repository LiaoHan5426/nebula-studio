# 编辑器包架构

## 结论

编辑器应作为基础 UI 之上的独立能力层，而不是 `nebula-ui` 的组件类别。

```text
apps / business features
        ↓
provider-neutral editor facade
        ↓
Monaco | future CodeMirror | future rich-text package
        ↓
Vue + third-party editor runtime

editors ─────→ nebula-ui primitives（可选）
nebula-ui ──X→ editors
```

## 包职责

### `@nebula-studio/nebula-ui`

只提供按钮、输入、对话框、表格等基础组件。不得声明或导入 Monaco、CodeMirror、TipTap，也不得依赖任何 `packages/editors` 包。

### `@nebula-studio/nebula-code-editor`

默认入口提供稳定的 `NebulaCodeEditor`、provider-neutral props、事件和错误类型。Monaco 是内部默认 provider，通过异步 chunk 加载。业务代码不接触 Monaco 实例类型；确实需要 provider 能力的诊断工具可显式使用 `./monaco` 次级入口。

未来引入 CodeMirror 时增加并列 provider，不修改业务事件模型。TipTap 的文档模型、命令和扩展体系与代码编辑不同，应进入独立 `rich-text-editor` 包，避免主入口同时加载两类运行时。

## 依赖和升级规则

1. 第三方编辑器版本只声明在对应 editor package。
2. 应用只依赖实际使用的 editor package，不通过 `nebula-ui` 间接获取。
3. 默认入口不得同步导入 provider 运行时。
4. provider 升级必须通过类型检查、单元测试和 Bundle Budget。
5. `check-editor-boundaries.mjs` 检查 UI 依赖泄漏、跨层引用和 workspace 循环依赖。

## Bundle Budget

- provider-neutral facade：不超过 8 KiB gzip。
- 默认入口不得同步包含 `monaco-editor-vue3`。
- 构建必须生成独立 provider chunk。

预算针对包自身的职责边界；Monaco worker 和语言资源由最终应用按实际语言配置单独预算。
