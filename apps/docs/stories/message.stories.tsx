import { Message } from '@bigcommerce/components/message';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Message> = {
  component: Message,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['info', 'success', 'error'], defaultValue: 'info' },
  },
  args: {
    variant: 'info',
  },
};

export default meta;

type Story = StoryObj<typeof Message>;

export const Info: Story = {
  args: {
    children: <p>Here is your message for Users</p>,
  },
};

export const Success: Story = {
  args: {
    children: (
      <p>
        Here is your message for Users on<strong> Successful Action</strong>
      </p>
    ),
    variant: 'success',
  },
};

export const Error: Story = {
  args: {
    children: (
      <p>
        Here is your message for Users on<strong> Failed Action</strong>
      </p>
    ),
    variant: 'error',
  },
};
