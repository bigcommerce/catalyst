import {
  Image,
  Link,
  List,
  Number,
  Shape,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import { Slideshow } from '@/vibes/soul/sections/slideshow';
import { runtime } from '~/lib/makeswift/runtime';

interface Slide {
  title?: string;
  description?: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
  label: string;
}

interface MSAccordionsProps {
  className: string;
  slides: Slide[];
  interval: number;
}

runtime.registerComponent(
  function MSSlideshow({ className, slides, interval }: MSAccordionsProps) {
    return (
      <Slideshow
        className={className}
        interval={interval * 1000}
        slides={slides.map(({ title, description, imageSrc, imageAlt, link, label }) => {
          return {
            title: title ?? '',
            description: description ?? '',
            image: { alt: imageAlt ?? '', src: imageSrc ?? '' },
            cta: { label, href: link?.href ?? '' },
          };
        })}
      />
    );
  },
  {
    type: 'section-slideshow',
    label: 'Sections / Slideshow',
    icon: 'carousel',
    props: {
      className: Style(),
      slides: List({
        label: 'Slides',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: 'Slide title' }),
            description: TextArea({ label: 'Description', defaultValue: 'Slide description' }),
            imageSrc: Image(),
            imageAlt: TextInput({ label: 'Image alt', defaultValue: 'Slide image' }),
            link: Link({ label: 'Link' }),
            label: TextInput({ label: 'CTA label', defaultValue: 'Learn more' }),
          },
        }),
        getItemLabel(slide) {
          return slide?.title || 'Slide title';
        },
      }),
      interval: Number({ label: 'Duration', defaultValue: 5, suffix: 's' }),
    },
  },
);
