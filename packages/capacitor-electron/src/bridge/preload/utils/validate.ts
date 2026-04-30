import {
  validateExternalOpenPayload,
  validateReadFilePayload,
} from '../../../shared/schema/validators';
import { BridgeError } from '../../../shared/errors/bridge-error';
import { BRIDGE_ERROR_CODES } from '../../../shared/errors/codes';

import { BRIDGE_METHODS } from '../../../shared/protocol/constants';

export function validatePayload(method: string, payload: unknown): void {
  if (
    method === BRIDGE_METHODS.runtimeGetInfo &&
    (payload === null || typeof payload !== 'object')
  ) {
    throw new BridgeError(
      BRIDGE_ERROR_CODES.invalidParams,
      'runtime.getInfo expects an object payload.',
    );
  }

  if (
    method === BRIDGE_METHODS.externalOpen &&
    !validateExternalOpenPayload(payload)
  ) {
    throw new BridgeError(
      BRIDGE_ERROR_CODES.invalidParams,
      'external.open expects { url }.',
    );
  }

  if (method === BRIDGE_METHODS.fileRead && !validateReadFilePayload(payload)) {
    throw new BridgeError(
      BRIDGE_ERROR_CODES.invalidParams,
      'file.read expects { path, encoding? }.',
    );
  }
}
