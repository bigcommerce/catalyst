import Image from 'next/image';

import { Button } from '~/components/ui/button';
import { Slideshow } from '~/components/ui/slideshow';

import SlideshowBG from './slideshow-bg-01.jpg';

const slides = [
  <div className="relative" key={1}>
    <Image
      alt="An assortment of brandless products against a blank background"
      blurDataURL="data:image/jpeg;base64,/9j/4QC8RXhpZgAASUkqAAgAAAAGABIBAwABAAAAAQAAABoBBQABAAAAVgAAABsBBQABAAAAXgAAACgBAwABAAAAAgAAABMCAwABAAAAAQAAAGmHBAABAAAAZgAAAAAAAABIAAAAAQAAAEgAAAABAAAABgAAkAcABAAAADAyMTABkQcABAAAAAECAwAAoAcABAAAADAxMDABoAMAAQAAAP//AAACoAQAAQAAAAoAAAADoAQAAQAAAAcAAAAAAAAA/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8AAEQgABwAKAwERAAIRAQMRAf/EABUAAQEAAAAAAAAAAAAAAAAAAAMJ/8QAIBAAAQQBBAMAAAAAAAAAAAAAAQIDBAURABIhMQYjgf/EABYBAQEBAAAAAAAAAAAAAAAAAAEAAv/EABkRAAIDAQAAAAAAAAAAAAAAAAARAQIhQf/aAAwDAQACEQMRAD8AoZ5EzayKWW3Syo0GyKPTJlsF9ts9klsKTu46GQOfms2awJfAKywmt1sRNgqK7PS0gSHI4WltTmBuKQckJJzgE9aYa0tP/9k="
      className="absolute -z-10 object-cover"
      fill
      placeholder="blur"
      priority
      sizes="(max-width: 1536px) 100vw, 1536px"
      src={SlideshowBG}
    />
    <div className="flex flex-col gap-4 px-12 pb-48 pt-36">
      <h2 className="text-5xl font-black lg:text-6xl">25% Off Sale</h2>
      <p className="max-w-xl">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
        labore et dolore magna aliqua. Ut enim ad minim veniam.
      </p>
      <Button asChild className="w-fit">
        <a href="/#">Shop now</a>
      </Button>
    </div>
  </div>,
  <div className="flex flex-col gap-4 bg-gray-100 px-12 pb-48 pt-36" key={2}>
    <h2 className="text-5xl font-black lg:text-6xl">Great Deals</h2>
    <p className="max-w-xl">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam.
    </p>
    <Button asChild className="w-fit">
      <a href="/#">Shop now</a>
    </Button>
  </div>,
  <div className="flex flex-col gap-4 bg-gray-100 px-12 pb-48 pt-36" key={3}>
    <h2 className="text-5xl font-black lg:text-6xl">Low Prices</h2>
    <p className="max-w-xl">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
      labore et dolore magna aliqua. Ut enim ad minim veniam.
    </p>
    <Button asChild className="w-fit">
      <a href="/#">Shop now</a>
    </Button>
  </div>,
];

export const Hero = () => <Slideshow slides={slides} />;
