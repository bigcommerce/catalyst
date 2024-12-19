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
    label: 'Basic / Card',
    icon: 'layout',
    props: {
      className: Style(),
      title: TextInput({ label: 'Title', defaultValue: 'Card' }),
      imageSrc: Image({ label: 'Image' }),
      imageAlt: TextInput({ label: 'Image alt', defaultValue: 'Card image' }),
      link: Link({ label: 'Link' }),
      aspectRatio: Select({
        label: 'Aspect ratio',
        options: [
          { value: '5:6', label: '5:6' },
          { value: '3:4', label: '3:4' },
          { value: '1:1', label: 'Square' },
        ],
        defaultValue: '5:6',
      }),
      textColorScheme: Select({
        label: 'Text color scheme',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ],
        defaultValue: 'light',
      }),
      iconColorScheme: Select({
        label: 'Icon color scheme',
        options: [
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ],
        defaultValue: 'light',
      }),
    },
  },
);
