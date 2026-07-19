<script setup lang="ts">
import { ref } from 'vue';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import {
  NebulaButton,
  NebulaCheckbox,
  NebulaDatePicker,
  NebulaForm,
  NebulaFormItem,
  NebulaRadioGroup,
  NebulaSelect,
  NebulaSwitch,
} from '@nebula-studio/nebula-ui';

const validationSchema = toTypedSchema(
  z.object({
    role: z.string().min(1, '请选择角色'),
    mode: z.string().min(1, '请选择运行模式'),
    startDate: z.string().min(1, '请选择开始日期'),
    notifications: z.boolean(),
    agreement: z.literal(true, { error: '请阅读并同意使用条款' }),
  }),
);

const roles = [
  { label: '管理员', value: 'admin' },
  { label: '普通用户', value: 'user' },
];
const modes = [
  { label: '标准模式', value: 'standard' },
  { label: '安全模式', value: 'safe' },
];
const submittedValues = ref('');
</script>

<template>
  <NebulaForm
    class="controls-demo"
    :initial-values="{
      role: '',
      mode: '',
      startDate: null,
      notifications: false,
      agreement: false,
    }"
    :validation-schema="validationSchema"
    @submit="submittedValues = JSON.stringify($event, null, 2)"
  >
    <NebulaFormItem v-slot="{ controlProps }" name="role" label="角色" required>
      <NebulaSelect
        v-bind="controlProps"
        :options="roles"
        placeholder="请选择角色"
      />
    </NebulaFormItem>

    <NebulaFormItem
      v-slot="{ controlProps }"
      name="mode"
      label="运行模式"
      required
    >
      <NebulaRadioGroup v-bind="controlProps" :options="modes" />
    </NebulaFormItem>

    <NebulaFormItem
      v-slot="{ controlProps }"
      name="startDate"
      label="开始日期"
      required
    >
      <NebulaDatePicker v-bind="controlProps" placeholder="选择开始日期" />
    </NebulaFormItem>

    <NebulaFormItem
      v-slot="{ controlProps }"
      name="notifications"
      label="消息通知"
      hint="可随时在个人设置中修改"
    >
      <NebulaSwitch v-bind="controlProps" label="接收系统通知" />
    </NebulaFormItem>

    <NebulaFormItem
      v-slot="{ controlProps }"
      name="agreement"
      label="使用条款"
      required
    >
      <NebulaCheckbox v-bind="controlProps" label="我已阅读并同意使用条款" />
    </NebulaFormItem>

    <NebulaButton type="submit" variant="primary">提交表单</NebulaButton>
    <pre v-if="submittedValues" class="controls-demo__result">{{
      submittedValues
    }}</pre>
  </NebulaForm>
</template>

<style scoped>
.controls-demo {
  max-width: 560px;
}

.controls-demo__result {
  padding: 12px;
  margin: 0;
  overflow: auto;
  color: hsl(var(--success));
  background: hsl(var(--success) / 8%);
  border: 1px solid hsl(var(--success) / 28%);
  border-radius: var(--radius-md);
}
</style>
