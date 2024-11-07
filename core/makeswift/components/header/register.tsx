import { Checkbox, Image, Link, List, Shape, Slot, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftHeader } from './client';

export const COMPONENT_TYPE = 'catalyst-makeswift-header';

runtime.registerComponent(MakeswiftHeader, {
  type: COMPONENT_TYPE,
  label: 'MakeswiftHeader (private)',
  hidden: true,
  props: {
    showBanner: Checkbox({ label: 'Show banner', defaultValue: false }),
    banner: Slot(),
    links: List({
      label: 'Additional links',
      type: Shape({
        type: {
          label: TextInput({ label: 'Label', defaultValue: 'Link' }),
          link: Link({ label: 'URL' }),
        },
      }),
      getItemLabel: (item) => item?.label ?? 'Link',
    }),
    logo: Image({ label: 'Logo' }),
    searchInputPlaceholder: TextInput({ label: 'Search input placeholder' }),
    searchCtaLabel: TextInput({ label: 'Search CTA label' }),
    emptySearchTitleLabel: TextInput({ label: 'Empty search title label' }),
    emptySearchSubtitleLabel: TextInput({ label: 'Empty search subtitle label' }),
  },
});
