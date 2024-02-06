import { Button } from '@bigcommerce/components/Button';
import {
  Slideshow,
  SlideshowAutoplayControl,
  SlideshowContent,
  SlideshowControls,
  SlideshowNextIndicator,
  SlideshowPagination,
  SlideshowPreviousIndicator,
  SlideshowSlide,
} from '@bigcommerce/components/Slideshow';
import type { Meta, StoryObj } from '@storybook/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const meta: Meta<typeof Slideshow> = {
  component: Slideshow,
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj<typeof Slideshow>;

export const MultipleSlides: Story = {
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
            <div className="flex flex-col gap-4 px-12 pb-48 pt-36">
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
          <div className="flex flex-col gap-4 bg-gray-100 px-12 pb-48 pt-36">
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
          <div className="flex flex-col gap-4 bg-gray-100 px-12 pb-48 pt-36">
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

      <SlideshowControls>
        <SlideshowAutoplayControl />
        <SlideshowPreviousIndicator />
        <SlideshowPagination />
        <SlideshowNextIndicator />
      </SlideshowControls>
    </Slideshow>
  ),
};

export const SingleSlide: Story = {
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
            <div className="flex flex-col gap-4 px-12 pb-48 pt-36">
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

      <SlideshowControls>
        <SlideshowAutoplayControl />
        <SlideshowPreviousIndicator />
        <SlideshowPagination />
        <SlideshowNextIndicator />
      </SlideshowControls>
    </Slideshow>
  ),
};

export const CustomControlsAndInterval: Story = {
  render: () => (
    <Slideshow interval={5_000}>
      <SlideshowContent>
        <SlideshowSlide>
          <div className="relative">
            <img
              alt="A plant in a glass vase against a blank background."
              className="absolute -z-10"
              src="/slideshow-bg-01.jpg"
            />
            <div className="flex flex-col gap-4 px-12 pb-48 pt-36">
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
          <div className="flex flex-col gap-4 bg-gray-100 px-12 pb-48 pt-36">
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

      <SlideshowControls>
        <SlideshowAutoplayControl className="font-semibold">
          {({ isPaused }) => (isPaused ? 'Play' : 'Pause')}
        </SlideshowAutoplayControl>
        <SlideshowPreviousIndicator>
          <ChevronLeft />
        </SlideshowPreviousIndicator>
        <SlideshowPagination>
          {({ activeSlide, totalSlides }) => (
            <>
              {activeSlide}/{totalSlides}
            </>
          )}
        </SlideshowPagination>
        <SlideshowNextIndicator>
          <ChevronRight />
        </SlideshowNextIndicator>
      </SlideshowControls>
    </Slideshow>
  ),
};
