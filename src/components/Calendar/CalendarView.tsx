import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  pointerWithin,
} from '@dnd-kit/core';
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { CalendarCell } from './CalendarCell';
import { Event } from '../../types';
import {
  formatDate,
  formatMonth,
  formatWeek,
  getEventsForDay,
  getWeekDates,
  getWeeksAtMonth,
} from '../../utils/dateUtils';
import { EventItemView } from '../EventForm/EventItemView';

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
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const activeEvent = activeId ? events.find((event) => event.id === activeId) : null;

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
    </DndContext>
  );
};
