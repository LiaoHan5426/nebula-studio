<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import CodeBlock from '@tiptap/extension-code-block';
import { computed, watch } from 'vue';
import NebulaRichEditorToolbar from './NebulaRichEditorToolbar.vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    /** 工具栏 + 编辑区总高度 */
    height?: number | string;
    readonly?: boolean;
    /** 显示工具栏（只读时默认隐藏） */
    showToolbar?: boolean;
  }>(),
  {
    height: 420,
    readonly: false,
    showToolbar: undefined,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  /** tiptap 编辑器实例就绪（可用于高级定制） */
  ready: [editor: ReturnType<typeof useEditor>];
}>();

const normalizedHeight = computed(() =>
  typeof props.height === 'number' ? `${props.height}px` : props.height,
);

const toolbarVisible = computed(() => {
  if (props.showToolbar !== undefined) return props.showToolbar;
  return !props.readonly;
});

const editor = useEditor({
  content: props.modelValue ?? '',
  editable: !props.readonly,
  extensions: [
    StarterKit.configure({
      codeBlock: false, // 使用独立的 CodeBlock 扩展
    }),
    Highlight,
    Image,
    Link.configure({
      openOnClick: false,
    }),
    Placeholder.configure({
      placeholder: '输入内容...',
    }),
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableCell,
    TableHeader,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TextStyle,
    Color,
    Underline,
    CodeBlock,
  ],
  onUpdate({ editor: ed }) {
    emit('update:modelValue', ed.getHTML());
  },
});

// 同步外部 modelValue 变化到编辑器
watch(
  () => props.modelValue,
  (newVal) => {
    const ed = editor.value;
    if (!ed) return;
    const currentHtml = ed.getHTML();
    if (newVal !== currentHtml) {
      ed.commands.setContent(newVal ?? '', false);
    }
  },
);

// 同步只读状态
watch(
  () => props.readonly,
  (locked) => {
    editor.value?.setEditable(!locked);
  },
);

function handleRequestLinkUrl() {
  // eslint-disable-next-line no-alert
  const url = window.prompt('输入链接地址:');
  if (url) {
    editor.value?.chain().focus().setLink({ href: url }).run();
  }
}

function handleRequestImageUrl() {
  // eslint-disable-next-line no-alert
  const url = window.prompt('输入图片地址:');
  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run();
  }
}

// 就绪事件
if (editor.value) {
  emit('ready', editor);
}
watch(editor, (ed) => {
  if (ed) emit('ready', ed);
});
</script>

<template>
  <div
    class="nebula-rich-editor"
    :class="{ 'nebula-rich-editor--readonly': readonly }"
    :style="{ height: normalizedHeight }"
  >
    <NebulaRichEditorToolbar
      v-if="toolbarVisible && editor"
      :editor="editor"
      @request-link-url="handleRequestLinkUrl"
      @request-image-url="handleRequestImageUrl"
    />
    <div class="nebula-rich-editor__editor-wrap">
      <EditorContent :editor="editor" class="nebula-rich-editor__editor" />
    </div>
  </div>
</template>

<style scoped>
.nebula-rich-editor {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow: hidden;
  color: hsl(var(--foreground));
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: 10px;
}

.nebula-rich-editor__editor-wrap {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

.nebula-rich-editor__editor {
  height: 100%;
}

.nebula-rich-editor--readonly .nebula-rich-editor__toolbar {
  display: none;
}
</style>
