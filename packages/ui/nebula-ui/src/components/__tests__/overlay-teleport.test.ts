import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, ref } from 'vue';

import { describe, expect, it } from 'vitest';

import { overlayContainerKey } from '../../composables/useOverlayContainer';
import { NebulaDrawer } from '../drawer/NebulaDrawer';
import NebulaTooltip from '../tooltip/NebulaTooltip.vue';
import { hideFloatingTooltip } from '../../utils/tooltip';

describe('overlay teleport', () => {
  it('falls back to document.body when no overlay container is provided', async () => {
    const wrapper = mount(NebulaDrawer, {
      props: { open: true, title: '详情' },
      slots: { default: '正文' },
      attachTo: document.body,
    });
    await nextTick();
    expect(
      document.body.querySelector('[role="dialog"]')?.textContent,
    ).toContain('正文');
    wrapper.unmount();
  });

  it('teleports the drawer into the injected overlay container', async () => {
    const host = document.createElement('div');
    host.setAttribute('data-test-overlay', '');
    document.body.appendChild(host);
    const target = ref<HTMLElement | null>(host);

    const wrapper = mount(
      defineComponent({
        setup() {
          return () =>
            h(
              NebulaDrawer,
              { open: true, title: '详情' },
              { default: () => '注入目标' },
            );
        },
      }),
      {
        global: {
          provide: {
            [overlayContainerKey as symbol]: target,
          },
        },
        attachTo: document.body,
      },
    );
    await nextTick();

    expect(host.querySelector('[role="dialog"]')?.textContent).toContain(
      '注入目标',
    );
    expect(
      document.body.querySelector('[data-test-overlay] [role="dialog"]'),
    ).not.toBeNull();
    wrapper.unmount();
    host.remove();
  });

  it('shows a floating tooltip on hover', async () => {
    const wrapper = mount(NebulaTooltip, {
      props: { content: '这是一段提示文字' },
      slots: { default: '<button type="button">悬停</button>' },
      attachTo: document.body,
    });
    await wrapper.find('.nebula-tooltip-wrap').trigger('mouseenter');
    const tip = document.querySelector('.nebula-floating-tooltip');
    expect(tip?.textContent).toContain('这是一段提示文字');
    expect(tip?.getAttribute('data-open')).toBe('true');
    wrapper.unmount();
    hideFloatingTooltip();
  });
});
