import { Counter } from '@bigcommerce/components/Counter';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Counter> = {
  component: Counter,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    variant: { control: 'select', options: ['success', 'error'] },
  },
};

export default meta;

type Story = StoryObj<typeof Counter>;

export const Default: Story = {
  args: {
    disabled: false,
    max: Infinity,
    min: 0,
    step: 1,
    onChange: undefined,
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};

export const DefaultValue: Story = {
  args: {
    ...Default.args,
    defaultValue: 5,
  },
};

export const MinValue: Story = {
  args: {
    ...Default.args,
    defaultValue: 5,
    min: 3,
  },
};

export const MaxValue: Story = {
  args: {
    ...Default.args,
    defaultValue: 5,
    max: 8,
  },
};

export const AllowDecimals: Story = {
  args: {
    ...Default.args,
    defaultValue: 5,
    isInteger: false,
    step: 0.5,
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
