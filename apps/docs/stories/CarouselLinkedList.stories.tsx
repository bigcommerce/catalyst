import { Button } from '@bigcommerce/reactant/Button';
import { CarouselLinkedList, CarouselLinkedListItem } from '@bigcommerce/reactant/Carousel';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof CarouselLinkedList> = {
  component: CarouselLinkedList,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof CarouselLinkedList>;

export const OneSlide: Story = {
  render: () => (
    <CarouselLinkedList>
      <CarouselLinkedListItem className="flex flex-col justify-center bg-gray-100 p-12 duration-700">
        <h1 className="text-h1">25% Off Sale</h1>
        <p className="max-w-[548px] pt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam.
        </p>
        <Button asChild className="mt-10 w-[141px]">
          <a href="/#">Shop now</a>
        </Button>
      </CarouselLinkedListItem>
    </CarouselLinkedList>
  ),
};

export const TwoSlides: Story = {
  render: () => (
    <div>
      <CarouselLinkedList>
        <CarouselLinkedListItem className="flex flex-col justify-center bg-gray-100 p-12 duration-700">
          <h1 className="text-h1">25% Off Sale</h1>
          <p className="max-w-[548px] pt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
          </p>
          <Button asChild className="mt-10 w-[141px]">
            <a href="/#">Shop now</a>
          </Button>
        </CarouselLinkedListItem>
        <CarouselLinkedListItem className="flex flex-col justify-center bg-gray-100 p-12 duration-700">
          <h1 className="text-h1">Great Deals</h1>
          <p className="max-w-[548px] pt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
          </p>
          <Button asChild className="mt-10 w-[141px]">
            <a href="/#">Shop now</a>
          </Button>
        </CarouselLinkedListItem>
      </CarouselLinkedList>
    </div>
  ),
};

export const ThreeSlides: Story = {
  render: () => (
    <div>
      <CarouselLinkedList>
        <CarouselLinkedListItem className="flex flex-col justify-center bg-gray-100 p-12 duration-700">
          <h1 className="text-h1">25% Off Sale</h1>
          <p className="max-w-[548px] pt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
          </p>
          <Button asChild className="mt-10 w-[141px]">
            <a href="/#">Shop now</a>
          </Button>
        </CarouselLinkedListItem>
        <CarouselLinkedListItem className="flex flex-col justify-center bg-gray-100 p-12 duration-700">
          <h1 className="text-h1">Great Deals</h1>
          <p className="max-w-[548px] pt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
          </p>
          <Button asChild className="mt-10 w-[141px]">
            <a href="/#">Shop now</a>
          </Button>
        </CarouselLinkedListItem>
        <CarouselLinkedListItem className="flex flex-col justify-center bg-gray-100 p-12 duration-700">
          <h1 className="text-h1">Low Prices</h1>
          <p className="max-w-[548px] pt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
          </p>
          <Button asChild className="mt-10 w-[141px]">
            <a href="/#">Shop now</a>
          </Button>
        </CarouselLinkedListItem>
      </CarouselLinkedList>
    </div>
  ),
};

const mocked = new Array(100).fill(undefined).map((_, index) => index);

export const OneHundredSlides: Story = {
  render: () => (
    <div>
      <CarouselLinkedList>
        {mocked.map((item) => (
          <CarouselLinkedListItem
            className="flex flex-col justify-center bg-gray-100 p-12 duration-700"
            key={item}
          >
            <h1 className="text-h1">{item + 1}% Off Sale</h1>
            <p className="max-w-[548px] pt-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
            </p>
            <Button asChild className="mt-10 w-[141px]">
              <a href="/#">Shop now</a>
            </Button>
          </CarouselLinkedListItem>
        ))}
      </CarouselLinkedList>
    </div>
  ),
};
