import { TableCell, Typography } from '@mui/material';

import { Event } from '../../types';
import { EventItem } from '../EventForm/EventItem';

interface CalendarCellProps {
  /** 셀에 표시할 날짜 (주간 뷰는 Date, 월간 뷰는 number) */
  day: Date | number | null;
  events: Event[];
  notifiedEventIds?: string[];
  holiday?: string;
}

/**
 * 캘린더 셀 컴포넌트
 * 개별 셀의 렌더링과 텍스트 길이 처리를 담당합니다.
 */
export const CalendarCell = ({
  day,
  events,
  notifiedEventIds = [],
  holiday,
}: CalendarCellProps) => {
  const isWeekView = day instanceof Date;
  const isMonthView = typeof day === 'number';

  return (
    <TableCell
      sx={{
        height: '120px',
        verticalAlign: 'top',
        width: '14.28%',
        padding: 1,
        border: '1px solid #e0e0e0',
        overflow: 'hidden',
        position: isMonthView ? 'relative' : 'static',
      }}
    >
      {day && (
        <>
          {isWeekView && (
            <Typography variant="body2" fontWeight="bold">
              {day.getDate()}
            </Typography>
          )}
          {isMonthView && (
            <>
              <Typography variant="body2" fontWeight="bold">
                {day}
              </Typography>
              {holiday && (
                <Typography variant="body2" color="error">
                  {holiday}
                </Typography>
              )}
            </>
          )}
          {events.map((event) => (
            <EventItem
              key={event.id}
              event={event}
              isNotified={notifiedEventIds.includes(event.id)}
            />
          ))}
        </>
      )}
    </TableCell>
  );
};
