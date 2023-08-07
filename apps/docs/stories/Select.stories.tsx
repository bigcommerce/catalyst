import { Select, SelectContent, SelectItem } from '@bigcommerce/reactant/Select';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Select> = {
  component: Select,
  tags: ['autodocs'],
  argTypes: {
    disabled: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
};

export default meta;

type Story = StoryObj<typeof Select>;

const mockedData = new Array(105).fill(undefined).map((_, index) => index);

export const Default: Story = {
  args: {
    disabled: false,
    placeholder: 'Select option',
  },
  render: (props: Story) => (
    <Select {...props}>
      <SelectContent>
        {mockedData.map((item) => (
          <SelectItem key={item} value={item.toString()}>
            Option {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ),
};

export const DisabledItems: Story = {
  args: {
    disabled: false,
    placeholder: 'Select option',
  },
  render: (props: Story) => (
    <Select {...props}>
      <SelectContent>
        <SelectItem value="1">Option</SelectItem>
        <SelectItem value="2">Option</SelectItem>
        <SelectItem value="3">Option</SelectItem>
        <SelectItem disabled value="4">
          Option – disabled
        </SelectItem>
        <SelectItem value="5">Option</SelectItem>
      </SelectContent>
    </Select>
  ),
};
