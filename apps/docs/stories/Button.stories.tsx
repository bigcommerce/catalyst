import { Button } from '@bigcommerce/reactant/Button';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Button> = {
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
  },
};

export default meta;

type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: 'primary',
    children: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    ...Primary.args,
    variant: 'secondary',
  },
};

export const AsChild: Story = {
  args: {
    asChild: true,
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    children: <a href="#">This is a link!</a>,
  },
};
