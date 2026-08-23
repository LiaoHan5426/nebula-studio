import type { ComputedRef, Ref, ShallowRef } from 'vue';

export type EditorTheme = 'dark' | 'light';

/** Built-in syntax palettes. Do not map these from brand accent. */
export type EditorSyntaxTheme = 'vs' | 'vs-dark';

export interface EditorSize {
  height?: string;
  width?: string;
}

export interface EditorDiagnosticMessage {
  level: 'error' | 'info' | 'warning';
  message: string;
}

export interface EditorResourceSelection {
  id: string;
  label: string;
  uri?: string;
}

/** Phase-1 diagnostics stub — no panel UI yet. */
export interface EditorDiagnosticsStub {
  clear(): void;
  messages: Ref<EditorDiagnosticMessage[]>;
  push(message: EditorDiagnosticMessage): void;
}

/** Phase-1 resource picker stub — returns null until host implements picker. */
export interface EditorResourcePickerStub {
  open(): Promise<EditorResourceSelection | null>;
}

/** Optional future hooks — not implemented in phase 1. */
export interface EditorShortcutRegistryStub {
  register?(_id: string, _handler: () => void): () => void;
}

export interface EditorCommandPaletteStub {
  open?(): void;
}

export interface EditorHostConfigureInput {
  container?: HTMLElement | null;
  readonly?: boolean;
  save?: () => Promise<void> | void;
  size?: EditorSize;
  theme?: EditorTheme;
}

export interface EditorHost {
  commandPalette: EditorCommandPaletteStub;
  configure(input: EditorHostConfigureInput): void;
  readonly container: ShallowRef<HTMLElement | null>;
  diagnostics: EditorDiagnosticsStub;
  readonly readonly: Ref<boolean>;
  resourcePicker: EditorResourcePickerStub;
  save(): Promise<void>;
  shortcuts: EditorShortcutRegistryStub;
  readonly size: Ref<EditorSize>;
  readonly theme: ComputedRef<EditorTheme>;
}
