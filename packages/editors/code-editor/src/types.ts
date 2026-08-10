export type CodeEditorWordWrap = 'bounded' | 'off' | 'on' | 'wordWrapColumn';

export interface CodeEditorOptions {
  automaticLayout?: boolean;
  fontSize?: number;
  lineNumbers?: boolean;
  minimap?: boolean;
  tabSize?: number;
  wordWrap?: CodeEditorWordWrap;
}

export interface CodeEditorReadyPayload {
  editor: unknown;
  provider: 'monaco';
}

export interface CodeEditorError {
  cause?: unknown;
  message: string;
  provider: 'monaco';
}
