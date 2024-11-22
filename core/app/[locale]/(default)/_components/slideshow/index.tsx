import { Slideshow as SlideshowSection } from '~/vibes/soul/sections/slideshow';

import SlideBg01 from './slide-bg-01.jpg';
import SlideBg02 from './slide-bg-02.jpg';
import SlideBg03 from './slide-bg-03.jpg';

const slides = [
  {
    title: 'Fresh finds for every occasion',
    image: {
      src: SlideBg01.src,
      alt: 'alt',
      blurDataUrl: SlideBg01.blurDataURL,
    },
    description:
      'Explore our latest arrivals, curated to bring you style, functionality, and inspiration. Shop now and discover your next favorite.',
    cta: {
      href: '/shop-all',
      label: 'Shop Now',
    },
  },
  {
    title: "Discover what's new",
    image: {
      src: SlideBg02.src,
      alt: 'alt',
      blurDataUrl: SlideBg02.blurDataURL,
    },
    description: 'Shop our latest arrivals and find something fresh and exciting for your home.',
    cta: {
      href: '/shop-all',
      label: 'Shop Now',
    },
  },
  {
    title: 'Something for everyone',
    image: {
      src: SlideBg03.src,
      alt: 'alt',
      blurDataUrl: SlideBg03.blurDataURL,
    },
    description:
      'Don’t miss out on exclusive offers across our best-selling products. Shop today and save big on the items you love.',
    cta: {
      href: '/shop-all',
      label: 'Shop Now',
    },
  },
];

export function Slideshow() {
  return <SlideshowSection slides={slides} />;
}
