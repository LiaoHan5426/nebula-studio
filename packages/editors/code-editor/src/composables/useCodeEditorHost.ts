import { computed } from 'vue';

import { tryUseEditorHost } from '@nebula-studio/nebula-assembly';

export function useCodeEditorHost(props: {
  height?: string;
  readonly?: boolean;
}) {
  const host = tryUseEditorHost();

  const resolvedHeight = computed(
    () => host?.size.value.height ?? props.height ?? '320px',
  );
  const resolvedReadonly = computed(
    () => host?.readonly.value ?? props.readonly ?? false,
  );
  const resolvedTheme = computed(() => host?.theme.value ?? 'light');

  return {
    host,
    resolvedHeight,
    resolvedReadonly,
    resolvedTheme,
  };
}
