import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import NebulaButton from '../NebulaButton.vue';

describe('nebula-button', () => {
  it('renders slot content', () => {
    const wrapper = mount(NebulaButton, {
      slots: { default: 'Click me' },
    });
    expect(wrapper.text()).toBe('Click me');
  });

  it('maps primary variant to shadcn default', () => {
    const wrapper = mount(NebulaButton, {
      props: { variant: 'primary' },
    });
    const btn = wrapper.find('button');
    expect(btn.classes().some((c: string) => c.includes('bg-primary'))).toBe(
      true,
    );
  });

  it('maps secondary variant to shadcn secondary', () => {
    const wrapper = mount(NebulaButton, {
      props: { variant: 'secondary' },
    });
    const btn = wrapper.find('button');
    expect(btn.classes().some((c: string) => c.includes('bg-secondary'))).toBe(
      true,
    );
  });

  it('applies active state', () => {
    const wrapper = mount(NebulaButton, {
      props: { active: true },
    });
    const btn = wrapper.find('button');
    expect(btn.classes().some((c: string) => c.includes('bg-accent'))).toBe(
      true,
    );
  });

  it('emits click event', async () => {
    const wrapper = mount(NebulaButton);
    await wrapper.find('button').trigger('click');
    expect(wrapper.emitted('click')).toHaveLength(1);
  });

  it('respects disabled prop', () => {
    const wrapper = mount(NebulaButton, {
      props: { disabled: true },
    });
    expect(wrapper.find('button').attributes('disabled')).toBeDefined();
  });

  it('applies custom class', () => {
    const wrapper = mount(NebulaButton, {
      props: { class: 'my-custom-class' },
    });
    expect(wrapper.find('button').classes()).toContain('my-custom-class');
  });
});
