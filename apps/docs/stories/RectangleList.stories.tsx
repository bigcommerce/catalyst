import { Label } from '@bigcommerce/reactant/Label';
import { RectangleList, RectangleListItem } from '@bigcommerce/reactant/RectangleList';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof RectangleList> = {
  component: RectangleList,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof RectangleList>;

const mockedData = {
  entityId: 100,
  displayName: 'Size',
  values: [
    { entityId: 1, label: 'XS' },
    { entityId: 2, label: 'S' },
    { entityId: 3, label: 'M' },
    { entityId: 4, label: 'L', disabled: true },
    { entityId: 5, label: 'XL' },
  ],
};

export const BasicExample: Story = {
  render: () => (
    <form>
      <Label id="label">{mockedData.displayName}</Label>
      <RectangleList aria-labelledby="label" defaultValue="3">
        {mockedData.values.map(({ label, entityId, ...rest }) => (
          <RectangleListItem
            key={entityId}
            title={`${mockedData.displayName} ${label}`}
            value={String(entityId)}
            {...rest}
          >
            {label}
          </RectangleListItem>
        ))}
      </RectangleList>
    </form>
  ),
};
