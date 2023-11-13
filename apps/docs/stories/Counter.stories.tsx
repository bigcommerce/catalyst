import { Counter } from '@bigcommerce/reactant/Counter';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Counter> = {
  component: Counter,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
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
    step: 0.5,
  },
};
