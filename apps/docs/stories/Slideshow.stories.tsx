import { Button } from '@bigcommerce/reactant/Button';
import { Slideshow, SlideshowContent, SlideshowSlide } from '@bigcommerce/reactant/Slideshow';
import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta<typeof Slideshow> = {
  component: Slideshow,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Slideshow>;

export const OneSlide: Story = {
  render: () => (
    <Slideshow>
      <SlideshowContent>
        <SlideshowSlide className="duration-700">
          <div className="relative h-full">
            <img
              alt="A plant in a glass vase against a blank background."
              className="absolute -z-10"
              src="/slideshow-bg-01.jpg"
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
        </SlideshowSlide>
      </SlideshowContent>
    </Slideshow>
  ),
};

export const TwoSlides: Story = {
  render: () => (
    <Slideshow>
      <SlideshowContent>
        <SlideshowSlide className="duration-700">
          <div className="relative h-full">
            <img
              alt="A plant in a glass vase against a blank background."
              className="absolute -z-10"
              src="/slideshow-bg-01.jpg"
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
        </SlideshowSlide>
        <SlideshowSlide className="flex flex-col justify-center bg-gray-100 p-12 duration-700">
          <h1 className="text-h1">Great Deals</h1>
          <p className="max-w-[548px] pt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
          </p>
          <Button asChild className="mt-10 w-[141px]">
            <a href="/#">Shop now</a>
          </Button>
        </SlideshowSlide>
      </SlideshowContent>
    </Slideshow>
  ),
};

export const ThreeSlides: Story = {
  render: () => (
    <Slideshow>
      <SlideshowContent>
        <SlideshowSlide className="duration-700">
          <div className="relative h-full">
            <img
              alt="A plant in a glass vase against a blank background."
              className="absolute -z-10"
              src="/slideshow-bg-01.jpg"
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
        </SlideshowSlide>
        <SlideshowSlide className="flex flex-col justify-center bg-gray-100 p-12 duration-700">
          <h1 className="text-h1">Great Deals</h1>
          <p className="max-w-[548px] pt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
          </p>
          <Button asChild className="mt-10 w-[141px]">
            <a href="/#">Shop now</a>
          </Button>
        </SlideshowSlide>
        <SlideshowSlide className="flex flex-col justify-center bg-gray-100 p-12 duration-700">
          <h1 className="text-h1">Low Prices</h1>
          <p className="max-w-[548px] pt-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
          </p>
          <Button asChild className="mt-10 w-[141px]">
            <a href="/#">Shop now</a>
          </Button>
        </SlideshowSlide>
      </SlideshowContent>
    </Slideshow>
  ),
};

const mocked = new Array(100).fill(undefined).map((_, index) => index);

export const OneHundredSlides: Story = {
  render: () => (
    <Slideshow>
      <SlideshowContent>
        {mocked.map((i) => (
          <SlideshowSlide className="duration-700" key={i}>
            <div className="relative h-full">
              <img
                alt="A plant in a glass vase against a blank background."
                className="absolute -z-10"
                src="/slideshow-bg-01.jpg"
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
          </SlideshowSlide>
        ))}
      </SlideshowContent>
    </Slideshow>
  ),
};
