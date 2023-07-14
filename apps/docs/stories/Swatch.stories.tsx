import {
  Swatch,
  SwatchGroup,
  SwatchGroupLabel,
  SwatchInput,
  SwatchLabel,
  SwatchPreview,
  SwatchVariant,
} from '@bigcommerce/reactant/Swatch';
import type { Meta, StoryObj } from '@storybook/react';
import { Fragment } from 'react';

const meta: Meta<typeof Swatch> = {
  component: Swatch,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Swatch>;

const mockedData = [
  {
    entityId: 295,
    displayName: 'Color',
    isRequired: true,
    __typename: 'MultipleChoiceOption',
    displayStyle: 'Swatch',
    values: [
      { entityId: 462, label: 'Red', isDefault: false, hexColors: ['#FF001E'], imageUrl: null },
      { entityId: 463, label: 'Blue', isDefault: false, hexColors: ['#2700FF'], imageUrl: null },
      { entityId: 464, label: 'Green', isDefault: true, hexColors: ['#14FF00'], imageUrl: null },
      {
        entityId: 465,
        label: 'Grey-ish',
        isDefault: false,
        hexColors: ['#3D3E57', '#BA5B5B'],
        imageUrl: null,
      },
    ],
  },
];

const focusHandler = (
  e: MouseEvent & {
    target: HTMLElement;
  },
) => {
  const swatchInput = e.target.parentElement?.nextSibling;

  if (swatchInput) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    (swatchInput as HTMLInputElement).focus();
  }
};

/**
 * Swatch has 3 main children: `SwatchInput`, `SwatchLabel`, `SwatchLabel`.
 * Please pay attention, children order matters since sibling combinator `peer` is being used for styling inside components.
 * More details [here](https://tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-sibling-state).
 */
export const BasicSwatch: Story = {
  render: () => (
    <div className="mb-32">
      <Swatch onClick={focusHandler}>
        <SwatchInput aria-label="Blue" />
        <SwatchLabel title="Blue">
          <SwatchVariant variantColor="#053FB0" />
        </SwatchLabel>
        <SwatchPreview variantColor="#053FB0" />
      </Swatch>
    </div>
  ),
};

export const DisabledSwatch: Story = {
  render: () => (
    <div className="mb-32 flex gap-3">
      <Swatch onClick={focusHandler}>
        <SwatchInput aria-label="Blue" />
        <SwatchLabel title="Blue">
          <SwatchVariant variantColor="#3071EF" />
        </SwatchLabel>
        <SwatchPreview variantColor="#3071EF" />
      </Swatch>
      <Swatch key="disabled" onClick={focusHandler}>
        <SwatchInput disabled />
        <SwatchLabel title="disabled">
          <SwatchVariant />
        </SwatchLabel>
      </Swatch>
    </div>
  ),
};

export const NoneSwatch: Story = {
  render: () => (
    <div className="mb-32 flex gap-3">
      <Swatch>
        <SwatchInput aria-label="Blue" />
        <SwatchLabel title="Blue">
          <SwatchVariant variantColor="#3071EF" />
        </SwatchLabel>
        <SwatchPreview variantColor="#3071EF" />
      </Swatch>
      <Swatch onClick={focusHandler}>
        <SwatchInput />
        <SwatchLabel title="None">
          <SwatchVariant variant="none" />
        </SwatchLabel>
      </Swatch>
    </div>
  ),
};

/**
 * Swatch can be used in group with additional group label.
 */
export const SwatchGroupExample: Story = {
  render: () => (
    <SwatchGroup className="mb-32 flex gap-3">
      {mockedData.map(({ displayName, displayStyle, entityId, values }) => {
        if (displayStyle === 'Swatch') {
          return (
            <Fragment key={entityId}>
              <SwatchGroupLabel>Product {displayName}:</SwatchGroupLabel>
              {values.map(({ entityId: id, label, hexColors }) => {
                const swatchId = id.toString();

                return (
                  <Swatch key={swatchId}>
                    <SwatchInput aria-label={label} name={swatchId} value={swatchId} />
                    <SwatchLabel id={swatchId} title={label}>
                      <SwatchVariant variantColor={hexColors[0]} />
                    </SwatchLabel>
                    <SwatchPreview variantColor={hexColors[0]} />
                  </Swatch>
                );
              })}
              <Swatch key="disabled">
                <SwatchInput disabled />
                <SwatchLabel title="disabled">
                  <SwatchVariant />
                </SwatchLabel>
              </Swatch>
            </Fragment>
          );
        }

        return null;
      })}
    </SwatchGroup>
  ),
};
