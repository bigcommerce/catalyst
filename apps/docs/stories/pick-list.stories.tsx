import { Label } from '@bigcommerce/components/label';
import { PickList, PickListItem } from '@bigcommerce/components/pick-list';
import type { Meta, StoryObj } from '@storybook/react';

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
    imgsrc: '/gallery-img-01.jpg',
  },
  {
    id: 's2',
    value: 'Pick list item 2',
    imgsrc: '/gallery-img-02.jpg',
  },
  {
    id: 's3',
    value: 'Pick list item 3',
    imgsrc: 'gallery-img-03.jpg',
  },
  {
    id: 's4',
    value: 'Pick list item 4',
  },
];

export const BasicExample: Story = {
  render: () => (
    <form>
      <PickList defaultValue="Pick list item 2">
        {MOCKED_SIZE_OPTIONS.map((option) => (
          <div className="flex flex-row items-center p-4" key={option.id}>
            {Boolean(option.imgsrc) && (
              <img
                alt={option.value}
                aria-hidden="true"
                className="me-6 h-12 w-12"
                src={option.imgsrc}
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
