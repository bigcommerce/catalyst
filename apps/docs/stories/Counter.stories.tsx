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
  },
};

export const Disabled: Story = {
  args: {
    ...Default.args,
    disabled: true,
  },
};
