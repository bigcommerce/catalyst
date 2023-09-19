import {
  SlideshowEmbla,
  SlideshowEmblaContent,
  SlideshowEmblaSlide,
} from '@bigcommerce/reactant/SlideshowEmbla';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof SlideshowEmbla> = {
  component: SlideshowEmbla,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof SlideshowEmbla>;

export const Basic: Story = {
  render: () => (
    <SlideshowEmbla>
      <SlideshowEmblaContent>
        <SlideshowEmblaSlide>Slide 1</SlideshowEmblaSlide>
        <SlideshowEmblaSlide>Slide 2</SlideshowEmblaSlide>
        <SlideshowEmblaSlide>Slide 3</SlideshowEmblaSlide>
      </SlideshowEmblaContent>
    </SlideshowEmbla>
  ),
};
