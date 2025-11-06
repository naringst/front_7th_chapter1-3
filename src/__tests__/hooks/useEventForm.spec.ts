// useEventForm hook에 대한 단위 테스트

// useEventForm hook을 참고해서 필요한 단위 테스트 코드 작성
import { renderHook, act } from '@testing-library/react';
import React from 'react';

import { useEventForm } from '../../hooks/useEventForm';
import { Event } from '../../types';
import { getTimeErrorMessage } from '../../utils/timeValidation';

// getTimeErrorMessage를 mock 처리 (시간 검증은 별도 유닛에서 다룸)
vi.mock('../../utils/timeValidation', () => ({
  getTimeErrorMessage: vi.fn(() => ({ startTimeError: null, endTimeError: null })),
}));

describe('useEventForm', () => {
  const mockEvent: Event = {
    id: 'event-123',
    title: '주간 팀 회의',
    date: '2025-11-06',
    startTime: '10:00',
    endTime: '11:00',
    description:
      '매주 진행하는 주간 팀 회의입니다. 진행 상황을 공유하고 다음 주 계획을 논의합니다.',
    location: '회의실 A',
    category: '업무',
    repeat: {
      type: 'daily',
      interval: 1,
      endDate: '2025-11-10',
      id: 'repeat-456',
    },
    notificationTime: 15,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('초기 상태가 올바르게 설정된다 (기본값)', () => {
    const { result } = renderHook(() => useEventForm());

    expect(result.current.title).toBe('');
    expect(result.current.category).toBe('업무');
    expect(result.current.isRepeating).toBe(false);
    expect(result.current.repeatType).toBe('none');
    expect(result.current.notificationTime).toBe(10);
  });

  it('initialEvent를 전달하면 해당 값으로 초기화된다', () => {
    const { result } = renderHook(() => useEventForm(mockEvent));

    expect(result.current.title).toBe('주간 팀 회의');
    expect(result.current.date).toBe('2025-11-06');
    expect(result.current.startTime).toBe('10:00');
    expect(result.current.isRepeating).toBe(true);
    expect(result.current.repeatType).toBe('daily');
    expect(result.current.notificationTime).toBe(15);
  });

  it('handleStartTimeChange가 startTime과 에러 상태를 업데이트한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.handleStartTimeChange({
        target: { value: '09:00' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.startTime).toBe('09:00');
    expect(getTimeErrorMessage).toHaveBeenCalledWith('09:00', '');
  });

  it('handleEndTimeChange가 endTime과 에러 상태를 업데이트한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.handleEndTimeChange({
        target: { value: '18:00' },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.endTime).toBe('18:00');
    expect(getTimeErrorMessage).toHaveBeenCalledWith('', '18:00');
  });

  it('resetForm이 모든 필드를 기본값으로 초기화한다', () => {
    const { result } = renderHook(() => useEventForm(mockEvent));

    act(() => {
      result.current.resetForm();
    });

    expect(result.current.title).toBe('');
    expect(result.current.date).toBe('');
    expect(result.current.startTime).toBe('');
    expect(result.current.category).toBe('업무');
    expect(result.current.isRepeating).toBe(false);
    expect(result.current.repeatType).toBe('none');
  });

  it('editEvent가 폼 상태를 전달된 event 값으로 업데이트한다', () => {
    const { result } = renderHook(() => useEventForm());

    act(() => {
      result.current.editEvent(mockEvent);
    });

    expect(result.current.title).toBe('주간 팀 회의');
    expect(result.current.date).toBe('2025-11-06');
    expect(result.current.isRepeating).toBe(true);
    expect(result.current.repeatType).toBe('daily');
    expect(result.current.notificationTime).toBe(15);
    expect(result.current.editingEvent).toEqual(mockEvent);
  });
});
