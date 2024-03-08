import { Rating } from '@bigcommerce/components/rating';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Rating> = {
  component: Rating,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Rating>;

export const FiveStarRating: Story = {
  args: {
    value: 5,
    className: 'text-primary',
  },
};

export const ZeroRating: Story = {
  args: {
    value: 0,
    className: 'text-primary',
  },
};

export const FloatRating: Story = {
  args: {
    size: 40,
    value: 3.3,
    className: 'text-gray-400',
  },
};
