import { useDraggable } from '@dnd-kit/core';
import { Box } from '@mui/material';

import { EventItemView } from './EventItemView';
import { Event } from '../../types';

interface EventItemProps {
  /** 표시할 이벤트 */
  event: Event;
  /** 알림이 표시된 이벤트인지 여부 */
  isNotified?: boolean;
}

/**
 * 일정 아이템 컴포넌트
 * 드래그 앤 드롭 기능을 제공하는 일정 아이템입니다.
 * UI는 EventItemView 컴포넌트를 사용합니다.
 */
export const EventItem = ({ event, isNotified = false }: EventItemProps) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: event.id,
  });

  return (
    <Box ref={setNodeRef} {...listeners} {...attributes} {...transform} sx={{ cursor: 'grab' }}>
      <EventItemView event={event} isNotified={isNotified} />
    </Box>
  );
};
