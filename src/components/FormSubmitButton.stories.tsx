import type { Meta, StoryObj } from '@storybook/react-vite';

import { FormSubmitButton } from './FormSubmitButton';

const meta: Meta<typeof FormSubmitButton> = {
  title: 'Components/FormSubmitButton',
  component: FormSubmitButton,
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
type Story = StoryObj<typeof FormSubmitButton>;

export const AddMode: Story = {
  name: '추가 모드',
  render: () => <FormSubmitButton label="일정 추가" onClick={() => {}} />,
};

export const EditMode: Story = {
  name: '수정 모드',
  render: () => <FormSubmitButton label="일정 수정" onClick={() => {}} />,
};
