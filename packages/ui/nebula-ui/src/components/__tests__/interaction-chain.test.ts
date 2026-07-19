import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import NebulaButton from '../button/NebulaButton.vue';
import NebulaCheckbox from '../checkbox/NebulaCheckbox.vue';
import { NebulaDrawer } from '../drawer/NebulaDrawer';
import { NebulaDropdown, NebulaDropdownItem } from '../dropdown/NebulaDropdown';
import NebulaSwitch from '../switch/NebulaSwitch.vue';

afterEach(() => {
  document.body.innerHTML = '';
});

describe('interactive component chain', () => {
  it('keeps switch and checkbox v-model state in sync', async () => {
    const wrapper = mount(
      defineComponent({
        components: { NebulaSwitch, NebulaCheckbox },
        setup() {
          return { checked: ref(true), switched: ref(false) };
        },
        template: `
          <NebulaSwitch v-model="switched" />
          <NebulaCheckbox v-model="checked" />
          <output>{{ switched }},{{ checked }}</output>
        `,
      }),
    );

    const controls = wrapper.findAll('button');
    expect(controls[0]?.attributes('data-state')).toBe('unchecked');
    expect(controls[1]?.attributes('data-state')).toBe('checked');
    await controls[0]?.trigger('click');
    await controls[1]?.trigger('click');
    expect(wrapper.get('output').text()).toBe('true,false');
  });

  it('propagates a demo button click into host state', async () => {
    const wrapper = mount(
      defineComponent({
        components: { NebulaButton },
        setup() {
          return { count: ref(0) };
        },
        template: `<NebulaButton @click="count += 1">加载 {{ count }}</NebulaButton>`,
      }),
    );

    await wrapper.get('button').trigger('click');
    expect(wrapper.text()).toContain('加载 1');
  });

  it('opens dropdowns, closes on selection, and opens drawers', async () => {
    const wrapper = mount(
      defineComponent({
        components: {
          NebulaButton,
          NebulaDrawer,
          NebulaDropdown,
          NebulaDropdownItem,
        },
        setup() {
          return { drawerOpen: ref(false), dropdownOpen: ref(false) };
        },
        template: `
          <NebulaDropdown v-model:open="dropdownOpen">
            <template #trigger><NebulaButton>菜单</NebulaButton></template>
            <NebulaDropdownItem>选项</NebulaDropdownItem>
          </NebulaDropdown>
          <NebulaButton class="open-drawer" @click="drawerOpen = true">抽屉</NebulaButton>
          <NebulaDrawer v-model:open="drawerOpen" title="详情">内容</NebulaDrawer>
        `,
      }),
      { attachTo: document.body },
    );

    await wrapper.get('.nebula-dropdown__trigger button').trigger('click');
    await flushPromises();
    const menuItem =
      document.body.querySelector<HTMLButtonElement>('[role="menuitem"]');
    expect(menuItem).not.toBeNull();
    menuItem?.click();
    await flushPromises();
    expect(document.body.querySelector('[role="menu"]')).toBeNull();

    await wrapper.get('.open-drawer').trigger('click');
    await flushPromises();
    expect(
      document.body.querySelector('[role="dialog"]')?.textContent,
    ).toContain('内容');
    wrapper.unmount();
  });
});
