import { computed } from 'vue';

import { tryUseEditorHost } from '@nebula-studio/nebula-assembly';

export function useDagEditorHost() {
  const host = tryUseEditorHost();

  const editorStyle = computed(() => {
    const size = host?.size.value;
    return {
      height: size?.height ?? '100%',
      width: size?.width ?? '100%',
      minHeight: size?.height ?? '100%',
    };
  });

  const isReadonly = computed(() => host?.readonly.value ?? false);

  return {
    host,
    editorStyle,
    isReadonly,
  };
}
