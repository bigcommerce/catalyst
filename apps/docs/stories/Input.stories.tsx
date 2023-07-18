import { Input } from '@bigcommerce/reactant/Input';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Input> = {
  component: Input,
  tags: ['autodocs'],
  argTypes: {
    state: { control: 'select', options: ['success', 'error'] },
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
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
    state: 'success',
  },
};

export const Error: Story = {
  args: {
    ...Default.args,
    state: 'error',
  },
};
