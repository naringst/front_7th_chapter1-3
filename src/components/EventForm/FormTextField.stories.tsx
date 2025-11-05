import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { FormTextField } from './FormTextField';

const meta: Meta<typeof FormTextField> = {
  title: 'Components/FormTextField',
  component: FormTextField,
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
type Story = StoryObj<typeof FormTextField>;

const EmptyForm = () => {
  const [value, setValue] = useState('');
  return <FormTextField label="제목" id="title" value={value} onChange={setValue} type="text" />;
};

export const Empty: Story = {
  name: '빈 상태',
  render: () => <EmptyForm />,
};

const FilledForm = () => {
  const [value, setValue] = useState('회의 일정');
  return <FormTextField label="제목" id="title" value={value} onChange={setValue} type="text" />;
};

export const Filled: Story = {
  name: '채워진 상태',
  render: () => <FilledForm />,
};

const DateTypeForm = () => {
  const [value, setValue] = useState('2025-10-15');
  return <FormTextField label="날짜" id="date" value={value} onChange={setValue} type="date" />;
};

export const DateType: Story = {
  name: '날짜 타입',
  render: () => <DateTypeForm />,
};

const NumberTypeForm = () => {
  const [value, setValue] = useState('1');
  return (
    <FormTextField
      label="반복 간격"
      id="repeat-interval"
      value={value}
      onChange={setValue}
      type="number"
      min={1}
    />
  );
};

export const NumberType: Story = {
  name: '숫자 타입',
  render: () => <NumberTypeForm />,
};
