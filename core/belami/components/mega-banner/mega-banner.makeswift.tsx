import { Image, Link, List, Select, Shape, TextInput } from '@makeswift/runtime/controls';

import { MegaBanner } from '.';
import { MegaBannerProps } from './mega-banner-types';
import { runtime } from '~/lib/makeswift/runtime';

runtime.registerComponent(
  function MSMegaBanner({ items }: MegaBannerProps) {
    return (
      <MegaBanner
        items={items}
      />
    );
  },
  {
    type: 'belami-mega-banner',
    label: 'Belami / Mega Banner',
    icon: 'image',
    props: {
      items: List({
        label: 'Items',
        type: Shape({
          type: {
            title: TextInput({ label: 'Title', defaultValue: 'Text' }),
            link: Link({ label: 'Link' }),
          },
        }),
        getItemLabel(menuItem) {
          return menuItem?.title || 'Banner item';
        },
      }),
    },
  },
);
