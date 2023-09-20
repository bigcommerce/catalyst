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
        <SlideshowSlide>
          <div className="relative">
            <img
              alt="A plant in a glass vase against a blank background."
              className="absolute -z-10"
              src="/slideshow-bg-01.jpg"
            />
            <div className="flex flex-col gap-4 px-12 py-24">
              <h2 className="text-h1">25% Off Sale</h2>
              <p className="max-w-xl">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
              </p>
              <Button asChild className="w-fit">
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
        <SlideshowSlide>
          <div className="relative">
            <img
              alt="A plant in a glass vase against a blank background."
              className="absolute -z-10"
              src="/slideshow-bg-01.jpg"
            />
            <div className="flex flex-col gap-4 px-12 py-24">
              <h2 className="text-h1">25% Off Sale</h2>
              <p className="max-w-xl">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
              </p>
              <Button asChild className="w-fit">
                <a href="/#">Shop now</a>
              </Button>
            </div>
          </div>
        </SlideshowSlide>
        <SlideshowSlide>
          <div className="flex flex-col gap-4 bg-gray-100 px-12 py-24">
            <h2 className="text-h1">Great Deals</h2>
            <p className="max-w-xl">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
            </p>
            <Button asChild className="w-fit">
              <a href="/#">Shop now</a>
            </Button>
          </div>
        </SlideshowSlide>
      </SlideshowContent>
    </Slideshow>
  ),
};

export const ThreeSlides: Story = {
  render: () => (
    <Slideshow>
      <SlideshowContent>
        <SlideshowSlide>
          <div className="relative">
            <img
              alt="A plant in a glass vase against a blank background."
              className="absolute -z-10"
              src="/slideshow-bg-01.jpg"
            />
            <div className="flex flex-col gap-4 px-12 py-24">
              <h2 className="text-h1">25% Off Sale</h2>
              <p className="max-w-xl">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
              </p>
              <Button asChild className="w-fit">
                <a href="/#">Shop now</a>
              </Button>
            </div>
          </div>
        </SlideshowSlide>
        <SlideshowSlide>
          <div className="flex flex-col gap-4 bg-gray-100 px-12 py-24">
            <h2 className="text-h1">Great Deals</h2>
            <p className="max-w-xl">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
            </p>
            <Button asChild className="w-fit">
              <a href="/#">Shop now</a>
            </Button>
          </div>
        </SlideshowSlide>
        <SlideshowSlide>
          <div className="flex flex-col gap-4 bg-gray-100 px-12 py-24">
            <h2 className="text-h1">Low Prices</h2>
            <p className="max-w-xl">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
            </p>
            <Button asChild className="w-fit">
              <a href="/#">Shop now</a>
            </Button>
          </div>
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
          <SlideshowSlide key={i}>
            <div className="relative">
              <img
                alt="A plant in a glass vase against a blank background."
                className="absolute -z-10"
                src="/slideshow-bg-01.jpg"
              />
              <div className="flex flex-col gap-4 px-12 py-24">
                <h2 className="text-h1">{i + 1}% Off Sale</h2>
                <p className="max-w-xl">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
                </p>
                <Button asChild className="w-fit">
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
