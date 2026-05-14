```vue
<script setup lang="ts">
import { computed, ref } from 'vue';
import { NebulaButton, NebulaPagination } from '@nebula-studio/nebula-ui';

const total = ref(87);
const page = ref(1);
const pageSize = ref(10);

const preset = ref<'compact' | 'wide'>('compact');
const pageSizes = computed(() =>
  preset.value === 'compact' ? [5, 10, 20] : [10, 20, 50, 100],
);

const disabled = ref(false);
const showSizeChanger = ref(true);
</script>

<template>
  <div class="pagination-standalone">
    <div class="pagination-standalone__toolbar">
      <label>
        total
        <input v-model.number="total" type="number" min="0" step="1" />
      </label>
      <NebulaButton
        variant="ghost"
        @click="preset = preset === 'compact' ? 'wide' : 'compact'"
      >
        pageSizes: {{ preset === 'compact' ? '5/10/20' : '10/20/50/100' }}
      </NebulaButton>
      <label>
        <input v-model="disabled" type="checkbox" />
        disabled
      </label>
      <label>
        <input v-model="showSizeChanger" type="checkbox" />
        showSizeChanger
      </label>
    </div>
    <NebulaPagination
      v-model="page"
      v-model:page-size="pageSize"
      :total="total"
      :page-sizes="pageSizes"
      :disabled="disabled"
      :show-size-changer="showSizeChanger"
    />
    <p class="pagination-standalone__state">
      model: page={{ page }}, pageSize={{ pageSize }}
    </p>
  </div>
</template>
```

通过切换 `total`、`pageSizes` 预设、`disabled`、`showSizeChanger` 观察分页摘要与按钮状态。
