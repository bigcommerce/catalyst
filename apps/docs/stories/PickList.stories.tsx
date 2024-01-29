import { Label } from '@bigcommerce/reactant/Label';
import { PickList, PickListIndicator, PickListItem } from '@bigcommerce/reactant/PickList';
import type { Meta, StoryObj } from '@storybook/react';
import { Paintbrush } from 'lucide-react';
import { Fragment } from 'react';

const meta: Meta<typeof PickList> = {
  component: PickList,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof PickList>;

const MOCKED_SIZE_OPTIONS = [
  {
    id: 's1',
    value: 'Pick list item 1',
    imgSrc: '/gallery-img-01.jpg',
  },
  {
    id: 's2',
    value: 'Pick list item 2',
    imgSrc: '/gallery-img-02.jpg',
  },
  {
    id: 's3',
    value: 'Pick list item 3',
    imgSrc: 'gallery-img-03.jpg',
  },
  {
    id: 's4',
    value: 'Pick list item 4',
    disabled: true,
  },
];

export const BasicExample: Story = {
  render: () => (
    <form>
      <PickList defaultValue="Pick list item 2">
        {MOCKED_SIZE_OPTIONS.map((option) => (
          <div className="flex flex-row items-center p-4" key={option.id}>
            {Boolean(option.imgSrc) && (
              <img
                alt={option.value}
                aria-hidden="true"
                className="me-6 h-12 w-12"
                src={option.imgSrc}
              />
            )}
            <PickListItem {...option} key={option.id} />
            <Label className="cursor-pointer ps-4 font-normal" htmlFor={option.id}>
              {option.value}
            </Label>
          </div>
        ))}
      </PickList>
    </form>
  ),
};
