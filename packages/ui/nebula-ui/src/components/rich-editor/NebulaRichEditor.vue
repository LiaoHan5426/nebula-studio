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
import { computed, ref, watch } from 'vue';

import NebulaDialog from '../dialog/NebulaDialog.vue';
import NebulaInput from '../input/NebulaInput.vue';
import NebulaButton from '../button/NebulaButton.vue';
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

// Dialog state for link/image input
const dialogOpen = ref(false);
const dialogType = ref<'link' | 'image'>('link');
const dialogInputValue = ref('');

function openLinkDialog() {
  dialogType.value = 'link';
  dialogInputValue.value = '';
  dialogOpen.value = true;
}

function openImageDialog() {
  dialogType.value = 'image';
  dialogInputValue.value = '';
  dialogOpen.value = true;
}

function handleDialogConfirm() {
  if (!dialogInputValue.value.trim()) return;

  if (dialogType.value === 'link') {
    editor.value
      ?.chain()
      .focus()
      .setLink({ href: dialogInputValue.value })
      .run();
  } else if (dialogType.value === 'image') {
    editor.value
      ?.chain()
      .focus()
      .setImage({ src: dialogInputValue.value })
      .run();
  }

  dialogOpen.value = false;
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
      @request-link-url="openLinkDialog"
      @request-image-url="openImageDialog"
    />
    <div class="nebula-rich-editor__editor-wrap">
      <EditorContent :editor="editor" class="nebula-rich-editor__editor" />
    </div>

    <!-- Link/Image Input Dialog -->
    <NebulaDialog
      v-model:open="dialogOpen"
      :title="dialogType === 'link' ? '插入链接' : '插入图片'"
      :description="dialogType === 'link' ? '输入链接地址' : '输入图片URL'"
    >
      <div class="flex flex-col gap-4 py-4">
        <NebulaInput
          v-model="dialogInputValue"
          :placeholder="
            dialogType === 'link'
              ? 'https://example.com'
              : 'https://example.com/image.png'
          "
          @keyup.enter="handleDialogConfirm"
        />
        <div class="flex justify-end gap-2">
          <NebulaButton variant="ghost" @click="dialogOpen = false"
            >取消</NebulaButton
          >
          <NebulaButton variant="primary" @click="handleDialogConfirm"
            >确定</NebulaButton
          >
        </div>
      </div>
    </NebulaDialog>
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
