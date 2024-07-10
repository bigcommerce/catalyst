import { List, Number, Shape, Style, TextInput } from '@makeswift/runtime/controls';
import { StaticImageData } from 'next/image';

import { runtime } from '~/lib/makeswift/runtime';

import { Slideshow } from './slideshow';

interface Link {
  label: string;
  href: string;
}

interface Image {
  alt: string;
  blurDataUrl?: string;
  src: string | StaticImageData;
}

interface Slide {
  cta?: Link;
  description?: string;
  image?: Image;
  title: string;
}

interface Props {
  className?: string;
  interval?: number;
  slides: Slide[];
}

runtime.registerComponent(
  function MakeswiftSlideshow({ slides, interval, className }: Props) {
    return (
      <Slideshow
        className={className}
        interval={interval}
        slides={slides.map((slide) => ({
          cta: slide.cta ? { label: slide.cta.label, href: slide.cta.href } : undefined,
          description: slide.description,
          image: slide.image
            ? {
                altText: slide.image.alt,
                blurDataUrl: slide.image.blurDataUrl,
                src: slide.image.src,
              }
            : undefined,
          title: slide.title,
        }))}
      />
    );
  },
  {
    type: 'catalyst-slideshow',
    label: 'Catalyst / Slideshow',
    props: {
      className: Style(),
      interval: Number({ label: 'Interval' }),
      slides: List({
        label: 'Slides',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: 'Great Deals' }),
            description: TextInput({
              label: 'Description',
              defaultValue:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.',
            }),
            cta: Shape({
              type: {
                label: TextInput({ label: 'Label', defaultValue: 'Shop now' }),
                href: TextInput({ label: 'Href', defaultValue: '/#' }),
              },
            }),
          },
        }),
        getItemLabel(item) {
          return item?.title ?? 'Slide';
        },
      }),
    },
  },
);
