import { defineComponent, h } from 'vue';

export const Box = defineComponent({
  name: 'LowCodeBox',
  props: {
    padding: { type: String, default: '0' },
  },
  setup(props, { slots }) {
    return () =>
      h(
        'div',
        {
          class: 'lc-box',
          style: { padding: props.padding },
          'data-lc-type': 'Box',
        },
        slots.default?.(),
      );
  },
});

export const Text = defineComponent({
  name: 'LowCodeText',
  props: {
    text: { type: String, default: '' },
  },
  setup(props) {
    return () =>
      h('span', { class: 'lc-text', 'data-lc-type': 'Text' }, props.text);
  },
});

export const MetricCard = defineComponent({
  name: 'LowCodeMetricCard',
  props: {
    label: { type: String, default: '' },
    value: { default: '' },
  },
  setup(props) {
    return () =>
      h('div', { class: 'lc-metric', 'data-lc-type': 'MetricCard' }, [
        h('p', { class: 'lc-metric__label' }, props.label),
        h('p', { class: 'lc-metric__value' }, String(props.value ?? '')),
      ]);
  },
});

export const AlertList = defineComponent({
  name: 'LowCodeAlertList',
  props: {
    items: { type: Array as () => string[], default: () => [] },
  },
  setup(props) {
    return () =>
      h(
        'ul',
        { class: 'lc-alerts', 'data-lc-type': 'AlertList' },
        (props.items ?? []).map((item) => h('li', String(item))),
      );
  },
});

export const StatusCard = defineComponent({
  name: 'LowCodeStatusCard',
  props: {
    label: { type: String, default: '' },
    status: { type: String, default: '' },
  },
  setup(props) {
    return () =>
      h('div', { class: 'lc-status', 'data-lc-type': 'StatusCard' }, [
        h('p', props.label),
        h('p', props.status),
      ]);
  },
});

export const FilterBar = defineComponent({
  name: 'LowCodeFilterBar',
  props: {
    query: { type: String, default: '' },
  },
  setup(props) {
    return () =>
      h(
        'div',
        { class: 'lc-filter', 'data-lc-type': 'FilterBar' },
        `筛选 ${props.query}`,
      );
  },
});

export const TrendChart = defineComponent({
  name: 'LowCodeTrendChart',
  props: {
    values: { type: Array as () => number[], default: () => [] },
  },
  setup(props) {
    return () =>
      h(
        'div',
        {
          class: 'lc-trend',
          'data-lc-type': 'TrendChart',
          style: { display: 'flex', gap: '4px', alignItems: 'flex-end' },
        },
        (props.values ?? []).map((value, index) =>
          h('span', {
            key: String(index),
            style: {
              display: 'inline-block',
              width: '8px',
              height: `${String(8 + Number(value) * 4)}px`,
              background: 'currentColor',
            },
          }),
        ),
      );
  },
});

export const RankList = defineComponent({
  name: 'LowCodeRankList',
  props: {
    items: {
      type: Array as () => { label?: string; value?: unknown }[],
      default: () => [],
    },
  },
  setup(props) {
    return () =>
      h(
        'ol',
        { class: 'lc-rank', 'data-lc-type': 'RankList' },
        (props.items ?? []).map((item) =>
          h('li', `${String(item.label ?? '')} ${String(item.value ?? '')}`),
        ),
      );
  },
});

export const MapControl = defineComponent({
  name: 'LowCodeMapControl',
  props: {
    region: { type: String, default: '' },
  },
  setup(props) {
    return () =>
      h(
        'div',
        { class: 'lc-map', 'data-lc-type': 'MapControl' },
        `地图控制 ${props.region}`,
      );
  },
});
