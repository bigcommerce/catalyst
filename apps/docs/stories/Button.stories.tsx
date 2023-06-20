import { Button } from '@bigcommerce/reactant/Button';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Button> = {
  component: Button,
  // 👇 Enables auto-generated documentation for the component story
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: { control: 'color' },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    primary: true,
    label: 'Button',
    children: 'Button',
  },
};

export const Secondary: Story = {
  args: {
    ...Primary.args,
    primary: false,
  },
};

export const Third: Story = {
  render: () => <Button>Third</Button>,
};
