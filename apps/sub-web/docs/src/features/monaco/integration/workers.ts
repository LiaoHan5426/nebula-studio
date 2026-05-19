// oxlint-disable-next-line import/default
import cssWorkerUrl from 'monaco-editor/esm/vs/language/css/css.worker.js?worker&url';
// oxlint-disable-next-line import/default
import htmlWorkerUrl from 'monaco-editor/esm/vs/language/html/html.worker.js?worker&url';
// oxlint-disable-next-line import/default
import jsonWorkerUrl from 'monaco-editor/esm/vs/language/json/json.worker.js?worker&url';
// oxlint-disable-next-line import/default
import tsWorkerUrl from 'monaco-editor/esm/vs/language/typescript/ts.worker.js?worker&url';
// oxlint-disable-next-line import/default
import editorWorkerUrl from 'monaco-editor/esm/vs/editor/editor.worker.js?worker&url';

type MonacoEnvironment = {
  getWorker: (_moduleId: string, label: string) => Worker;
};

const monacoGlobal = globalThis as typeof globalThis & {
  MonacoEnvironment?: MonacoEnvironment;
};

function createMonacoWorker(url: string, label: string): Worker {
  return new Worker(url, { name: label, type: 'module' });
}

monacoGlobal.MonacoEnvironment = {
  getWorker(_, label) {
    if (label === 'json') {
      return createMonacoWorker(jsonWorkerUrl, label);
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return createMonacoWorker(cssWorkerUrl, label);
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return createMonacoWorker(htmlWorkerUrl, label);
    }
    if (label === 'typescript' || label === 'javascript') {
      return createMonacoWorker(tsWorkerUrl, label);
    }
    return createMonacoWorker(editorWorkerUrl, label);
  },
};
