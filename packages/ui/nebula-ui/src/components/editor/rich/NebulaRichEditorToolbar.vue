<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3';
import { cn } from '../../../utils/cn';

const props = defineProps<{
  editor: Editor | undefined;
  class?: string;
}>();

const emit = defineEmits<{
  /** 请求用户输入链接 */
  requestLinkUrl: [];
  /** 请求用户输入图片地址 */
  requestImageUrl: [];
}>();

interface ToolbarAction {
  icon: string;
  title: string;
  isActive?: () => boolean;
  action?: () => void;
  can?: () => boolean;
}

interface ToolbarGroup {
  label: string;
  actions: ToolbarAction[];
}

// tiptap 扩展命令类型未自动推断，使用 as any 绕过
function chain(): any {
  return props.editor?.chain().focus();
}

function can(): any {
  return props.editor?.can();
}

const groups: ToolbarGroup[] = [
  {
    label: '文本格式',
    actions: [
      {
        icon: 'lucide:type',
        title: '正文',
        isActive: () => props.editor?.isActive('paragraph') ?? false,
        action: () => chain().setParagraph().run(),
        can: () => can().setParagraph() ?? false,
      },
      {
        icon: 'lucide:heading-1',
        title: '标题 1',
        isActive: () =>
          props.editor?.isActive('heading', { level: 1 }) ?? false,
        action: () => chain().toggleHeading({ level: 1 }).run(),
        can: () => can().toggleHeading({ level: 1 }) ?? false,
      },
      {
        icon: 'lucide:heading-2',
        title: '标题 2',
        isActive: () =>
          props.editor?.isActive('heading', { level: 2 }) ?? false,
        action: () => chain().toggleHeading({ level: 2 }).run(),
        can: () => can().toggleHeading({ level: 2 }) ?? false,
      },
      {
        icon: 'lucide:heading-3',
        title: '标题 3',
        isActive: () =>
          props.editor?.isActive('heading', { level: 3 }) ?? false,
        action: () => chain().toggleHeading({ level: 3 }).run(),
        can: () => can().toggleHeading({ level: 3 }) ?? false,
      },
      {
        icon: 'lucide:quote',
        title: '引用',
        isActive: () => props.editor?.isActive('blockquote') ?? false,
        action: () => chain().toggleBlockquote().run(),
        can: () => can().toggleBlockquote() ?? false,
      },
    ],
  },
  {
    label: '内联格式',
    actions: [
      {
        icon: 'lucide:bold',
        title: '加粗',
        isActive: () => props.editor?.isActive('bold') ?? false,
        action: () => chain().toggleBold().run(),
        can: () => can().toggleBold() ?? false,
      },
      {
        icon: 'lucide:italic',
        title: '斜体',
        isActive: () => props.editor?.isActive('italic') ?? false,
        action: () => chain().toggleItalic().run(),
        can: () => can().toggleItalic() ?? false,
      },
      {
        icon: 'lucide:underline',
        title: '下划线',
        isActive: () => props.editor?.isActive('underline') ?? false,
        action: () => chain().toggleUnderline().run(),
        can: () => can().toggleUnderline() ?? false,
      },
      {
        icon: 'lucide:strikethrough',
        title: '删除线',
        isActive: () => props.editor?.isActive('strike') ?? false,
        action: () => chain().toggleStrike().run(),
        can: () => can().toggleStrike() ?? false,
      },
      {
        icon: 'lucide:highlighter',
        title: '高亮',
        isActive: () => props.editor?.isActive('highlight') ?? false,
        action: () => chain().toggleHighlight().run(),
        can: () => can().toggleHighlight() ?? false,
      },
    ],
  },
  {
    label: '列表',
    actions: [
      {
        icon: 'lucide:list-ordered',
        title: '有序列表',
        isActive: () => props.editor?.isActive('orderedList') ?? false,
        action: () => chain().toggleOrderedList().run(),
        can: () => can().toggleOrderedList() ?? false,
      },
      {
        icon: 'lucide:list',
        title: '无序列表',
        isActive: () => props.editor?.isActive('bulletList') ?? false,
        action: () => chain().toggleBulletList().run(),
        can: () => can().toggleBulletList() ?? false,
      },
    ],
  },
  {
    label: '对齐',
    actions: [
      {
        icon: 'lucide:align-left',
        title: '左对齐',
        isActive: () => props.editor?.isActive({ textAlign: 'left' }) ?? false,
        action: () => chain().setTextAlign('left').run(),
        can: () => can().setTextAlign('left') ?? false,
      },
      {
        icon: 'lucide:align-center',
        title: '居中',
        isActive: () =>
          props.editor?.isActive({ textAlign: 'center' }) ?? false,
        action: () => chain().setTextAlign('center').run(),
        can: () => can().setTextAlign('center') ?? false,
      },
      {
        icon: 'lucide:align-right',
        title: '右对齐',
        isActive: () => props.editor?.isActive({ textAlign: 'right' }) ?? false,
        action: () => chain().setTextAlign('right').run(),
        can: () => can().setTextAlign('right') ?? false,
      },
      {
        icon: 'lucide:align-justify',
        title: '两端对齐',
        isActive: () =>
          props.editor?.isActive({ textAlign: 'justify' }) ?? false,
        action: () => chain().setTextAlign('justify').run(),
        can: () => can().setTextAlign('justify') ?? false,
      },
    ],
  },
  {
    label: '插入',
    actions: [
      {
        icon: 'lucide:link',
        title: '链接',
        action: () => emit('requestLinkUrl'),
        can: () => true,
      },
      {
        icon: 'lucide:image',
        title: '图片',
        action: () => emit('requestImageUrl'),
        can: () => true,
      },
      {
        icon: 'lucide:table',
        title: '表格',
        action: () =>
          chain().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
        can: () => can().insertTable({ rows: 3, cols: 3 }) ?? false,
      },
      {
        icon: 'lucide:code',
        title: '代码块',
        isActive: () => props.editor?.isActive('codeBlock') ?? false,
        action: () => chain().toggleCodeBlock().run(),
        can: () => can().toggleCodeBlock() ?? false,
      },
      {
        icon: 'lucide:minus',
        title: '分割线',
        action: () => chain().setHorizontalRule().run(),
        can: () => can().setHorizontalRule() ?? false,
      },
    ],
  },
  {
    label: '撤销/重做',
    actions: [
      {
        icon: 'lucide:undo',
        title: '撤销',
        action: () => chain().undo().run(),
        can: () => can().undo() ?? false,
      },
      {
        icon: 'lucide:redo',
        title: '重做',
        action: () => chain().redo().run(),
        can: () => can().redo() ?? false,
      },
    ],
  },
];
</script>

<template>
  <div
    :class="
      cn(
        'flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1',
        props.class,
      )
    "
    role="toolbar"
    aria-label="富文本工具栏"
  >
    <template v-for="(group, gi) in groups" :key="group.label">
      <div v-if="gi > 0" class="mx-1 h-5 w-px bg-border" aria-hidden="true" />
      <button
        v-for="action in group.actions"
        :key="action.title"
        type="button"
        :title="action.title"
        :disabled="action.can?.() === false"
        :class="
          cn(
            'inline-flex size-7 items-center justify-center rounded text-sm transition-colors',
            'hover:bg-accent hover:text-accent-foreground',
            'disabled:pointer-events-none disabled:opacity-40',
            action.isActive?.() && 'bg-accent text-accent-foreground',
          )
        "
        @click="action.action"
      >
        <span class="iconify" :data-icon="action.icon" />
      </button>
    </template>
  </div>
</template>
