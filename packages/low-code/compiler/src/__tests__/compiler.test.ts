import { mount } from '@vue/test-utils';

import { createDemoBoardSnapshot } from '@nebula-studio/low-code-contract';

import { describe, expect, it } from 'vitest';

import { createTrustedFixtureRegistry } from '../fixtureRegistry.ts';
import { LowCodeCompiler } from '../LowCodeCompiler.ts';

describe('lowCodeCompiler', () => {
  it('renders the trusted fixture tree from context bindings', () => {
    const snapshot = createDemoBoardSnapshot();
    const wrapper = mount(LowCodeCompiler, {
      props: {
        definition: snapshot.definition,
        componentLock: snapshot.componentLock,
        registry: createTrustedFixtureRegistry(),
        context: { data: { title: '运营大屏', metrics: { orders: 41 } } },
        mode: 'runtime',
      },
    });
    expect(wrapper.get('[data-lc-type="Text"]').text()).toBe('运营大屏');
    expect(wrapper.get('[data-lc-type="MetricCard"]').text()).toContain('42');
    wrapper.unmount();
  });

  it('surfaces unknown component types in an error boundary', () => {
    const snapshot = createDemoBoardSnapshot();
    snapshot.definition.tree = {
      id: 'bad',
      type: 'Map',
      componentVersion: '1.0.0',
    };
    snapshot.componentLock.components = { Map: '1.0.0' };
    const wrapper = mount(LowCodeCompiler, {
      props: {
        definition: snapshot.definition,
        componentLock: snapshot.componentLock,
        registry: createTrustedFixtureRegistry(),
        context: { data: {} },
      },
    });
    expect(wrapper.get('[data-lc-error="bad"]').text()).toMatch(/Unknown/);
    wrapper.unmount();
  });

  it('renders third-party nodes in a sandboxed iframe', () => {
    const snapshot = createDemoBoardSnapshot();
    snapshot.definition.tree = {
      id: 'guest',
      type: 'SandboxFrame',
      componentVersion: '1.0.0',
      isolation: 'iframe',
    };
    snapshot.componentLock.components = { SandboxFrame: '1.0.0' };
    const wrapper = mount(LowCodeCompiler, {
      props: {
        definition: snapshot.definition,
        componentLock: snapshot.componentLock,
        registry: createTrustedFixtureRegistry(),
        context: { data: {} },
        mode: 'runtime',
      },
    });
    expect(wrapper.get('[data-lc-sandbox="guest"]').attributes('sandbox')).toBe(
      'allow-scripts',
    );
    wrapper.unmount();
  });
});
