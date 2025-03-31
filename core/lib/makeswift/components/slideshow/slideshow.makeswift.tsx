import {
  Checkbox,
  Group,
  Image,
  Link,
  List,
  Number,
  Select,
  Style,
  TextArea,
  TextInput,
} from '@makeswift/runtime/controls';

import { Slideshow } from '@/vibes/soul/sections/slideshow';
import { runtime } from '~/lib/makeswift/runtime';

interface Slide {
  title: string;
  description: string;
  showDescription: boolean;
  imageSrc?: string;
  imageAlt: string;
  showButton: boolean;
  buttonLink?: { href?: string; target?: string };
  buttonText: string;
  buttonColor: 'primary' | 'secondary' | 'tertiary' | 'ghost';
}

interface MSAccordionsProps {
  className: string;
  slides: Slide[];
  autoplay: boolean;
  interval: number;
}

runtime.registerComponent(
  function MSSlideshow({ className, slides, autoplay, interval }: MSAccordionsProps) {
    return (
      <Slideshow
        className={className}
        interval={interval * 1000}
        playOnInit={autoplay}
        slides={slides.map(
          ({
            title,
            description,
            showDescription,
            imageSrc,
            imageAlt,
            showButton,
            buttonLink,
            buttonText,
            buttonColor,
          }) => {
            return {
              title,
              description,
              showDescription,
              image: imageSrc ? { alt: imageAlt, src: imageSrc } : undefined,
              showCta: showButton,
              cta: { label: buttonText, href: buttonLink?.href ?? '#', variant: buttonColor },
            };
          },
        )}
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
        type: Group({
          props: {
            title: TextInput({ label: 'Title', defaultValue: 'Slide title' }),
            showDescription: Checkbox({ label: 'Show description', defaultValue: true }),
            description: TextArea({ label: 'Description', defaultValue: 'Slide description' }),
            imageSrc: Image(),
            imageAlt: TextInput({ label: 'Image alt', defaultValue: 'Slide image' }),
            showButton: Checkbox({ label: 'Show button', defaultValue: true }),
            buttonText: TextInput({ label: 'Button text', defaultValue: 'Shop all' }),
            buttonLink: Link({ label: 'Button link' }),
            buttonColor: Select({
              label: 'Button color',
              options: [
                { value: 'primary', label: 'Primary' },
                { value: 'secondary', label: 'Secondary' },
                { value: 'tertiary', label: 'Tertiary' },
                { value: 'ghost', label: 'Ghost' },
              ],
              defaultValue: 'primary',
            }),
          },
        }),
        getItemLabel(slide) {
          return slide?.title || 'Slide title';
        },
      }),
      autoplay: Checkbox({ label: 'Autoplay', defaultValue: true }),
      interval: Number({ label: 'Duration', defaultValue: 5, suffix: 's' }),
    },
  },
);
