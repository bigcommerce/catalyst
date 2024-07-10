import { List, Shape, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { Button } from '../button';

import { Slideshow } from './slideshow';

interface Slide {
  title: string;
  description: string;
  ctaText: string;
  ctaUrl: string;
}

interface Props {
  slides: Slide[];
  className?: string;
}

runtime.registerComponent(
  function MakeswiftSlideshow({ slides, className }: Props) {
    return (
      <Slideshow
        className={className}
        slides={slides.map(({ title, description, ctaText, ctaUrl }) => (
          <div className="flex flex-col gap-4 bg-gray-100 px-12 pb-48 pt-36" key={1}>
            <h2 className="text-5xl font-black lg:text-6xl">{title}</h2>
            <p className="max-w-xl">{description}</p>
            <Button asChild className="w-fit">
              <a href={ctaUrl}>{ctaText}</a>
            </Button>
          </div>
        ))}
      />
    );
  },
  {
    type: 'catalyst-slideshow',
    label: 'Catalyst / Slideshow',
    props: {
      className: Style(),
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
            ctaText: TextInput({ label: 'CTA Text', defaultValue: 'Shop now' }),
            ctaUrl: TextInput({ label: 'CTA URL', defaultValue: '/#' }),
          },
        }),
        getItemLabel(item) {
          return item?.title ?? 'Slide';
        },
      }),
    },
  },
);
