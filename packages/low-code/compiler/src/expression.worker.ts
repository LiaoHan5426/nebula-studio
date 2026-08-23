/* oxlint-disable unicorn/require-post-message-target-origin -- DedicatedWorkerGlobalScope.postMessage has no targetOrigin */
import type { LowCodeRuntimeContext } from '@nebula-studio/low-code-contract';

import { evaluateExpression } from './expression.ts';

const workerScope = globalThis;

workerScope.addEventListener('message', (event: MessageEvent) => {
  const data = event.data as { context: LowCodeRuntimeContext; source: string };
  try {
    workerScope.postMessage({
      ok: true,
      value: evaluateExpression(data.source, data.context),
    });
  } catch (error) {
    workerScope.postMessage({
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    });
  }
});
