import type {
  ExactComponentLock,
  LowCodeDraftDocument,
  LowCodeNode,
  LowCodeRuntimeContext,
} from '@nebula-studio/low-code-contract';

import type { LowCodeEditorHost } from './host.ts';

import { defineComponent, h, ref } from 'vue';

import {
  createTrustedFixtureRegistry,
  LowCodeCompiler,
} from '@nebula-studio/low-code-compiler';
import {
  applyTemplate,
  createPaletteNode,
  TEMPLATE_MANIFESTS,
  TRUSTED_COMPONENT_LOCK,
} from '@nebula-studio/low-code-kit';

import { cloneDraft, createDocumentHistory } from './host.ts';
import {
  appendChild,
  deleteNode,
  findNode,
  findParentId,
  flattenNodeIds,
  mapTree,
  moveChild,
  moveNode,
} from './tree.ts';

const registry = createTrustedFixtureRegistry();

function mergeLock(lock: ExactComponentLock): ExactComponentLock {
  return {
    components: {
      ...TRUSTED_COMPONENT_LOCK.components,
      ...lock.components,
    },
  };
}

function actionButton(label: string, options: Record<string, unknown>) {
  return h('button', { type: 'button', ...options }, label);
}

/** Insert into a Box container (selected Box, or its parent Box). */
function resolveInsertParentId(tree: LowCodeNode, selectedId: string): string {
  const hit = findNode(tree, selectedId);
  if (hit?.type === 'Box') return selectedId;
  return findParentId(tree, selectedId) || 'root';
}

export const LowCodeEditor = defineComponent({
  name: 'LowCodeEditor',
  props: {
    host: { type: Object as () => LowCodeEditorHost, required: true },
    componentLock: {
      type: Object as () => ExactComponentLock,
      required: true,
    },
    context: { type: Object as () => LowCodeRuntimeContext, required: true },
  },
  setup(props) {
    const history = createDocumentHistory(props.host.drafts.load());
    const document = ref(history.current());
    const selectedId = ref(document.value.tree.id);
    const mode = ref<'designer' | 'preview'>('designer');
    const revision = ref(0);
    const publishVersion = ref(document.value.version || '2');
    const studioMessage = ref('');
    const draggingType = ref('');

    const persist = (next: LowCodeDraftDocument) => {
      history.commit(next);
      document.value = history.current();
      props.host.drafts.save(document.value);
      revision.value += 1;
    };

    const patchSelected = (updater: (node: LowCodeNode) => LowCodeNode) => {
      const next = cloneDraft(document.value);
      next.tree = mapTree(next.tree, (node) =>
        node.id === selectedId.value ? updater(node) : node,
      );
      persist(next);
    };

    const selected = () => findNode(document.value.tree, selectedId.value);
    const focusNode = (id: string) => {
      selectedId.value = id;
      queueMicrotask(() => {
        globalThis.document
          .querySelector<HTMLElement>(`[data-lc-node="${CSS.escape(id)}"]`)
          ?.focus();
      });
    };
    const moveSelected = (offset: -1 | 1) => {
      if (selectedId.value === 'root') return;
      const parentId = findParentId(document.value.tree, selectedId.value);
      if (!parentId) return;
      persist({
        ...document.value,
        tree: moveChild(
          document.value.tree,
          parentId,
          selectedId.value,
          offset,
        ),
      });
    };

    const field = (label: string, input: ReturnType<typeof h>) =>
      h('label', { class: 'lc-field' }, [
        h('span', { class: 'lc-field__label' }, label),
        input,
      ]);

    return () => {
      const node = selected();
      return h(
        'div',
        {
          class: 'lc-editor',
          'data-lc-editor': 'true',
          'data-lc-selected': selectedId.value,
          'data-lc-revision': String(revision.value),
        },
        [
          h('div', { class: 'lc-editor__toolbar' }, [
            h('div', { class: 'lc-editor__group' }, [
              actionButton('撤销', {
                disabled: !history.canUndo(),
                onClick: () => {
                  document.value = history.undo();
                  props.host.drafts.save(document.value);
                  revision.value += 1;
                },
              }),
              actionButton('重做', {
                disabled: !history.canRedo(),
                onClick: () => {
                  document.value = history.redo();
                  props.host.drafts.save(document.value);
                  revision.value += 1;
                },
              }),
              actionButton(mode.value === 'designer' ? '预览' : '设计', {
                'data-lc-preview': mode.value,
                class: mode.value === 'preview' ? 'lc-btn--primary' : '',
                onClick: () => {
                  mode.value =
                    mode.value === 'designer' ? 'preview' : 'designer';
                },
              }),
            ]),
            h(
              'div',
              { class: 'lc-editor__group', 'aria-label': '选中节点操作' },
              [
                actionButton('上移', {
                  disabled: selectedId.value === 'root',
                  onClick: () => moveSelected(-1),
                }),
                actionButton('下移', {
                  disabled: selectedId.value === 'root',
                  onClick: () => moveSelected(1),
                }),
                actionButton('删除', {
                  disabled: selectedId.value === 'root',
                  onClick: () => {
                    persist({
                      ...document.value,
                      tree: deleteNode(document.value.tree, selectedId.value),
                    });
                    selectedId.value = 'root';
                  },
                }),
              ],
            ),
            props.host.studio
              ? h('div', { class: 'lc-editor__group' }, [
                  h('span', { class: 'lc-editor__hint' }, '版本'),
                  h('input', {
                    class: 'lc-editor__version',
                    value: publishVersion.value,
                    'data-lc-publish-version': 'true',
                    onChange: (event: Event) => {
                      publishVersion.value = (
                        event.target as HTMLInputElement
                      ).value;
                    },
                  }),
                  actionButton('发布', {
                    class: 'lc-btn--primary',
                    'data-lc-publish': 'true',
                    onClick: () => {
                      void props.host.studio
                        ?.publish(
                          document.value,
                          mergeLock(props.componentLock),
                          publishVersion.value,
                        )
                        .then(() => {
                          studioMessage.value = `已发布 ${publishVersion.value}`;
                        })
                        .catch((cause: unknown) => {
                          studioMessage.value =
                            cause instanceof Error ? cause.message : '发布失败';
                        });
                    },
                  }),
                  actionButton('回滚当前版本', {
                    'data-lc-rollback': 'true',
                    onClick: () => {
                      void props.host.studio
                        ?.rollback(document.value.version)
                        .then(() => {
                          studioMessage.value = `已回滚 ${document.value.version}`;
                        })
                        .catch((cause: unknown) => {
                          studioMessage.value =
                            cause instanceof Error ? cause.message : '回滚失败';
                        });
                    },
                  }),
                  studioMessage.value
                    ? h(
                        'span',
                        {
                          class: 'lc-editor__status',
                          'data-lc-studio-status': 'true',
                        },
                        studioMessage.value,
                      )
                    : null,
                ])
              : null,
            h('div', { class: 'lc-editor__group' }, [
              h('span', { class: 'lc-editor__hint' }, '模板'),
              ...TEMPLATE_MANIFESTS.map((template) =>
                actionButton(template.label, {
                  'data-lc-template': template.id,
                  onClick: () => {
                    persist(applyTemplate(document.value, template.id));
                    selectedId.value = 'root';
                  },
                }),
              ),
            ]),
          ]),
          h('div', { class: 'lc-editor__body' }, [
            h('aside', { class: 'lc-editor__palette' }, [
              h('h3', { class: 'lc-editor__panel-title' }, '组件'),
              h('p', { class: 'lc-editor__hint' }, '点击添加到画布'),
              ...props.host.catalog.types
                .filter((item) => item.type !== 'Box')
                .map((item) =>
                  actionButton(item.label, {
                    class: 'lc-btn--ghost',
                    'data-lc-palette': item.type,
                    draggable: true,
                    onDragstart: (event: DragEvent) => {
                      draggingType.value = item.type;
                      event.dataTransfer?.setData(
                        'application/x-nebula-component',
                        item.type,
                      );
                      if (event.dataTransfer)
                        event.dataTransfer.effectAllowed = 'copy';
                    },
                    onDragend: () => {
                      draggingType.value = '';
                    },
                    onClick: () => {
                      const parentId = resolveInsertParentId(
                        document.value.tree,
                        selectedId.value || 'root',
                      );
                      const next = cloneDraft(document.value);
                      const added = createPaletteNode(item.type);
                      next.tree = appendChild(next.tree, parentId, added);
                      persist(next);
                      selectedId.value = added.id;
                    },
                  }),
                ),
            ]),
            h(
              'div',
              {
                class: 'lc-editor__canvas',
                onDragover: (event: DragEvent) => {
                  if (
                    draggingType.value ||
                    event.dataTransfer?.types.includes(
                      'application/x-nebula-component',
                    ) ||
                    event.dataTransfer?.types.includes(
                      'application/x-nebula-node',
                    )
                  ) {
                    event.preventDefault();
                    if (event.dataTransfer)
                      event.dataTransfer.dropEffect = 'copy';
                  }
                },
                onDrop: (event: DragEvent) => {
                  event.preventDefault();
                  const movingId = event.dataTransfer?.getData(
                    'application/x-nebula-node',
                  );
                  const hitId =
                    (event.target instanceof Element
                      ? event.target
                          .closest('[data-lc-node]')
                          ?.getAttribute('data-lc-node')
                      : null) ||
                    selectedId.value ||
                    'root';
                  const hit = findNode(document.value.tree, hitId);
                  const parentId =
                    hit?.type === 'Box'
                      ? hitId
                      : findParentId(document.value.tree, hitId) || 'root';
                  if (movingId) {
                    persist({
                      ...document.value,
                      tree: moveNode(document.value.tree, movingId, parentId),
                    });
                    selectedId.value = movingId;
                    return;
                  }
                  const type =
                    event.dataTransfer?.getData(
                      'application/x-nebula-component',
                    ) || draggingType.value;
                  if (!type) return;
                  const next = cloneDraft(document.value);
                  const added = createPaletteNode(type);
                  next.tree = appendChild(next.tree, parentId, added);
                  persist(next);
                  selectedId.value = added.id;
                  draggingType.value = '';
                },
                onClick: (event: MouseEvent) => {
                  const target = event.target;
                  if (!(target instanceof Element)) return;
                  const hit = target.closest('[data-lc-node]');
                  if (hit instanceof HTMLElement && hit.dataset.lcNode) {
                    selectedId.value = hit.dataset.lcNode;
                  }
                },
                onKeydown: (event: KeyboardEvent) => {
                  const target = event.target;
                  if (!(target instanceof Element)) return;
                  const id = target
                    .closest('[data-lc-node]')
                    ?.getAttribute('data-lc-node');
                  if (!id) return;
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    selectedId.value = id;
                  } else if (
                    (event.key === 'ArrowUp' || event.key === 'ArrowDown') &&
                    event.altKey
                  ) {
                    event.preventDefault();
                    selectedId.value = id;
                    moveSelected(event.key === 'ArrowUp' ? -1 : 1);
                  } else if (
                    event.key === 'ArrowUp' ||
                    event.key === 'ArrowDown' ||
                    event.key === 'Home' ||
                    event.key === 'End'
                  ) {
                    event.preventDefault();
                    const ids = flattenNodeIds(document.value.tree);
                    const index = ids.indexOf(id);
                    const nextIndex =
                      event.key === 'Home'
                        ? 0
                        : event.key === 'End'
                          ? ids.length - 1
                          : Math.max(
                              0,
                              Math.min(
                                ids.length - 1,
                                index + (event.key === 'ArrowUp' ? -1 : 1),
                              ),
                            );
                    const nextId = ids[nextIndex];
                    if (nextId) focusNode(nextId);
                  } else if (
                    (event.key === 'Delete' || event.key === 'Backspace') &&
                    id !== 'root'
                  ) {
                    event.preventDefault();
                    persist({
                      ...document.value,
                      tree: deleteNode(document.value.tree, id),
                    });
                    selectedId.value = 'root';
                  }
                },
              },
              h(LowCodeCompiler, {
                definition: document.value,
                componentLock: mergeLock(props.componentLock),
                registry,
                context: props.context,
                mode: mode.value,
                selectedId: selectedId.value,
              }),
            ),
            h(
              'aside',
              { class: 'lc-editor__inspector', 'data-lc-inspector': 'true' },
              [
                h('h3', { class: 'lc-editor__panel-title' }, '属性'),
                h(
                  'p',
                  {
                    class: 'lc-editor__hint',
                    'data-lc-selected': selectedId.value,
                  },
                  `选中 ${selectedId.value}`,
                ),
                node
                  ? field(
                      '类型',
                      h('input', { value: node.type, disabled: true }),
                    )
                  : null,
                node?.type === 'Box'
                  ? field(
                      '内边距',
                      h('input', {
                        value: String(node.props?.padding ?? ''),
                        onChange: (event: Event) => {
                          const value = (event.target as HTMLInputElement)
                            .value;
                          patchSelected((current) => ({
                            ...current,
                            props: { ...current.props, padding: value },
                          }));
                        },
                      }),
                    )
                  : null,
                node?.type === 'MetricCard' || node?.type === 'StatusCard'
                  ? field(
                      '标题',
                      h('input', {
                        value: String(node.props?.label ?? ''),
                        onChange: (event: Event) => {
                          const value = (event.target as HTMLInputElement)
                            .value;
                          patchSelected((current) => ({
                            ...current,
                            props: { ...current.props, label: value },
                          }));
                        },
                      }),
                    )
                  : null,
                node
                  ? field(
                      '可见性',
                      h(
                        'select',
                        {
                          value: node.visibility ?? 'visible',
                          onChange: (event: Event) => {
                            const value = (event.target as HTMLSelectElement)
                              .value as 'hidden' | 'visible';
                            patchSelected((current) => ({
                              ...current,
                              visibility: value,
                            }));
                          },
                        },
                        [
                          h('option', { value: 'visible' }, '显示'),
                          h('option', { value: 'hidden' }, '隐藏'),
                        ],
                      ),
                    )
                  : null,
                node
                  ? field(
                      '隔离模式',
                      h(
                        'select',
                        {
                          value: node.isolation ?? 'host',
                          onChange: (event: Event) => {
                            const value = (event.target as HTMLSelectElement)
                              .value as 'host' | 'iframe';
                            patchSelected((current) => ({
                              ...current,
                              isolation: value,
                            }));
                          },
                        },
                        [
                          h('option', { value: 'host' }, 'Host'),
                          h('option', { value: 'iframe' }, 'iframe'),
                        ],
                      ),
                    )
                  : null,
                ...Object.entries(node?.props ?? {})
                  .filter(([key]) => key !== 'padding' && key !== 'label')
                  .map(([key, value]) =>
                    field(
                      `属性 ${key}`,
                      h('input', {
                        value: String(value ?? ''),
                        onChange: (event: Event) => {
                          const nextValue = (event.target as HTMLInputElement)
                            .value;
                          patchSelected((current) => ({
                            ...current,
                            props: { ...current.props, [key]: nextValue },
                          }));
                        },
                      }),
                    ),
                  ),
                h('h3', { class: 'lc-editor__panel-title' }, '绑定'),
                ...Object.entries(node?.bindings ?? {}).map(([key, binding]) =>
                  h('div', { class: 'lc-binding', 'data-lc-binding': key }, [
                    h('span', { class: 'lc-field__label' }, key),
                    h(
                      'select',
                      {
                        value: binding.kind,
                        onChange: (event: Event) => {
                          const kind = (event.target as HTMLSelectElement)
                            .value;
                          patchSelected((current) => ({
                            ...current,
                            bindings: {
                              ...current.bindings,
                              [key]:
                                kind === 'path'
                                  ? { kind: 'path', path: '' }
                                  : kind === 'expr'
                                    ? { kind: 'expr', expression: '' }
                                    : { kind: 'literal', value: '' },
                            },
                          }));
                        },
                      },
                      ['literal', 'path', 'expr'].map((kind) =>
                        h('option', { value: kind }, kind),
                      ),
                    ),
                    h('input', {
                      value:
                        binding.kind === 'path'
                          ? binding.path
                          : binding.kind === 'expr'
                            ? binding.expression
                            : String(binding.value ?? ''),
                      onChange: (event: Event) => {
                        const value = (event.target as HTMLInputElement).value;
                        patchSelected((current) => ({
                          ...current,
                          bindings: {
                            ...current.bindings,
                            [key]:
                              binding.kind === 'path'
                                ? { kind: 'path', path: value }
                                : binding.kind === 'expr'
                                  ? { kind: 'expr', expression: value }
                                  : { kind: 'literal', value },
                          },
                        }));
                      },
                    }),
                  ]),
                ),
                h('h3', { class: 'lc-editor__panel-title' }, '数据源'),
                h('p', { class: 'lc-editor__hint' }, '绑定到当前组件'),
                ...props.host.dataSources.list().map((source) =>
                  actionButton(source.label, {
                    class: 'lc-btn--ghost',
                    'data-lc-datasource': source.id,
                    onClick: () => {
                      patchSelected((current) => {
                        const key =
                          current.type === 'MetricCard'
                            ? 'value'
                            : current.type === 'Text'
                              ? 'text'
                              : current.type === 'AlertList' ||
                                  current.type === 'RankList'
                                ? 'items'
                                : current.type === 'TrendChart'
                                  ? 'values'
                                  : current.type === 'FilterBar'
                                    ? 'query'
                                    : current.type === 'MapControl'
                                      ? 'region'
                                      : current.type === 'StatusCard'
                                        ? 'status'
                                        : 'value';
                        return {
                          ...current,
                          bindings: {
                            ...current.bindings,
                            [key]: { kind: 'path', path: source.path },
                          },
                        };
                      });
                    },
                  }),
                ),
              ],
            ),
          ]),
        ],
      );
    };
  },
});
