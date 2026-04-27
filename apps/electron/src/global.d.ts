import type {
  InvokeOptions,
  MethodPayloadMap,
  MethodResultMap,
} from '@nebula-studio/capacitor-electron';

type ElectronBridgeGlobal = {
  __crossCraftCapElectron?: {
    invoke: <TMethod extends keyof MethodPayloadMap>(
      method: TMethod,
      payload: MethodPayloadMap[TMethod],
      options?: InvokeOptions,
    ) => Promise<MethodResultMap[TMethod]>;
  };
};

declare global {
  interface Window extends ElectronBridgeGlobal {}
}
// This file is required to make TypeScript recognize the global types for the Electron bridge.
