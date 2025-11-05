import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarView } from './CalendarView';
import { Event } from '../types';

const meta: Meta<typeof CalendarView> = {
  title: 'Components/CalendarView',
  component: CalendarView,
  parameters: {
    layout: 'padded',
    chromatic: {
      disableSnapshot: false,
      viewports: [768, 1024, 1280], // 태블릿, 데스크톱
      delay: 500,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    view: {
      control: 'select',
      options: ['week', 'month'],
      description: '캘린더 뷰 타입',
    },
    currentDate: {
      control: 'date',
      description: '현재 표시할 날짜',
    },
  },
};

export default meta;
type Story = StoryObj<typeof CalendarView>;

// 샘플 이벤트 데이터
const sampleEvents: Event[] = [
  {
    id: '1',
    title: '회의',
    date: '2025-10-06',
    startTime: '10:00',
    endTime: '11:00',
    description: '팀 회의',
    location: '서울 오피스',
    category: '업무',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 60,
  },
  {
    id: '2',
    title: '점심 약속',
    date: '2025-10-07',
    startTime: '12:00',
    endTime: '13:00',
    description: '친구와 점심',
    location: '강남',
    category: '개인',
    repeat: {
      type: 'none',
      interval: 0,
    },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '주간 회의',
    date: '2025-10-10',
    startTime: '14:00',
    endTime: '15:00',
    description: '주간 스프린트 회의',
    location: '서울',
    category: '업무',
    repeat: {
      type: 'weekly',
      interval: 1,
      endDate: '2025-12-31',
    },
    notificationTime: 60,
  },
];

// 2025년 11월 공휴일
const octoberHolidays = {
  '2025-10-09': '한글날',
};

// 2025년 11월 6일 (목요일)
const octoberDate = new Date(2025, 9, 9); // 월은 0부터 시작하므로 10이 11월

/**
 * 주간 뷰 - 빈 상태
 * 이벤트가 없는 주간 캘린더
 */
export const WeekViewEmpty: Story = {
  name: '주간 뷰 - 빈 상태',
  args: {
    view: 'week',
    currentDate: octoberDate,
    events: [],
    notifiedEventIds: [],
    holidays: {},
  },
};

/**
 * 주간 뷰 - 이벤트 있음
 * 일반 이벤트가 있는 주간 캘린더
 */
export const WeekViewWithEvents: Story = {
  args: {
    view: 'week',
    currentDate: octoberDate,
    events: sampleEvents,
    notifiedEventIds: [],
    holidays: {},
  },
};

/**
 * 월간 뷰 - 빈 상태
 * 이벤트가 없는 월간 캘린더
 */
export const MonthViewEmpty: Story = {
  args: {
    view: 'month',
    currentDate: octoberDate,
    events: [],
    notifiedEventIds: [],
    holidays: {},
  },
};

/**
 * 월간 뷰 - 이벤트 있음
 * 일반 이벤트가 있는 월간 캘린더
 */
export const MonthViewWithEvents: Story = {
  args: {
    view: 'month',
    currentDate: octoberDate,
    events: sampleEvents,
    notifiedEventIds: [],
    holidays: {},
  },
};

/**
 * 월간 뷰 - 공휴일 포함
 * 공휴일이 표시되는 월간 캘린더
 */
export const MonthViewWithHolidays: Story = {
  args: {
    view: 'month',
    currentDate: octoberDate,
    events: sampleEvents,
    notifiedEventIds: [],
    holidays: octoberHolidays,
  },
};

/**
 * 월간 뷰 - 다른 월
 * 2025년 12월 캘린더
 */
export const MonthViewDecember: Story = {
  args: {
    view: 'month',
    currentDate: new Date(2025, 11, 1), // 12월
    events: [
      {
        id: '1',
        title: '크리스마스',
        date: '2025-12-25',
        startTime: '00:00',
        endTime: '23:59',
        description: '크리스마스',
        location: '집',
        category: '가족',
        repeat: {
          type: 'yearly',
          interval: 1,
        },
        notificationTime: 1440,
      },
    ],
    notifiedEventIds: [],
    holidays: {
      '2025-12-25': '크리스마스',
    },
  },
};
