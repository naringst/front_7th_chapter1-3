import { DndContext, pointerWithin } from '@dnd-kit/core';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { CalendarCell } from './CalendarCell';
import { Event } from '../../types';

const meta: Meta<typeof CalendarCell> = {
  title: 'Components/CalendarCell',
  component: CalendarCell,
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
type Story = StoryObj<typeof CalendarCell>;

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

const longTitleEvent: Event = {
  id: '2',
  title: '매우 긴 제목의 일정입니다. 이 텍스트는 셀 너비를 초과하여 잘려야 합니다.',
  date: '2025-10-06',
  startTime: '14:00',
  endTime: '15:00',
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
 * 주간 뷰 셀 - 일반 이벤트
 * 기본 셀 렌더링
 */
export const WeekCellWithNormalEvent: Story = {
  name: '주간 뷰 셀 - 일반 이벤트',
  args: {
    day: new Date(2025, 9, 6),
    events: [normalEvent],
    notifiedEventIds: [],
  },
};

/**
 * 주간 뷰 셀 - 긴 제목 이벤트
 * 셀 너비 제약으로 텍스트가 잘리는지 확인
 */
export const WeekCellWithLongTitle: Story = {
  name: '주간 뷰 셀 - 긴 제목 이벤트',
  args: {
    day: new Date(2025, 9, 6),
    events: [longTitleEvent],
    notifiedEventIds: [],
  },
};

/**
 * 주간 뷰 셀 - 여러 이벤트
 * 한 셀에 여러 이벤트가 있을 때 셀 높이 제한 내에서 처리되는지 확인
 */
export const WeekCellWithManyEvents: Story = {
  name: '주간 뷰 셀 - 여러 이벤트',
  args: {
    day: new Date(2025, 9, 6),
    events: [
      { ...normalEvent, id: '1', title: '첫 번째 일정' },
      { ...normalEvent, id: '2', title: '두 번째 일정' },
      { ...normalEvent, id: '3', title: '세 번째 일정' },
      { ...normalEvent, id: '4', title: '네 번째 일정' },
      { ...normalEvent, id: '5', title: '다섯 번째 일정' },
      { ...normalEvent, id: '6', title: '여섯 번째 일정' },
    ],
    notifiedEventIds: [],
  },
};

/**
 * 주간 뷰 셀 - 긴 제목 여러 개
 * 여러 개의 긴 제목이 셀에 들어갈 때 처리를 확인
 */
export const WeekCellWithMultipleLongTitles: Story = {
  name: '주간 뷰 셀 - 긴 제목 여러 개',
  args: {
    day: new Date(2025, 9, 6),
    events: [
      {
        ...longTitleEvent,
        id: '1',
        title: '매우 긴 제목의 첫 번째 일정입니다. 이 텍스트는 셀 너비를 초과하여 잘려야 합니다.',
      },
      {
        ...longTitleEvent,
        id: '2',
        title:
          '또 다른 매우 긴 제목의 두 번째 일정입니다. 여러 개의 긴 제목이 셀에 들어갈 때 처리를 확인합니다.',
      },
    ],
    notifiedEventIds: [],
  },
};

/**
 * 월간 뷰 셀 - 일반 이벤트
 */
export const MonthCellWithNormalEvent: Story = {
  name: '월간 뷰 셀 - 일반 이벤트',
  args: {
    day: 6,
    events: [normalEvent],
    notifiedEventIds: [],
  },
};

/**
 * 월간 뷰 셀 - 긴 제목 이벤트
 * 셀 너비 제약으로 텍스트가 잘리는지 확인
 */
export const MonthCellWithLongTitle: Story = {
  name: '월간 뷰 셀 - 긴 제목 이벤트',
  args: {
    day: 6,
    events: [longTitleEvent],
    notifiedEventIds: [],
  },
};

/**
 * 월간 뷰 셀 - 여러 이벤트
 * 한 셀에 여러 이벤트가 있을 때 셀 높이 제한 내에서 처리되는지 확인
 */
export const MonthCellWithManyEvents: Story = {
  name: '월간 뷰 셀 - 여러 이벤트',
  args: {
    day: 6,
    events: [
      { ...normalEvent, id: '1', title: '첫 번째 일정' },
      { ...normalEvent, id: '2', title: '두 번째 일정' },
      { ...normalEvent, id: '3', title: '세 번째 일정' },
      { ...normalEvent, id: '4', title: '네 번째 일정' },
      { ...normalEvent, id: '5', title: '다섯 번째 일정' },
      { ...normalEvent, id: '6', title: '여섯 번째 일정' },
    ],
    notifiedEventIds: [],
  },
};

/**
 * 월간 뷰 셀 - 공휴일 포함
 */
export const MonthCellWithHoliday: Story = {
  name: '월간 뷰 셀 - 공휴일 포함',
  args: {
    day: 9,
    events: [normalEvent],
    notifiedEventIds: [],
    holiday: '한글날',
    dateId: '2025-10-09',
  },
};

/**
 * 주간 뷰 셀 - 호버 상태 (커서 변경)
 * 셀에 마우스를 올리면 커서가 pointer로 변경됩니다.
 * 실제로 마우스를 올려서 확인하세요.
 */
export const WeekCellHoverState: Story = {
  name: '주간 뷰 셀 - 호버 상태 (커서 변경)',
  args: {
    day: new Date(2025, 9, 6),
    events: [normalEvent],
    notifiedEventIds: [],
    dateId: '2025-10-06',
  },
  parameters: {
    docs: {
      description: {
        story:
          '셀에 마우스를 올리면 커서가 `pointer`로 변경됩니다. 실제로 마우스를 올려서 확인하세요.',
      },
    },
  },
};

/**
 * 월간 뷰 셀 - 호버 상태 (커서 변경)
 * 셀에 마우스를 올리면 커서가 pointer로 변경됩니다.
 * 실제로 마우스를 올려서 확인하세요.
 */
export const MonthCellHoverState: Story = {
  name: '월간 뷰 셀 - 호버 상태 (커서 변경)',
  args: {
    day: 6,
    events: [normalEvent],
    notifiedEventIds: [],
    dateId: '2025-10-06',
  },
  parameters: {
    docs: {
      description: {
        story:
          '셀에 마우스를 올리면 커서가 `pointer`로 변경됩니다. 실제로 마우스를 올려서 확인하세요.',
      },
    },
  },
};

/**
 * 주간 뷰 셀 - 드래그 오버 상태 (배경색 변경)
 * 이벤트를 드래그하여 셀 위로 올리면 배경색이 초록색으로 변경됩니다.
 * 실제로 이벤트를 드래그하여 확인하세요.
 */
export const WeekCellDragOverState: Story = {
  name: '주간 뷰 셀 - 드래그 오버 상태 (배경색 변경)',
  args: {
    day: new Date(2025, 9, 6),
    events: [normalEvent],
    notifiedEventIds: [],
    dateId: '2025-10-06',
  },
  decorators: [
    (Story) => (
      <DndContext collisionDetection={pointerWithin} onDragStart={() => {}} onDragEnd={() => {}}>
        <Story />
      </DndContext>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          '이벤트를 드래그하여 셀 위로 올리면 배경색이 `rgba(0, 128, 0, 0.3)`로 변경됩니다. 실제로 이벤트를 드래그하여 확인하세요.',
      },
    },
  },
};

/**
 * 월간 뷰 셀 - 드래그 오버 상태 (배경색 변경)
 * 이벤트를 드래그하여 셀 위로 올리면 배경색이 초록색으로 변경됩니다.
 * 실제로 이벤트를 드래그하여 확인하세요.
 */
export const MonthCellDragOverState: Story = {
  name: '월간 뷰 셀 - 드래그 오버 상태 (배경색 변경)',
  args: {
    day: 6,
    events: [normalEvent],
    notifiedEventIds: [],
    dateId: '2025-10-06',
  },
  decorators: [
    (Story) => (
      <DndContext collisionDetection={pointerWithin} onDragStart={() => {}} onDragEnd={() => {}}>
        <Story />
      </DndContext>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          '이벤트를 드래그하여 셀 위로 올리면 배경색이 `rgba(0, 128, 0, 0.3)`로 변경됩니다. 실제로 이벤트를 드래그하여 확인하세요.',
      },
    },
  },
};
