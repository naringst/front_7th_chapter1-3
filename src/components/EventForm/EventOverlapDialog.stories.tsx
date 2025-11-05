import type { Meta, StoryObj } from '@storybook/react-vite';

import { Event } from '../../types';
import { EventOverlapDialog } from '../Dialog/EventOverlapDialog';

const meta: Meta<typeof EventOverlapDialog> = {
  title: 'Components/Dialog/EventOverlapDialog',
  component: EventOverlapDialog,
  parameters: {
    layout: 'centered',
    chromatic: {
      disableSnapshot: false,
      viewports: [768, 1024, 1280],
      delay: 500,
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof EventOverlapDialog>;

const singleOverlappingEvent: Event = {
  id: '1',
  title: '기존 회의',
  date: '2025-10-15',
  startTime: '10:00',
  endTime: '11:00',
  description: '겹치는 일정',
  location: '회의실 A',
  category: '업무',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 60,
};

export const SingleOverlap: Story = {
  name: '단일 일정 겹침',
  args: {
    open: true,
    events: [singleOverlappingEvent],
    onClose: () => {},
    onConfirm: () => {},
  },
};

const multipleOverlappingEvents: Event[] = [
  {
    id: '1',
    title: '첫 번째 회의',
    date: '2025-10-15',
    startTime: '10:00',
    endTime: '11:00',
    description: '겹치는 일정 1',
    location: '회의실 A',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 60,
  },
  {
    id: '2',
    title: '두 번째 회의',
    date: '2025-10-15',
    startTime: '10:30',
    endTime: '11:30',
    description: '겹치는 일정 2',
    location: '회의실 B',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
  {
    id: '3',
    title: '세 번째 회의',
    date: '2025-10-15',
    startTime: '10:45',
    endTime: '11:15',
    description: '겹치는 일정 3',
    location: '회의실 C',
    category: '가족',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 120,
  },
];

export const MultipleOverlaps: Story = {
  name: '여러 일정 겹침',
  args: {
    open: true,
    events: multipleOverlappingEvents,
    onClose: () => {},
    onConfirm: () => {},
  },
};

export const Closed: Story = {
  name: '닫힌 상태',
  args: {
    open: false,
    events: [singleOverlappingEvent],
    onClose: () => {},
    onConfirm: () => {},
  },
};
