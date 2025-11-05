import type { Meta, StoryObj } from '@storybook/react-vite';

import { NotificationAlert } from './NotificationAlert';
import { NotificationItem } from '../../types';

const meta: Meta<typeof NotificationAlert> = {
  title: 'Components/Alert/NotificationAlert',
  component: NotificationAlert,
  parameters: {
    layout: 'padded',
    chromatic: {
      disableSnapshot: false,
      viewports: [768, 1024, 1280],
      delay: 500,
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof NotificationAlert>;

const singleNotification: NotificationItem[] = [
  {
    id: '1',
    message: '10분 후 회의가 시작됩니다.',
  },
];

export const Single: Story = {
  name: '단일 알림',
  args: {
    notifications: singleNotification,
    onDismiss: () => {},
  },
};

const multipleNotifications: NotificationItem[] = [
  {
    id: '1',
    message: '10분 후 회의가 시작됩니다.',
  },
  {
    id: '2',
    message: '1시간 후 중요한 미팅이 있습니다.',
  },
  {
    id: '3',
    message: '오늘 하루 일정이 모두 완료되었습니다.',
  },
];

export const Multiple: Story = {
  name: '여러 알림',
  args: {
    notifications: multipleNotifications,
    onDismiss: () => {},
  },
};

export const Empty: Story = {
  name: '빈 상태',
  args: {
    notifications: [],
    onDismiss: () => {},
  },
};
