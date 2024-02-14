import { Checkbox } from '@bigcommerce/components/checkbox';
import { Label } from '@bigcommerce/components/label';
import type { Meta, StoryObj } from '@storybook/react';
import { X } from 'lucide-react';

const meta: Meta<typeof Checkbox> = {
  component: Checkbox,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Checkbox>;

export const BaseCheckbox: Story = {};

export const FocusedCheckbox: Story = {
  args: {
    autoFocus: true,
  },
};

export const CheckedCheckbox: Story = {
  args: {
    checked: true,
  },
};

export const DisabledCheckbox: Story = {
  args: {
    disabled: true,
  },
};

export const DisabledCheckedCheckbox: Story = {
  args: {
    checked: true,
    disabled: true,
  },
};

export const Error: Story = {
  args: {
    checked: true,
    variant: 'error',
  },
};

export const CheckboxWithLabel: Story = {
  args: {
    children: 'Label',
  },
  render: ({ children }) => (
    <div className="flex max-w-sm items-center">
      <Checkbox id="CheckboxWithLabel" />
      <Label className="cursor-pointer ps-4" htmlFor="CheckboxWithLabel">
        {children}
      </Label>
    </div>
  ),
};

export const CheckboxWithCustomIcon: Story = {
  render: () => (
    <Checkbox id="CheckboxWithCustomIcon">
      <X absoluteStrokeWidth className="stroke-white" size={13} />
    </Checkbox>
  ),
};
