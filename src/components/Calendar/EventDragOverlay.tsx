import { DragOverlay } from '@dnd-kit/core';
import { Box } from '@mui/material';

import { Event } from '../../types';
import { EventItemView } from '../EventForm/EventItemView';

interface EventDragOverlayProps {
  /** 드래그 중인 이벤트 */
  activeEvent: Event | null;
  /** 알림이 표시된 이벤트 ID 목록 */
  notifiedEventIds?: string[];
}

/**
 * 이벤트 드래그 오버레이 컴포넌트
 * 드래그 중일 때 마우스를 따라다니는 미리보기를 표시합니다.
 */
export const EventDragOverlay = ({ activeEvent, notifiedEventIds = [] }: EventDragOverlayProps) => {
  return (
    <DragOverlay style={{ cursor: 'grabbing' }} zIndex={1000}>
      {activeEvent && (
        <Box
          sx={{
            pointerEvents: 'none',
            cursor: 'grabbing',
            boxShadow: 3,
            opacity: 0.95,
            minWidth: '120px',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <EventItemView
            event={activeEvent}
            isNotified={notifiedEventIds.includes(activeEvent.id)}
          />
        </Box>
      )}
    </DragOverlay>
  );
};
