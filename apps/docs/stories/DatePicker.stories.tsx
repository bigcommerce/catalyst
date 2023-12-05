import { DatePicker } from '@bigcommerce/reactant/DatePicker';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof DatePicker> = {
  component: DatePicker,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean', defaultValue: false },
    placeholder: { control: 'text', defaultValue: 'MM/DD/YYYY' },
    variant: { control: 'select', options: ['success', 'error'] },
  },
};

export default meta;

type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  args: {
    disabled: false,
    placeholder: 'MM/DD/YYYY',
  },
};
