import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';

import { Event, EventForm } from '../types';
import { generateRepeatEvents } from '../utils/generateRepeatEvents';

// 에러 메시지 상수
const ERROR_MESSAGES = {
  FETCH_FAILED: '이벤트 로딩 실패',
  SAVE_FAILED: '일정 저장 실패',
  DELETE_FAILED: '일정 삭제 실패',
} as const;

// 성공 메시지 상수
const SUCCESS_MESSAGES = {
  EVENT_ADDED: '일정이 추가되었습니다',
  EVENT_UPDATED: '일정이 수정되었습니다',
  EVENT_DELETED: '일정이 삭제되었습니다',
  EVENTS_LOADED: '일정 로딩 완료!',
} as const;

export const useEventOperations = (editing: boolean, onSave?: () => void) => {
  const [events, setEvents] = useState<Event[]>([]);
  const { enqueueSnackbar } = useSnackbar();

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      const { events } = await response.json();
      setEvents(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      enqueueSnackbar(ERROR_MESSAGES.FETCH_FAILED, { variant: 'error' });
    }
  };

  const saveEvent = async (eventData: Event | EventForm) => {
    try {
      let response;
      // id가 있으면 업데이트, 없으면 생성
      const isUpdate = editing || !!(eventData as Event).id;

      if (isUpdate) {
        const editingEvent = {
          ...eventData,
          // ! TEST CASE
          repeat: eventData.repeat ?? {
            type: 'none',
            interval: 0,
            endDate: '',
          },
        };

        response = await fetch(`/api/events/${(eventData as Event).id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editingEvent),
        });
      } else {
        response = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar(isUpdate ? SUCCESS_MESSAGES.EVENT_UPDATED : SUCCESS_MESSAGES.EVENT_ADDED, {
        variant: 'success',
      });
    } catch (error) {
      console.error('Error saving event:', error);
      enqueueSnackbar(ERROR_MESSAGES.SAVE_FAILED, { variant: 'error' });
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const response = await fetch(`/api/events/${id}`, { method: 'DELETE' });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      await fetchEvents();
      enqueueSnackbar(SUCCESS_MESSAGES.EVENT_DELETED, { variant: 'info' });
    } catch (error) {
      console.error('Error deleting event:', error);
      enqueueSnackbar(ERROR_MESSAGES.DELETE_FAILED, { variant: 'error' });
    }
  };

  const createRepeatEvent = async (eventData: EventForm) => {
    try {
      const newEvents = generateRepeatEvents(eventData);
      const response = await fetch('/api/events-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: newEvents }),
      });

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      await fetchEvents();
      onSave?.();
      enqueueSnackbar(SUCCESS_MESSAGES.EVENT_ADDED, { variant: 'success' });
    } catch (error) {
      console.error('Error saving event:', error);
      enqueueSnackbar(ERROR_MESSAGES.SAVE_FAILED, { variant: 'error' });
    }
  };

  /**
   * 드래그 앤 드롭으로 이벤트를 이동합니다 (낙관적 업데이트 포함)
   * 즉시 UI를 업데이트하고, saveEvent를 호출하여 서버에 저장합니다.
   * 서버 업데이트가 실패하면 롤백합니다.
   */
  const moveEvent = async (eventId: string, newDate: string) => {
    const eventToMove = events.find((e) => e.id === eventId);
    if (!eventToMove) {
      console.error('Event not found:', eventId);
      return;
    }

    const previousDate = eventToMove.date;
    // 반복 일정인 경우 반복 속성을 제거하고 일반 일정으로 변경
    const isRepeating = eventToMove.repeat.type !== 'none' && eventToMove.repeat.interval > 0;
    const updatedEvent: Event = {
      ...eventToMove,
      date: newDate,
      repeat: isRepeating ? { type: 'none', interval: 0 } : eventToMove.repeat,
    };

    // 낙관적 업데이트: 로컬 상태 즉시 업데이트
    setEvents((prevEvents) =>
      prevEvents.map((event) => (event.id === eventId ? updatedEvent : event))
    );

    try {
      // saveEvent를 사용하여 서버에 업데이트
      // saveEvent는 내부적으로 fetchEvents를 호출하므로 최신 데이터로 갱신됨
      await saveEvent(updatedEvent);
    } catch {
      // 실패 시 롤백: 이전 상태로 복원
      setEvents((prevEvents) =>
        prevEvents.map((event) => (event.id === eventId ? { ...event, date: previousDate } : event))
      );
    }
  };

  async function init() {
    await fetchEvents();
    enqueueSnackbar(SUCCESS_MESSAGES.EVENTS_LOADED, { variant: 'info' });
  }

  useEffect(() => {
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { events, fetchEvents, saveEvent, deleteEvent, createRepeatEvent, moveEvent };
};
