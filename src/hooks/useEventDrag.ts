import { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useState } from 'react';

import { Event } from '../types';

interface UseEventDragProps {
  events: Event[];
  onEventMove?: (eventId: string, newDate: string) => void; // eslint-disable-line no-unused-vars
}

/**
 * 이벤트 드래그 앤 드롭을 관리하는 훅
 * 드래그 중인 이벤트의 상태와 핸들러를 제공합니다.
 */
export const useEventDrag = ({ events, onEventMove }: UseEventDragProps) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !onEventMove) {
      setActiveId(null);
      return;
    }

    const eventId = active.id as string;
    const targetDateId = over.id as string;

    // 현재 이벤트의 날짜 확인
    const currentEvent = events.find((e) => e.id === eventId);
    if (!currentEvent) {
      setActiveId(null);
      return;
    }

    // 같은 위치로 드롭한 경우 무시
    if (currentEvent.date === targetDateId) {
      setActiveId(null);
      return;
    }

    onEventMove(eventId, targetDateId);
    setActiveId(null);
  };

  const activeEvent = activeId ? events.find((event) => event.id === activeId) : null;

  return {
    activeId,
    activeEvent,
    handleDragStart,
    handleDragEnd,
  };
};
