import { Input } from '@bigcommerce/reactant/Input';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Input> = {
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
    variant: { control: 'select', options: ['success', 'error'] },
  },
};

export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = {
  args: {
    disabled: false,
    placeholder: 'Placeholder...',
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const Success: Story = {
  args: {
    ...Default.args,
    variant: 'success',
  },
};

export const Error: Story = {
  args: {
    ...Default.args,
    variant: 'error',
  },
};
