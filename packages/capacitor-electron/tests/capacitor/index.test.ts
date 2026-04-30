import { describe, expect, it } from 'vite-plus/test';
import {
  hasElectronBridge,
  installElectronCapacitor,
} from '../../src/capacitor';
import type { CapacitorContract, CapacitorWindow } from '../../src/capacitor';

describe('capacitor/index', () => {
  it('does not install electron platform without bridge', () => {
    const target = { Capacitor: {} } as CapacitorWindow;
    const patched = installElectronCapacitor({ target });

    expect(patched.getPlatform).toBeUndefined();
    expect(patched.isNativePlatform).toBeUndefined();
  });

  it('installs electron platform when bridge exists', () => {
    const target = {
      Capacitor: {},
      __nebulaStudioCapElectron: {
        invoke: async () => ({ ok: true }),
      },
    } as CapacitorWindow;
    const patched = installElectronCapacitor({ target });

    expect(patched.getPlatform?.()).toBe('electron');
    expect(patched.isNativePlatform?.()).toBe(true);
    expect(target.Capacitor).toBe(patched);
  });

  it('keeps convertFileSrc fallback when present', () => {
    const target = {
      Capacitor: {
        convertFileSrc: (filePath: string) => `converted:${filePath}`,
      } satisfies CapacitorContract,
      __nebulaStudioCapElectron: {
        invoke: async () => ({ ok: true }),
      },
    } as CapacitorWindow;
    const patched = installElectronCapacitor({ target });

    expect(patched.convertFileSrc?.('file://abc')).toBe('converted:file://abc');
  });

  it('reports bridge availability by invoke function', () => {
    const noBridge = {} as CapacitorWindow;
    const withBridge = {
      __nebulaStudioCapElectron: {
        invoke: async () => ({ ok: true }),
      },
    } as CapacitorWindow;

    expect(hasElectronBridge(noBridge)).toBe(false);
    expect(hasElectronBridge(withBridge)).toBe(true);
  });
});
