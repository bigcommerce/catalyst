import {
  RectangleList,
  RectangleListGroup,
  RectangleListItem,
  RectangleListLabel,
} from '@bigcommerce/reactant/RectangleList';
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
    { entityId: 4, label: 'L' },
    { entityId: 5, label: 'XL' },
  ],
};

export const Basic: Story = {
  render: () => (
    <RectangleList>
      <RectangleListLabel>{mockedData.displayName}</RectangleListLabel>
      <RectangleListGroup>
        {mockedData.values.map(({ label, entityId }) => (
          <RectangleListItem
            href="#"
            isActive={entityId === 2}
            isDisabled={entityId === 3}
            key={entityId}
            title={`${mockedData.displayName} ${label}`}
          >
            {label}
          </RectangleListItem>
        ))}
      </RectangleListGroup>
    </RectangleList>
  ),
};
