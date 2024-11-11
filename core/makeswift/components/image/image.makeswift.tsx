import { MakeswiftComponentType } from '@makeswift/runtime';
import {
  Checkbox,
  Image as ImageControl,
  Link as LinkControl,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';
import { ComponentPropsWithoutRef } from 'react';

import { BcImage as Image } from '~/components/bc-image';
import { Link } from '~/components/link';
import { runtime } from '~/lib/makeswift/runtime';

runtime.registerComponent(
  function MSImage({
    className,
    file,
    link,
    ...rest
  }: Omit<ComponentPropsWithoutRef<typeof Image>, 'src'> & {
    file?: { url: string; dimensions: { width: number; height: number } };
    link: { href: string; target?: string };
  }) {
    const image = file ? (
      <Image
        {...rest}
        className={className}
        height={file.dimensions.height}
        src={file.url}
        width={file.dimensions.width}
      />
    ) : (
      <Image
        {...rest}
        className={className}
        height={240}
        src="data:image/svg+xml,%3Csvg width='360' height='240' viewBox='0 0 360 240' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg clip-path='url(%23clip0)'%3E%3Cpath d='M0 0H360V240H0V0Z' fill='%23A1A8C2' fill-opacity='0.18'/%3E%3Cpath d='M260 59C260 78.33 244.33 94 225 94C205.67 94 190 78.33 190 59C190 39.67 205.67 24 225 24C244.33 24 260 39.67 260 59Z' fill='%23A1A8C2' fill-opacity='0.25'/%3E%3Cpath fill-rule='evenodd' clip-rule='evenodd' d='M319 250H417L291.485 124.485C286.799 119.799 279.201 119.799 274.515 124.485L234 165L319 250Z' fill='%23A1A8C2' fill-opacity='0.25'/%3E%3Cpath d='M311 250L-89 250L102.515 58.4853C107.201 53.799 114.799 53.799 119.485 58.4853L311 250Z' fill='%23A1A8C2' fill-opacity='0.25'/%3E%3C/g%3E%3Cdefs%3E%3CclipPath id='clip0'%3E%3Cpath d='M0 0H360V240H0V0Z' fill='white'/%3E%3C/clipPath%3E%3C/defs%3E%3C/svg%3E%0A"
        width={360}
      />
    );

    return link.href === '#' ? (
      image
    ) : (
      <Link className={className} href={link.href} target={link.target}>
        {image}
      </Link>
    );
  },
  {
    type: MakeswiftComponentType.Image,
    label: 'Image',
    props: {
      className: Style({
        properties: [Style.Width, Style.Margin, Style.Border, Style.BorderRadius],
      }),
      file: ImageControl({
        format: ImageControl.Format.WithDimensions,
      }),
      alt: TextInput({
        label: 'Alt text',
        defaultValue: 'A caption about your image',
      }),
      link: LinkControl(),
      priority: Checkbox({
        label: 'Priority',
        defaultValue: true,
      }),
    },
  },
);
