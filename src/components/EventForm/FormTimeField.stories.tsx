import type { Meta, StoryObj } from '@storybook/react-vite';
import type { ChangeEvent } from 'react';
import { useState } from 'react';

import { FormTimeField } from './FormTimeField';

const meta: Meta<typeof FormTimeField> = {
  title: 'Components/FormTimeField',
  component: FormTimeField,
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
type Story = StoryObj<typeof FormTimeField>;

const EmptyForm = () => {
  const [value, setValue] = useState('');
  return (
    <FormTimeField
      label="시작 시간"
      id="start-time"
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
    />
  );
};

export const Empty: Story = {
  name: '빈 상태',
  render: () => <EmptyForm />,
};

const FilledForm = () => {
  const [value, setValue] = useState('10:00');
  return (
    <FormTimeField
      label="시작 시간"
      id="start-time"
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
    />
  );
};

export const Filled: Story = {
  name: '채워진 상태',
  render: () => <FilledForm />,
};

const ErrorForm = () => {
  const [value, setValue] = useState('15:00');
  return (
    <FormTimeField
      label="시작 시간"
      id="start-time"
      value={value}
      onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
      error="시작 시간은 종료 시간보다 빨라야 합니다."
    />
  );
};

export const Error: Story = {
  name: '에러 상태 (시작 시간)',
  render: () => <ErrorForm />,
};

const BothErrorForm = () => {
  const [startTime, setStartTime] = useState('04:34');
  const [endTime, setEndTime] = useState('04:34');
  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <FormTimeField
        label="시작 시간"
        id="start-time"
        value={startTime}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setStartTime(e.target.value)}
        error="시작 시간은 종료 시간보다 빨라야 합니다."
      />
      <FormTimeField
        label="종료 시간"
        id="end-time"
        value={endTime}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setEndTime(e.target.value)}
        error="종료 시간은 시작 시간보다 늦어야 합니다."
      />
    </div>
  );
};

export const BothError: Story = {
  name: '에러 상태 (시작/종료 시간 모두)',
  render: () => <BothErrorForm />,
};
