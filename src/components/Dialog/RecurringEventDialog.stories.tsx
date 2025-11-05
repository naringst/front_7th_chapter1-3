import type { Meta, StoryObj } from '@storybook/react-vite';

import RecurringEventDialog from './RecurringEventDialog';
import { Event } from '../../types';

const meta: Meta<typeof RecurringEventDialog> = {
  title: 'Components/Dialog/RecurringEventDialog',
  component: RecurringEventDialog,
  parameters: {
    layout: 'centered',
    chromatic: {
      disableSnapshot: false,
      viewports: [768, 1024, 1280],
      delay: 500,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['edit', 'delete'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof RecurringEventDialog>;

const sampleEvent: Event = {
  id: '1',
  title: '주간 회의',
  date: '2025-10-15',
  startTime: '10:00',
  endTime: '11:00',
  description: '매주 반복되는 회의',
  location: '회의실',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-12-31',
  },
  notificationTime: 60,
};

export const EditMode: Story = {
  name: '수정 모드',
  args: {
    open: true,
    mode: 'edit',
    event: sampleEvent,
    onClose: () => {},
    onConfirm: () => {},
  },
};

export const DeleteMode: Story = {
  name: '삭제 모드',
  args: {
    open: true,
    mode: 'delete',
    event: sampleEvent,
    onClose: () => {},
    onConfirm: () => {},
  },
};

export const Closed: Story = {
  name: '닫힌 상태',
  args: {
    open: false,
    mode: 'edit',
    event: sampleEvent,
    onClose: () => {},
    onConfirm: () => {},
  },
};
