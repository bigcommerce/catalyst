import { Label } from '@bigcommerce/components/label';
import { RadioGroup, RadioIndicator, RadioItem } from '@bigcommerce/components/radio-group';
import type { Meta, StoryObj } from '@storybook/react';
import { Paintbrush } from 'lucide-react';

const meta: Meta<typeof RadioGroup> = {
  component: RadioGroup,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof RadioGroup>;

const MOCKED_SIZE_OPTIONS = [
  {
    id: 's1',
    value: 'S',
  },
  {
    id: 's2',
    value: 'M',
  },
  {
    id: 's3',
    value: 'L',
  },
  {
    id: 's4',
    value: 'XL',
    disabled: true,
  },
];

const MOCKED_COLOR_OPTIONS = [
  {
    id: 'c1',
    value: 'Red',
  },
  {
    id: 'c2',
    value: 'Yellow',
  },
  {
    id: 'c3',
    value: 'Green',
  },
  {
    id: 'c4',
    value: 'Pink',
    disabled: true,
  },
];

export const BaseRadioGroup: Story = {
  render: () => (
    <form>
      <RadioGroup defaultValue="M">
        {MOCKED_SIZE_OPTIONS.map((option) => (
          <div className="mb-2 flex" key={option.id}>
            <RadioItem {...option} />
            <Label className="cursor-pointer ps-4" htmlFor={option.id}>
              {option.value}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </form>
  ),
};

export const RadioGroupWithIcon: Story = {
  render: () => (
    <form>
      <RadioGroup defaultValue="Green">
        {MOCKED_COLOR_OPTIONS.map((option) => (
          <div className="mb-2 flex" key={option.id}>
            <RadioItem {...option} className="group">
              <RadioIndicator className="h-3 w-3">
                <Paintbrush
                  className="stroke-blue-primary group-hover:stroke-blue-secondary group-disabled:stroke-gray-400"
                  size="12"
                />
              </RadioIndicator>
            </RadioItem>
            <Label className="cursor-pointer ps-4" htmlFor={option.id}>
              {option.value}
            </Label>
          </div>
        ))}
      </RadioGroup>
    </form>
  ),
};
