# @nebula-studio-preload/docs

**文档 BrowserView** 使用的 preload，与 **`@nebula-studio-renderer/docs`** 配对。

## 与配置的对应关系

- `app.config.ts` 中 **docs 窗口**（或等价键）的 `preload: 'docs'` → 本包。

## 脚本

见 [package.json](./package.json)。

## 改名必查

- 主进程里对 preload 名的引用；`defineNebulaElectronViteConfig` 的 `preloadInputs` 若被自定义。

## 相关

- [docs renderer README](../../sub-web/docs/README.md) · [Monorepo 索引](../../../docs/monorepo.md)
