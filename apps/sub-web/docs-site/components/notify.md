# Notify 通知

消息通知组件，用于展示全局通知消息。

## 基础用法

```typescript
import { NebulaNotify } from '@nebula-studio/nebula-ui';

// 成功通知
NebulaNotify.success('操作成功');

// 错误通知
NebulaNotify.error('操作失败');

// 警告通知
NebulaNotify.warning('请注意检查输入');

// 信息通知
NebulaNotify.info('这是一条提示信息');
```

## 带详细描述

```typescript
NebulaNotify.info({
  title: '系统通知',
  description: '系统将于今晚 22:00 进行维护，预计持续 2 小时。',
  duration: 5000,
});
```

## API

### 方法

| 方法名  | 参数                      | 说明         |
| ------- | ------------------------- | ------------ |
| success | `string \| NotifyOptions` | 显示成功通知 |
| error   | `string \| NotifyOptions` | 显示错误通知 |
| warning | `string \| NotifyOptions` | 显示警告通知 |
| info    | `string \| NotifyOptions` | 显示信息通知 |

### NotifyOptions

| 属性        | 类型     | 默认值 | 说明                              |
| ----------- | -------- | ------ | --------------------------------- |
| title       | `string` | —      | 通知标题                          |
| description | `string` | —      | 通知详细描述                      |
| duration    | `number` | `3000` | 显示时长（ms），设为 0 不自动关闭 |
