import type { Meta, StoryObj } from '@storybook/react-vite';
import { useState } from 'react';

import { FormCheckbox } from './FormCheckbox';

const meta: Meta<typeof FormCheckbox> = {
  title: 'Components/FormCheckbox',
  component: FormCheckbox,
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
type Story = StoryObj<typeof FormCheckbox>;

const UncheckedForm = () => {
  const [checked, setChecked] = useState(false);
  return <FormCheckbox label="반복 일정" checked={checked} onChange={setChecked} />;
};

export const Unchecked: Story = {
  name: '언체크 상태',
  render: () => <UncheckedForm />,
};

const CheckedForm = () => {
  const [checked, setChecked] = useState(true);
  return <FormCheckbox label="반복 일정" checked={checked} onChange={setChecked} />;
};

export const Checked: Story = {
  name: '체크 상태',
  render: () => <CheckedForm />,
};
