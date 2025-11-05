import type { Meta, StoryObj } from '@storybook/react-vite';

import { EventItem } from './EventItem';
import { Event } from '../../types';

const meta: Meta<typeof EventItem> = {
  title: 'Components/EventItem',
  component: EventItem,
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
type Story = StoryObj<typeof EventItem>;

// 샘플 이벤트 데이터
const normalEvent: Event = {
  id: '1',
  title: '일반 회의',
  date: '2025-10-06',
  startTime: '10:00',
  endTime: '11:00',
  description: '일반 일정',
  location: '서울',
  category: '업무',
  repeat: {
    type: 'none',
    interval: 0,
  },
  notificationTime: 60,
};

const repeatingEvent: Event = {
  id: '2',
  title: '주간 회의',
  date: '2025-10-06',
  startTime: '14:00',
  endTime: '15:00',
  description: '매주 반복되는 회의',
  location: '서울',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-12-31',
  },
  notificationTime: 60,
};

const notifiedEvent: Event = {
  id: '3',
  title: '중요한 회의',
  date: '2025-10-06',
  startTime: '16:00',
  endTime: '17:00',
  description: '알림이 설정된 회의',
  location: '서울',
  category: '업무',
  repeat: {
    type: 'none',
    interval: 0,
  },
  notificationTime: 10,
};

const notifiedAndRepeatingEvent: Event = {
  id: '4',
  title: '중요한 주간 회의',
  date: '2025-10-06',
  startTime: '09:00',
  endTime: '10:00',
  description: '알림과 반복이 모두 있는 중요한 회의',
  location: '서울',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-12-31',
  },
  notificationTime: 10,
};

const longTitleEvent: Event = {
  id: '5',
  title: '매우 긴 제목의 일정입니다. 이 텍스트는 길어서 잘려야 합니다.',
  date: '2025-10-06',
  startTime: '10:00',
  endTime: '11:00',
  description: '긴 제목 테스트',
  location: '서울',
  category: '업무',
  repeat: {
    type: 'none',
    interval: 0,
  },
  notificationTime: 60,
};

/**
 * 일반 일정
 * 기본 스타일 (회색 배경, 아이콘 없음)
 */
export const Normal: Story = {
  name: '일반 일정',
  args: {
    event: normalEvent,
    isNotified: false,
  },
};

/**
 * 반복 일정
 * 반복 아이콘이 표시되는 일정
 */
export const Repeating: Story = {
  name: '반복 일정',
  args: {
    event: repeatingEvent,
    isNotified: false,
  },
};

/**
 * 알림 일정
 * 빨간색 배경과 알림 아이콘이 표시되는 일정
 */
export const Notified: Story = {
  name: '알림 일정',
  args: {
    event: notifiedEvent,
    isNotified: true,
  },
};

/**
 * 알림 + 반복 일정
 * 빨간색 배경, 알림 아이콘, 반복 아이콘이 모두 표시되는 일정
 */
export const NotifiedAndRepeating: Story = {
  name: '알림 + 반복 일정',
  args: {
    event: notifiedAndRepeatingEvent,
    isNotified: true,
  },
};

/**
 * 긴 제목 일정
 * 텍스트가 길 때 잘리는지 확인
 */
export const LongTitle: Story = {
  name: '긴 제목 일정',
  args: {
    event: longTitleEvent,
    isNotified: false,
  },
};

/**
 * 알림 + 긴 제목
 * 알림 상태와 긴 제목이 함께 있는 경우
 */
export const NotifiedLongTitle: Story = {
  name: '알림 + 긴 제목',
  args: {
    event: longTitleEvent,
    isNotified: true,
  },
};
