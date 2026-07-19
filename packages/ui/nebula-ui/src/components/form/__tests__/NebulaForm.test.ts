import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { describe, expect, it, vi } from 'vitest';
import NebulaForm from '../NebulaForm.vue';
import NebulaFormItem from '../NebulaFormItem.vue';
import NebulaInput from '../../input/NebulaInput.vue';
import NebulaCheckbox from '../../checkbox/NebulaCheckbox.vue';
import NebulaDatePicker from '../../date-picker/NebulaDatePicker.vue';
import NebulaRadioGroup from '../../radio-group/NebulaRadioGroup.vue';
import NebulaSelect from '../../select/NebulaSelect.vue';
import NebulaSwitch from '../../switch/NebulaSwitch.vue';

function mountForm(onSubmit = vi.fn()) {
  return mount(
    defineComponent({
      components: { NebulaForm, NebulaFormItem, NebulaInput },
      setup() {
        const requiredEmail = (value: unknown) =>
          typeof value === 'string' && value.includes('@')
            ? true
            : '请输入有效的邮箱地址';

        return { onSubmit, requiredEmail };
      },
      template: `
        <NebulaForm @submit="onSubmit">
          <NebulaFormItem
            v-slot="{ describedBy, field, id, invalid }"
            name="email"
            label="邮箱"
            hint="账号邮箱"
            :rules="requiredEmail"
            required
          >
            <NebulaInput
              v-bind="field"
              :id="id"
              :aria-describedby="describedBy"
              :invalid="invalid"
            />
          </NebulaFormItem>
          <button type="submit">提交</button>
        </NebulaForm>
      `,
    }),
  );
}

describe('nebulaForm', () => {
  it('renders accessible field metadata and validation errors', async () => {
    const wrapper = mountForm();

    expect(wrapper.get('label').text()).toContain('邮箱');
    expect(wrapper.get('input').attributes('aria-describedby')).toContain(
      '-hint',
    );

    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(wrapper.get('[role="alert"]').text()).toBe('请输入有效的邮箱地址');
    expect(wrapper.get('input').attributes('aria-invalid')).toBe('true');
    expect(wrapper.get('input').attributes('aria-describedby')).toContain(
      '-error',
    );
  });

  it('submits valid values', async () => {
    const onSubmit = vi.fn();
    const wrapper = mountForm(onSubmit);

    await wrapper.get('input').setValue('user@example.com');
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(onSubmit).toHaveBeenCalledWith({ email: 'user@example.com' });
  });

  it('integrates non-input controls with field value and validation state', async () => {
    const onSubmit = vi.fn();
    const wrapper = mount(
      defineComponent({
        components: {
          NebulaCheckbox,
          NebulaDatePicker,
          NebulaForm,
          NebulaFormItem,
          NebulaRadioGroup,
          NebulaSelect,
          NebulaSwitch,
        },
        setup() {
          const required = (value: unknown) => Boolean(value) || '必填项';
          const accepted = (value: unknown) => value === true || '必须同意';
          return {
            accepted,
            onSubmit,
            required,
            modes: [{ label: '标准', value: 'standard' }],
            roles: [{ label: '用户', value: 'user' }],
          };
        },
        template: `
          <NebulaForm
            :initial-values="{ role: '', mode: '', date: null, enabled: false, accepted: false }"
            @submit="onSubmit"
          >
            <NebulaFormItem v-slot="{ controlProps }" name="role" :rules="required">
              <NebulaSelect v-bind="controlProps" :options="roles" />
            </NebulaFormItem>
            <NebulaFormItem v-slot="{ controlProps }" name="mode" :rules="required">
              <NebulaRadioGroup v-bind="controlProps" :options="modes" />
            </NebulaFormItem>
            <NebulaFormItem v-slot="{ controlProps }" name="date" :rules="required">
              <NebulaDatePicker v-bind="controlProps" />
            </NebulaFormItem>
            <NebulaFormItem v-slot="{ controlProps }" name="enabled">
              <NebulaSwitch v-bind="controlProps" />
            </NebulaFormItem>
            <NebulaFormItem v-slot="{ controlProps }" name="accepted" :rules="accepted">
              <NebulaCheckbox v-bind="controlProps" />
            </NebulaFormItem>
            <button type="submit">提交</button>
          </NebulaForm>
        `,
      }),
    );

    await wrapper.get('form').trigger('submit');
    await flushPromises();
    expect(wrapper.findAll('[role="alert"]')).toHaveLength(4);
    expect(
      wrapper.findAll('[aria-invalid="true"]').length,
    ).toBeGreaterThanOrEqual(4);

    await wrapper.get('.nebula-select__trigger').trigger('click');
    await wrapper.get('.nebula-select__option').trigger('click');
    await wrapper.get('[role="radio"]').trigger('click');
    await wrapper.get('input[type="date"]').setValue('2026-07-20');
    await wrapper.get('[role="switch"]').trigger('click');
    await wrapper.get('[role="checkbox"]').trigger('click');
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(onSubmit).toHaveBeenCalledWith({
      accepted: true,
      date: '2026-07-20',
      enabled: true,
      mode: 'standard',
      role: 'user',
    });
  });
});
