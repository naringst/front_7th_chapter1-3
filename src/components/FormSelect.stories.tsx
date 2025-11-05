import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { FormSelect, type SelectOption } from './FormSelect';

const meta: Meta<typeof FormSelect> = {
  title: 'Components/FormSelect',
  component: FormSelect,
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
type Story = StoryObj<typeof FormSelect>;

const categoryOptions: SelectOption[] = [
  { value: '업무', label: '업무' },
  { value: '개인', label: '개인' },
  { value: '가족', label: '가족' },
  { value: '기타', label: '기타' },
];

const CategorySelectedForm = () => {
  const [value, setValue] = useState('업무');
  return (
    <FormSelect
      label="카테고리"
      id="category"
      value={value}
      onChange={(val) => setValue(String(val))}
      options={categoryOptions}
    />
  );
};

export const CategorySelected: Story = {
  name: '카테고리: 선택된 상태',
  render: () => <CategorySelectedForm />,
};

const notificationOptions: SelectOption[] = [
  { value: 1, label: '1분 전' },
  { value: 10, label: '10분 전' },
  { value: 60, label: '1시간 전' },
  { value: 120, label: '2시간 전' },
  { value: 1440, label: '1일 전' },
];

const NotificationSelectedForm = () => {
  const [value, setValue] = useState(60);
  return (
    <FormSelect
      label="알림 설정"
      id="notification"
      value={value}
      onChange={(val) => setValue(Number(val))}
      options={notificationOptions}
    />
  );
};

export const NotificationSelected: Story = {
  name: '알림 설정: 선택된 상태',
  render: () => <NotificationSelectedForm />,
};

const repeatTypeOptions: SelectOption[] = [
  { value: 'daily', label: '매일' },
  { value: 'weekly', label: '매주' },
  { value: 'monthly', label: '매월' },
  { value: 'yearly', label: '매년' },
];

const RepeatTypeSelectedForm = () => {
  const [value, setValue] = useState('weekly');
  return (
    <FormSelect
      label="반복 유형"
      id="repeat-type"
      value={value}
      onChange={(val) => setValue(String(val))}
      options={repeatTypeOptions}
      ariaLabel="반복 유형"
    />
  );
};

export const RepeatTypeSelected: Story = {
  name: '반복 유형: 선택된 상태',
  render: () => <RepeatTypeSelectedForm />,
};
