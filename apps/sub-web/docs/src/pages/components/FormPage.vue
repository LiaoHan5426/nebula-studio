<script setup lang="ts">
import Demo from '@/components/Demo.vue';
import formValidationDemo from '@/examples/form/FormValidation.vue?demo';
import formControlsDemo from '@/examples/form/FormControls.vue?demo';
</script>

<template>
  <div class="doc-section">
    <p>
      表单组件基于 VeeValidate 管理字段状态和提交过程，并通过 Zod Schema
      提供类型安全的字段级、跨字段和异步校验能力。
    </p>

    <h2 id="architecture">职责边界</h2>
    <div class="form-architecture">
      <div>
        <strong>NebulaForm</strong><span>表单上下文、提交、重置与校验状态</span>
      </div>
      <div>
        <strong>NebulaFormItem</strong
        ><span>字段注册、标签、帮助和错误信息</span>
      </div>
      <div>
        <strong>NebulaInput</strong><span>输入交互、无效状态和可访问属性</span>
      </div>
      <div><strong>Zod</strong><span>Schema、类型推导和业务校验规则</span></div>
    </div>

    <h2 id="validation">Schema 校验</h2>
    <p>尝试直接提交，或输入不一致的密码，可查看错误状态和跨字段校验效果。</p>
    <Demo
      :component="formValidationDemo.component"
      :source="formValidationDemo.source"
    />

    <h2 id="controls">其他表单控件</h2>
    <p>
      Select、RadioGroup、DatePicker、Switch 和 Checkbox 均使用同一套
      <code>controlProps</code>
      协议，自动接收字段值、事件、无效态和可访问性属性。
    </p>
    <Demo
      :component="formControlsDemo.component"
      :source="formControlsDemo.source"
    />

    <h2 id="form-api">NebulaForm Props</h2>
    <table>
      <thead>
        <tr>
          <th>属性</th>
          <th>说明</th>
          <th>默认值</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>validationSchema</code></td>
          <td>
            VeeValidate TypedSchema，推荐使用
            <code>toTypedSchema(zodSchema)</code>
          </td>
          <td>—</td>
        </tr>
        <tr>
          <td><code>initialValues</code></td>
          <td>字段初始值</td>
          <td><code>{}</code></td>
        </tr>
        <tr>
          <td><code>validateOnMount</code></td>
          <td>挂载时立即校验</td>
          <td><code>false</code></td>
        </tr>
        <tr>
          <td><code>keepValues</code></td>
          <td>字段卸载后保留值</td>
          <td><code>false</code></td>
        </tr>
      </tbody>
    </table>

    <h2 id="item-api">NebulaFormItem Props</h2>
    <table>
      <thead>
        <tr>
          <th>属性</th>
          <th>说明</th>
          <th>默认值</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>name</code></td>
          <td>字段路径，支持嵌套字段</td>
          <td>必填</td>
        </tr>
        <tr>
          <td><code>label</code></td>
          <td>字段标签</td>
          <td>—</td>
        </tr>
        <tr>
          <td><code>hint</code></td>
          <td>未发生错误时显示的帮助信息</td>
          <td>—</td>
        </tr>
        <tr>
          <td><code>required</code></td>
          <td>显示必填标记；实际规则仍由 Schema 决定</td>
          <td><code>false</code></td>
        </tr>
        <tr>
          <td><code>rules</code></td>
          <td>无需 Schema 时使用的字段级规则</td>
          <td>—</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.form-architecture {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin: 16px 0 24px;
}

.form-architecture div {
  display: grid;
  gap: 5px;
  padding: 16px;
  background: hsl(var(--card));
  border: 1px solid hsl(var(--border));
  border-radius: var(--radius-lg);
}

.form-architecture span {
  font-size: 13px;
  line-height: 1.6;
  color: hsl(var(--muted-foreground));
}

@media (max-width: 680px) {
  .form-architecture {
    grid-template-columns: 1fr;
  }
}
</style>
