import { Image, Link as MSLink, Select, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { FeaturedImage } from '.';

type MSFeaturedImageProps = {
  className: string;
  title: string;
  description: string;
  imageSrc?: string;
  imageAlt: string;
  link: { href?: string; target?: string };
  label: string;
  mediaAlign?: 'left' | 'right' | 'full';
};

runtime.registerComponent(
  function MSFeaturedImage({
    className,
    title,
    description,
    imageSrc,
    imageAlt,
    link,
    label,
    mediaAlign,
  }: MSFeaturedImageProps) {
    return (
      <div className={className}>
        <FeaturedImage
          cta={{ href: link.href ?? '', label }}
          description={description}
          image={{ src: imageSrc ?? '', alt: imageAlt }}
          mediaAlign={mediaAlign}
          title={title}
        />
      </div>
    );
  },
  {
    type: 'section-featured-image',
    label: 'Sections / Featured Image',
    icon: 'image',
    props: {
      className: Style(),
      title: TextInput({ label: 'Title', defaultValue: 'Title' }),
      description: TextInput({ label: 'Description', defaultValue: 'Description' }),
      imageSrc: Image({ label: 'Image' }),
      imageAlt: TextInput({ label: 'Image Alt', defaultValue: 'Image' }),
      link: MSLink({ label: 'Link' }),
      label: TextInput({ label: 'Label', defaultValue: 'Label' }),
      mediaAlign: Select({
        options: [
          { value: 'left', label: 'Left' },
          { value: 'right', label: 'Right' },
          { value: 'full', label: 'Full' },
        ],
        defaultValue: 'left',
      }),
    },
  },
);
