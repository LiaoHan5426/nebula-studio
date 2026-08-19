import type {
  EditorDiagnosticMessage,
  EditorHost,
  EditorHostConfigureInput,
  EditorTheme,
} from '../types/editor';

import { computed, ref, shallowRef } from 'vue';

export function createEditorHost(
  initialTheme: EditorTheme = 'light',
): EditorHost {
  const readonly = ref(false);
  const size = ref<{ height?: string; width?: string }>({
    height: '100%',
    width: '100%',
  });
  const container = shallowRef<HTMLElement | null>(null);
  const themeOverride = ref<EditorTheme | null>(null);
  const saveHandler = ref<(() => Promise<void> | void) | null>(null);
  const diagnosticsMessages = ref<EditorDiagnosticMessage[]>([]);

  const theme = computed<EditorTheme>(
    () => themeOverride.value ?? initialTheme,
  );

  return {
    theme,
    readonly,
    size,
    container,
    configure(input: EditorHostConfigureInput) {
      if (input.readonly !== undefined) readonly.value = input.readonly;
      if (input.size !== undefined) size.value = { ...input.size };
      if (input.container !== undefined) container.value = input.container;
      if (input.theme !== undefined) themeOverride.value = input.theme;
      if (input.save !== undefined) saveHandler.value = input.save;
    },
    async save() {
      const handler = saveHandler.value;
      if (!handler) {
        return;
      }
      await handler();
    },
    diagnostics: {
      messages: diagnosticsMessages,
      push(message: EditorDiagnosticMessage) {
        diagnosticsMessages.value = [...diagnosticsMessages.value, message];
      },
      clear() {
        diagnosticsMessages.value = [];
      },
    },
    resourcePicker: {
      async open() {
        return null;
      },
    },
    shortcuts: {},
    commandPalette: {},
  };
}
