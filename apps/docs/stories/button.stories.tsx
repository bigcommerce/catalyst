import { Button } from '@bigcommerce/components/button';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'subtle'] },
    disabled: { control: 'boolean' },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
    disabled: false,
  },
};

export const Secondary: Story = {
  args: {
    ...Primary.args,
    variant: 'secondary',
  },
};

export const Subtle: Story = {
  args: {
    ...Primary.args,
    variant: 'subtle',
  },
};

export const AsChild: Story = {
  args: {
    asChild: true,
    children: <a href="/link">This is a link!</a>,
  },
};
