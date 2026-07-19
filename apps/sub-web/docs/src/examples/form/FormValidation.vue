<script setup lang="ts">
import { ref } from 'vue';
import { toTypedSchema } from '@vee-validate/zod';
import { z } from 'zod';
import {
  NebulaButton,
  NebulaForm,
  NebulaFormItem,
  NebulaInput,
} from '@nebula-studio/nebula-ui';

const validationSchema = toTypedSchema(
  z
    .object({
      email: z.string().min(1, '请输入邮箱').email('请输入有效的邮箱地址'),
      password: z.string().min(8, '密码至少需要 8 个字符'),
      confirmPassword: z.string().min(1, '请再次输入密码'),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: '两次输入的密码不一致',
      path: ['confirmPassword'],
    }),
);

const submittedValues = ref('');

function handleSubmit(values: Record<string, unknown>): void {
  submittedValues.value = JSON.stringify(values, null, 2);
}
</script>

<template>
  <NebulaForm
    class="validation-demo"
    :initial-values="{ email: '', password: '', confirmPassword: '' }"
    :validation-schema="validationSchema"
    @reset="submittedValues = ''"
    @submit="handleSubmit"
  >
    <NebulaFormItem
      v-slot="{ controlProps }"
      name="email"
      label="邮箱"
      hint="用于接收账号通知"
      required
    >
      <NebulaInput
        v-bind="controlProps"
        autocomplete="email"
        placeholder="name@example.com"
        type="email"
      />
    </NebulaFormItem>

    <NebulaFormItem
      v-slot="{ controlProps }"
      name="password"
      label="密码"
      required
    >
      <NebulaInput
        v-bind="controlProps"
        autocomplete="new-password"
        placeholder="至少 8 个字符"
        type="password"
      />
    </NebulaFormItem>

    <NebulaFormItem
      v-slot="{ controlProps }"
      name="confirmPassword"
      label="确认密码"
      required
    >
      <NebulaInput
        v-bind="controlProps"
        autocomplete="new-password"
        placeholder="再次输入密码"
        type="password"
      />
    </NebulaFormItem>

    <div class="validation-demo__actions">
      <NebulaButton type="submit" variant="primary">提交</NebulaButton>
      <NebulaButton type="reset">重置</NebulaButton>
    </div>

    <pre v-if="submittedValues" class="validation-demo__result">{{
      submittedValues
    }}</pre>
  </NebulaForm>
</template>

<style scoped>
.validation-demo {
  max-width: 520px;
}

.validation-demo__actions {
  display: flex;
  gap: 10px;
}

.validation-demo__result {
  padding: 12px;
  margin: 0;
  overflow: auto;
  color: hsl(var(--success));
  background: hsl(var(--success) / 8%);
  border: 1px solid hsl(var(--success) / 28%);
  border-radius: var(--radius-md);
}
</style>
