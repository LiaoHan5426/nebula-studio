import { mount } from '@vue/test-utils';

import { describe, expect, it } from 'vitest';

import NebulaEmptyState from '../empty-state/NebulaEmptyState.vue';
import NebulaPageHeader from '../page-header/NebulaPageHeader.vue';
import NebulaStatusTimeline from '../status-timeline/NebulaStatusTimeline.vue';
import NebulaStepFlow from '../step-flow/NebulaStepFlow.vue';

describe('experience baseline patterns', () => {
  it('renders a single page-level heading and contextual help', () => {
    const wrapper = mount(NebulaPageHeader, {
      props: {
        title: '资源目录',
        description: '查找可申请资源',
        helpHref: '/help/catalog',
      },
    });

    expect(wrapper.findAll('h1')).toHaveLength(1);
    expect(wrapper.get('a').attributes('aria-label')).toBe('打开当前页面帮助');
  });

  it('announces error states as alerts', () => {
    const wrapper = mount(NebulaEmptyState, {
      props: {
        title: '加载失败',
        tone: 'error',
      },
    });

    expect(wrapper.attributes('role')).toBe('alert');
  });

  it('marks the active step without relying on color alone', () => {
    const wrapper = mount(NebulaStepFlow, {
      props: {
        steps: [
          { id: 'one', label: '填写用途', state: 'current' },
          { id: 'two', label: '确认提交', state: 'pending' },
        ],
      },
    });

    expect(wrapper.get('[aria-current="step"]').text()).toContain('填写用途');
  });

  it('uses semantic list markup for status history', () => {
    const wrapper = mount(NebulaStatusTimeline, {
      props: {
        items: [
          { id: 'submitted', title: '已提交', state: 'complete' },
          { id: 'review', title: '审批中', state: 'current' },
        ],
      },
    });

    expect(wrapper.findAll('ol > li')).toHaveLength(2);
    expect(wrapper.get('[aria-current="step"]').text()).toContain('审批中');
  });
});
