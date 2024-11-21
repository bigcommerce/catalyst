import SlideshowBg01 from '~/components/homepage-slideshow/slideshow-bg-01.jpeg';
import SlideshowBg02 from '~/components/homepage-slideshow/slideshow-bg-02.jpeg';
import SlideshowBg03 from '~/components/homepage-slideshow/slideshow-bg-03.jpeg';
import { Slideshow } from '~/vibes/soul/sections/slideshow';

const homepageSlides = [
  {
    title: 'Plants delivered to your door',
    image: {
      src: SlideshowBg01.src,
      alt: 'alt',
      blurDataUrl: SlideshowBg01.blurDataURL,
    },
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    cta: {
      href: '/shop-all',
      label: 'Shop Now',
    },
  },
  {
    title: 'Grow',
    image: {
      src: SlideshowBg02.src,
      alt: 'alt',
      blurDataUrl: SlideshowBg02.blurDataURL,
    },
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    cta: {
      href: '/shop-all',
      label: 'Shop Now',
    },
  },
  {
    title: 'Thrive',
    image: {
      src: SlideshowBg03.src,
      alt: 'alt',
      blurDataUrl: SlideshowBg03.blurDataURL,
    },
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
    cta: {
      href: '/shop-all',
      label: 'Shop Now',
    },
  },
];

export function HomepageSlideshow() {
  return <Slideshow slides={homepageSlides} />;
}
