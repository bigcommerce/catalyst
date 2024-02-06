import { Label } from '@bigcommerce/components/Label';
import { Swatch, SwatchItem } from '@bigcommerce/components/Swatch';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Swatch> = {
  component: Swatch,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Swatch>;

const mockedData = {
  entityId: 295,
  displayName: 'Color',
  isRequired: true,
  __typename: 'MultipleChoiceOption',
  displayStyle: 'Swatch',
  values: [
    { entityId: 462, label: 'Red', isDefault: false, hexColors: ['#FF001E'], imageUrl: null },
    { entityId: 463, label: 'Blue', isDefault: false, hexColors: ['#2700FF'], imageUrl: null },
    {
      entityId: 464,
      label: 'Green',
      isDefault: true,
      hexColors: ['#14FF00'],
      imageUrl: null,
      disabled: true,
    },
    {
      entityId: 465,
      label: 'Grey-ish',
      isDefault: false,
      hexColors: ['#3D3E57', '#BA5B5B'],
      imageUrl: null,
    },
    {
      entityId: 466,
      label: 'None',
      isDefault: false,
      hexColors: [],
    },
    {
      entityId: 467,
      label: 'None',
      isDefault: false,
      hexColors: [],
      disabled: true,
    },
  ],
};

export const BasicExample: Story = {
  render: () => (
    <form>
      <Label id="label">{mockedData.displayName}</Label>
      <Swatch aria-labelledby="label" defaultValue="465">
        {mockedData.values.map(({ entityId: id, label, hexColors, ...rest }) => {
          return (
            <SwatchItem
              key={id}
              title={`${mockedData.displayName} ${label}`}
              value={String(id)}
              variantColor={hexColors[0]}
              {...rest}
            />
          );
        })}
      </Swatch>
    </form>
  ),
};
