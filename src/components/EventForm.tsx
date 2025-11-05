import { Stack, Typography } from '@mui/material';

import { useEventForm } from '../hooks/useEventForm';
import { RepeatType } from '../types';
import { FormCheckbox } from './FormCheckbox';
import { FormSelect, type SelectOption } from './FormSelect';
import { FormSubmitButton } from './FormSubmitButton';
import { FormTextField } from './FormTextField';
import { FormTimeField } from './FormTimeField';
import { getTimeErrorMessage } from '../utils/timeValidation';

const categories: SelectOption[] = [
  { value: '업무', label: '업무' },
  { value: '개인', label: '개인' },
  { value: '가족', label: '가족' },
  { value: '기타', label: '기타' },
];

const notificationOptions: SelectOption[] = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

const repeatTypeOptions: SelectOption[] = [
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
  { value: 'yearly', label: '매년' },
];

type EventFormState = ReturnType<typeof useEventForm>;

interface EventFormProps {
  /** Form state and handlers from useEventForm hook */
  formState: EventFormState;
  /** Callback fired when the form is submitted */
  onSubmit: () => void;
}

export function EventForm({ formState, onSubmit }: EventFormProps) {
  const {
    title,
    setTitle,
    date,
    setDate,
    startTime,
    endTime,
    handleStartTimeChange,
    handleEndTimeChange,
    startTimeError,
    endTimeError,
    description,
    setDescription,
    location,
    setLocation,
    category,
    setCategory,
    isRepeating,
    setIsRepeating,
    repeatType,
    setRepeatType,
    repeatInterval,
    setRepeatInterval,
    repeatEndDate,
    setRepeatEndDate,
    notificationTime,
    setNotificationTime,
    editingEvent,
  } = formState;
  return (
    <Stack spacing={2} sx={{ width: '20%' }}>
      <Typography variant="h4">{editingEvent ? '일정 수정' : '일정 추가'}</Typography>

      <FormTextField label="제목" id="title" value={title} onChange={setTitle} type="text" />

      <FormTextField label="날짜" id="date" value={date} onChange={setDate} type="date" />

      <Stack direction="row" spacing={2}>
        <FormTimeField
          label="시작 시간"
          id="start-time"
          value={startTime}
          onChange={handleStartTimeChange}
          onBlur={() => getTimeErrorMessage(startTime, endTime)}
          error={startTimeError}
        />
        <FormTimeField
          label="종료 시간"
          id="end-time"
          value={endTime}
          onChange={handleEndTimeChange}
          onBlur={() => getTimeErrorMessage(startTime, endTime)}
          error={endTimeError}
        />
      </Stack>

      <FormTextField
        label="설명"
        id="description"
        value={description}
        onChange={setDescription}
        type="text"
      />

      <FormTextField
        label="위치"
        id="location"
        value={location}
        onChange={setLocation}
        type="text"
      />

      <FormSelect
        label="카테고리"
        id="category"
        value={category}
        onChange={(value) => setCategory(String(value))}
        options={categories}
      />

      {!editingEvent && (
        <FormCheckbox
          label="반복 일정"
          checked={isRepeating}
          onChange={(checked) => {
            setIsRepeating(checked);
            if (checked) {
              setRepeatType('daily');
            } else {
              setRepeatType('none');
            }
          }}
        />
      )}

      {isRepeating && !editingEvent && (
        <Stack spacing={2}>
          <FormSelect
            label="반복 유형"
            id="repeat-type"
            value={repeatType}
            onChange={(value) => setRepeatType(value as RepeatType)}
            options={repeatTypeOptions}
            ariaLabel="반복 유형"
          />
          <Stack direction="row" spacing={2}>
            <FormTextField
              label="반복 간격"
              id="repeat-interval"
              value={String(repeatInterval)}
              onChange={(value) => setRepeatInterval(Number(value))}
              type="number"
              min={1}
            />
            <FormTextField
              label="반복 종료일"
              id="repeat-end-date"
              value={repeatEndDate}
              onChange={setRepeatEndDate}
              type="date"
            />
          </Stack>
        </Stack>
      )}

      <FormSelect
        label="알림 설정"
        id="notification"
        value={notificationTime}
        onChange={(value) => setNotificationTime(Number(value))}
        options={notificationOptions}
      />

      <FormSubmitButton label={editingEvent ? '일정 수정' : '일정 추가'} onClick={onSubmit} />
    </Stack>
  );
}
