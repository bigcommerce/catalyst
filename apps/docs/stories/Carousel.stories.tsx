import { Button } from '@bigcommerce/reactant/Button';
import { Carousel, CarouselItem } from '@bigcommerce/reactant/Carousel';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Carousel> = {
  component: Carousel,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Carousel>;

export const OneSlide: Story = {
  render: () => (
    <Carousel>
      <CarouselItem className="duration-700">
        <div className="relative h-full">
          <img
            alt="A plant in a glass vase against a blank background."
            className="absolute -z-10"
            src="/carousel-bg-01.jpg"
          />
          <div className="flex h-full flex-col justify-center p-12">
            <h1 className="text-h1">25% Off Sale</h1>
            <p className="max-w-[548px] pt-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
            </p>
            <Button asChild className="mt-10 w-[141px]">
              <a href="/#">Shop now</a>
            </Button>
          </div>
        </div>
      </CarouselItem>
    </Carousel>
  ),
};

export const TwoSlides: Story = {
  render: () => (
    <Carousel>
      <CarouselItem className="duration-700">
        <div className="relative h-full">
          <img
            alt="A plant in a glass vase against a blank background."
            className="absolute -z-10"
            src="/carousel-bg-01.jpg"
          />
          <div className="flex h-full flex-col justify-center p-12">
            <h1 className="text-h1">25% Off Sale</h1>
            <p className="max-w-[548px] pt-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
            </p>
            <Button asChild className="mt-10 w-[141px]">
              <a href="/#">Shop now</a>
            </Button>
          </div>
        </div>
      </CarouselItem>
      <CarouselItem className="flex flex-col justify-center bg-gray-100 p-12 duration-700">
        <h1 className="text-h1">Great Deals</h1>
        <p className="max-w-[548px] pt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam.
        </p>
        <Button asChild className="mt-10 w-[141px]">
          <a href="/#">Shop now</a>
        </Button>
      </CarouselItem>
    </Carousel>
  ),
};

export const ThreeSlides: Story = {
  render: () => (
    <Carousel>
      <CarouselItem className="duration-700">
        <div className="relative h-full">
          <img
            alt="A plant in a glass vase against a blank background."
            className="absolute -z-10"
            src="/carousel-bg-01.jpg"
          />
          <div className="flex h-full flex-col justify-center p-12">
            <h1 className="text-h1">25% Off Sale</h1>
            <p className="max-w-[548px] pt-4">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
            </p>
            <Button asChild className="mt-10 w-[141px]">
              <a href="/#">Shop now</a>
            </Button>
          </div>
        </div>
      </CarouselItem>
      <CarouselItem className="flex flex-col justify-center bg-gray-100 p-12 duration-700">
        <h1 className="text-h1">Great Deals</h1>
        <p className="max-w-[548px] pt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam.
        </p>
        <Button asChild className="mt-10 w-[141px]">
          <a href="/#">Shop now</a>
        </Button>
      </CarouselItem>
      <CarouselItem className="flex flex-col justify-center bg-gray-100 p-12 duration-700">
        <h1 className="text-h1">Low Prices</h1>
        <p className="max-w-[548px] pt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam.
        </p>
        <Button asChild className="mt-10 w-[141px]">
          <a href="/#">Shop now</a>
        </Button>
      </CarouselItem>
    </Carousel>
  ),
};

const mocked = new Array(100).fill(undefined).map((_, index) => index);

export const OneHundredSlides: Story = {
  render: () => (
    <Carousel>
      {mocked.map((i) => (
        <CarouselItem className="duration-700" key={i}>
          <div className="relative h-full">
            <img
              alt="A plant in a glass vase against a blank background."
              className="absolute -z-10"
              src="/carousel-bg-01.jpg"
            />
            <div className="flex h-full flex-col justify-center p-12">
              <h1 className="text-h1">{i + 1}% Off Sale</h1>
              <p className="max-w-[548px] pt-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
              </p>
              <Button asChild className="mt-10 w-[141px]">
                <a href="/#">Shop now</a>
              </Button>
            </div>
          </div>
        </CarouselItem>
      ))}
    </Carousel>
  ),
};
