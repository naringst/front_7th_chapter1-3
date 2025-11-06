import { DndContext, pointerWithin } from '@dnd-kit/core';
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { CalendarCell } from './CalendarCell';
import { EventDragOverlay } from './EventDragOverlay';
import { useEventDrag } from '../../hooks/useEventDrag';
import { Event } from '../../types';
import {
  formatDate,
  formatMonth,
  formatWeek,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
} from '../../utils/dateUtils';

const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarViewProps {
  view: 'week' | 'month';
  currentDate: Date;
  events: Event[];
  notifiedEventIds?: string[];
  holidays?: { [key: string]: string };
  onEventMove?: (eventId: string, newDate: string) => void; // eslint-disable-line no-unused-vars
}

/**
 * 캘린더 뷰 컴포넌트
 * 주간 또는 월간 뷰로 일정을 표시합니다.
 */
export const CalendarView = ({
  view,
  currentDate,
  events,
  notifiedEventIds = [],
  holidays = {},
  onEventMove,
}: CalendarViewProps) => {
  const { activeEvent, handleDragStart, handleDragEnd } = useEventDrag({
    events,
    onEventMove,
  });

  const renderWeekView = () => {
    const weekDates = getWeekDates(currentDate);
    return (
      <Stack data-testid="week-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatWeek(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                {weekDates.map((date) => {
                  const dateId = formatDate(date);
                  const dayEvents = events.filter((event) => event.date === dateId);
                  return (
                    <CalendarCell
                      key={date.toISOString()}
                      day={date}
                      dateId={dateId}
                      events={dayEvents}
                      notifiedEventIds={notifiedEventIds}
                    />
                  );
                })}
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  const renderMonthView = () => {
    const weeks = getWeeksAtMonth(currentDate);

    return (
      <Stack data-testid="month-view" spacing={4} sx={{ width: '100%' }}>
        <Typography variant="h5">{formatMonth(currentDate)}</Typography>
        <TableContainer>
          <Table sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                {weekDays.map((day) => (
                  <TableCell key={day} sx={{ width: '14.28%', padding: 1, textAlign: 'center' }}>
                    {day}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {weeks.map((week, weekIndex) => (
                <TableRow key={weekIndex}>
                  {week.map((day, dayIndex) => {
                    const dateString = day ? formatDate(currentDate, day) : '';
                    const holiday = holidays[dateString];
                    const dayEvents = day ? getEventsForDay(events, day) : [];

                    return (
                      <CalendarCell
                        key={dayIndex}
                        day={day}
                        dateId={dateString}
                        events={dayEvents}
                        notifiedEventIds={notifiedEventIds}
                        holiday={holiday}
                      />
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    );
  };

  return (
    <DndContext
      collisionDetection={pointerWithin}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {view === 'week' && renderWeekView()}
      {view === 'month' && renderMonthView()}

      <EventDragOverlay activeEvent={activeEvent ?? null} notifiedEventIds={notifiedEventIds} />
    </DndContext>
  );
};
