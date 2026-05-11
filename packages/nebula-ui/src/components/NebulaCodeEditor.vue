<script setup lang="ts">
import { indentWithTab } from '@codemirror/commands';
import { html } from '@codemirror/lang-html';
import { java } from '@codemirror/lang-java';
import { javascript } from '@codemirror/lang-javascript';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { python } from '@codemirror/lang-python';
import type { Language } from '@codemirror/language';
import { Compartment, EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue';

import type { NebulaEditorCodeLanguage } from './NebulaEditorTypes';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    language?: NebulaEditorCodeLanguage;
    height?: number | string;
    placeholder?: string;
    readonly?: boolean;
  }>(),
  {
    language: 'typescript',
    height: 320,
    placeholder: '',
    readonly: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const host = shallowRef<HTMLDivElement | null>(null);
let view: EditorView | undefined;

const langConf = new Compartment();
const themeConf = new Compartment();
const readOnlyConf = new Compartment();

/**
 * Markdown 整篇编辑 + fenced ```lang 内嵌多种语法高亮（与 fence 标签对应）。
 */
function markdownWithNestedCode(): ReturnType<typeof markdown> {
  return markdown({
    codeLanguages: resolveMarkdownFenceLanguage,
  });
}

function resolveMarkdownFenceLanguage(info: string): Language | null {
  const i = info.trim().toLowerCase();
  if (!i) return null;
  if (['ts', 'typescript', 'tsx'].includes(i)) {
    return javascript({ typescript: true }).language;
  }
  if (['js', 'javascript', 'mjs', 'cjs'].includes(i)) {
    return javascript().language;
  }
  if (i === 'java') return java().language;
  if (['py', 'python'].includes(i)) return python().language;
  if (['vue', 'html', 'htm', 'xml', 'svg'].includes(i)) return html().language;
  if (['md', 'markdown', 'gfm'].includes(i)) return markdownLanguage;
  return null;
}

function langExtension(id: NebulaEditorCodeLanguage) {
  switch (id) {
    case 'markdown':
      return markdownWithNestedCode();
    case 'vue':
      return html();
    case 'javascript':
      return javascript();
    case 'typescript':
      return javascript({ typescript: true });
    case 'java':
      return java();
    case 'python':
      return python();
    default:
      return javascript({ typescript: true });
  }
}

function isDarkDom(): boolean {
  return document.documentElement.classList.contains('dark');
}

function themeExtensions(): readonly import('@codemirror/state').Extension[] {
  return isDarkDom() ? [oneDark] : [];
}

function buildExtensions(): import('@codemirror/state').Extension[] {
  return [
    basicSetup,
    keymap.of([indentWithTab]),
    langConf.of(langExtension(props.language)),
    themeConf.of(themeExtensions()),
    readOnlyConf.of(EditorState.readOnly.of(props.readonly)),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        emit('update:modelValue', update.state.doc.toString());
      }
    }),
  ];
}

function createView(): void {
  destroyView();
  const el = host.value;
  if (!el) return;

  view = new EditorView({
    state: EditorState.create({
      doc: props.modelValue ?? '',
      extensions: buildExtensions(),
    }),
    parent: el,
  });
}

function destroyView(): void {
  view?.destroy();
  view = undefined;
}

function applyDomTheme(): void {
  if (!view) return;
  view.dispatch({
    effects: themeConf.reconfigure(themeExtensions()),
  });
}

function applyLanguage(): void {
  if (!view) return;
  view.dispatch({
    effects: langConf.reconfigure(langExtension(props.language)),
  });
}

function applyReadOnly(): void {
  if (!view) return;
  view.dispatch({
    effects: readOnlyConf.reconfigure(EditorState.readOnly.of(props.readonly)),
  });
}

let mo: MutationObserver | undefined;

const normalizedHeight = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : props.height,
);

onMounted(() => {
  createView();
  mo = new MutationObserver(() => applyDomTheme());
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  });
});

onBeforeUnmount(() => {
  mo?.disconnect();
  mo = undefined;
  destroyView();
});

watch(
  () => props.modelValue,
  (v) => {
    if (!view) return;
    const cur = view.state.doc.toString();
    if (v !== cur) {
      view.dispatch({
        changes: {
          from: 0,
          to: view.state.doc.length,
          insert: v ?? '',
        },
      });
    }
  },
);

watch(
  () => props.language,
  () => {
    applyLanguage();
  },
);

watch(
  () => props.readonly,
  () => {
    applyReadOnly();
  },
);
</script>

<template>
  <div class="nebula-code-editor" :style="{ height: normalizedHeight }">
    <div
      ref="host"
      class="nebula-code-editor__host"
      :aria-placeholder="placeholder?.trim() || undefined"
    />
  </div>
</template>

<style lang="scss" scoped>
.nebula-code-editor {
  box-sizing: border-box;
  width: 100%;
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
  overflow: hidden;
  background: hsl(var(--card));
}

.nebula-code-editor__host {
  height: 100%;
}

.nebula-code-editor__host :deep(.cm-editor) {
  height: 100%;
}

.nebula-code-editor__host :deep(.cm-scroller) {
  overflow-x: auto;
  overflow-y: auto;
  font-family:
    'JetBrains Mono', 'Cascadia Code', Consolas, ui-monospace, monospace;
  font-size: 0.84rem;
}
</style>
