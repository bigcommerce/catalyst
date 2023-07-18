import { Checkbox } from '@bigcommerce/reactant/Checkbox';
import { Label } from '@bigcommerce/reactant/Label';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

const mockedOnClick = () => {};

export const BaseCheckbox: Story = {
  args: {
    onClick: mockedOnClick,
  },
};

export const CheckboxWithLabel: Story = {
  args: {
    children: 'Label',
  },
  render: ({ children }) => (
    <div className="max-w-sm space-y-1">
      <Checkbox id="checkboxId" />
      <Label className="cursor-pointer pl-4" htmlFor="checkboxId">{children}</Label>
    </div>
  ),
};
