import { Image, Link, Select, Style, TextInput } from '@makeswift/runtime/controls';

import { Card, CardProps } from '@/vibes/soul/primitives/card';
import { runtime } from '~/lib/makeswift/runtime';

type MSCardProps = Omit<CardProps, 'href' | 'image'> & {
  link?: { href?: string; target?: string };
  imageSrc?: string;
  imageAlt: string;
};

runtime.registerComponent(
  function MSCard({ link, imageSrc, imageAlt, ...props }: MSCardProps) {
    return (
      <Card
        {...props}
        href={link?.href ?? ''}
        image={imageSrc ? { src: imageSrc, alt: imageAlt } : undefined}
      />
    );
  },
  {
    type: 'primitive-card',
    label: 'Primitives / Card',
    icon: 'layout',
    props: {
      className: Style(),
      title: TextInput({ label: 'Title', defaultValue: 'Card' }),
      imageSrc: Image({ label: 'Image' }),
      imageAlt: TextInput({ label: 'Image Alt', defaultValue: 'Card image' }),
      link: Link({ label: 'Link' }),
      textContrast: Select({
        label: 'Contrast',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ],
        defaultValue: 'dark',
      }),
    },
  },
);
