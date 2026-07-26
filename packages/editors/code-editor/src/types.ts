export type CodeEditorWordWrap = 'off' | 'on' | 'wordWrapColumn' | 'bounded';

export interface CodeEditorOptions {
  fontSize?: number;
  tabSize?: number;
  minimap?: boolean;
  lineNumbers?: boolean;
  wordWrap?: CodeEditorWordWrap;
  automaticLayout?: boolean;
}

export interface CodeEditorReadyPayload {
  editor: unknown;
  provider: 'monaco';
}

export interface CodeEditorError {
  message: string;
  cause?: unknown;
  provider: 'monaco';
}
