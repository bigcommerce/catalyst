import { Input } from '@bigcommerce/reactant/Input';
import { Label } from '@bigcommerce/reactant/Label';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Label> = {
  component: Label,
  tags: ['autodocs'],
  argTypes: {
    children: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof Label>;

export const Example: Story = {
  args: {
    children: 'Label',
  },
};

export const WithInput: Story = {
  args: {
    children: 'Label',
  },
  render: ({ children }) => (
    <div className="max-w-sm space-y-1">
      <Label htmlFor="inputId">{children}</Label>
      <Input id="inputId" />
    </div>
  ),
};
