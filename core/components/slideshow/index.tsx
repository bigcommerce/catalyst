import { useTranslations } from 'next-intl';

import { Slideshow as ComponentsSlideshow } from '@/vibes/soul/sections/slideshow';

import SlideshowBG1 from './slideshow-bg-01.jpg';
import SlideshowBG2 from './slideshow-bg-02.jpg';
import SlideshowBG3 from './slideshow-bg-03.jpg';

export const Slideshow = () => {
  const t = useTranslations('Home.Slides');
  const slides = [
    {
      cta: { label: t('Slide1.cta'), href: '/#' },
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
      image: {
        src: SlideshowBG1.src,
        alt: t('Slide1.altText'),
        blurDataUrl: SlideshowBG1.blurDataURL,
      },
      key: 1,
      title: t('Slide1.title'),
    },
    {
      cta: { label: t('Slide2.cta'), href: '/#' },
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
      key: 2,
      title: t('Slide2.title'),
      image: {
        src: SlideshowBG2.src,
        alt: t('Slide2.altText'),
        blurDataUrl: SlideshowBG2.blurDataURL,
      },
    },
    {
      cta: { label: t('Slide3.cta'), href: '/#' },
      description:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
      key: 3,
      title: t('Slide3.title'),
      image: {
        src: SlideshowBG3.src,
        alt: t('Slide3.altText'),
        blurDataUrl: SlideshowBG3.blurDataURL,
      },
    },
  ];

  return <ComponentsSlideshow slides={slides} />;
};
