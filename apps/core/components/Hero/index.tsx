import { Button } from '@bigcommerce/reactant/Button';
import { Slideshow, SlideshowContent, SlideshowSlide } from '@bigcommerce/reactant/Slideshow';
import Image from 'next/image';

export const Hero = () => (
  <Slideshow>
    <SlideshowContent interval={10_000}>
      <SlideshowSlide className="duration-700">
        <div className="absolute -z-10 h-full w-full">
          <Image
            alt="an assortment of brandless products against a blank background"
            className="object-cover"
            fill
            priority
            src="/slideshow-bg-01.jpg"
          />
        </div>
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
      </SlideshowSlide>
      <SlideshowSlide className="flex flex-col justify-center bg-gray-100 p-12 duration-700">
        <h1 className="text-h1">Great Deals</h1>
        <p className="max-w-[548px] pt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam.
        </p>
        <Button asChild className="mt-10 w-[141px]">
          <a href="/#">Shop now</a>
        </Button>
      </SlideshowSlide>
      <SlideshowSlide className="flex flex-col justify-center bg-gray-100 p-12 duration-700">
        <h1 className="text-h1">Low Prices</h1>
        <p className="max-w-[548px] pt-4">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Ut enim ad minim veniam.
        </p>
        <Button asChild className="mt-10 w-[141px]">
          <a href="/#">Shop now</a>
        </Button>
      </SlideshowSlide>
    </SlideshowContent>
  </Slideshow>
);
