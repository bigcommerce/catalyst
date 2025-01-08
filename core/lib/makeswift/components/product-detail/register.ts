import { List, Select, Shape, Slot, TextArea, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { DescriptionSource, MakeswiftProductDetail } from './client';

export const COMPONENT_TYPE = 'catalyst-makeswift-product-detail-description';

const description = Shape({
  label: 'Description',
  type: {
    source: Select({
      label: 'Source',
      options: [
        { label: 'Catalog (plain text)', value: DescriptionSource.CatalogPlainText },
        { label: 'Catalog (rich text)', value: DescriptionSource.CatalogRichText },
        { label: 'Custom', value: DescriptionSource.Custom },
      ],
      defaultValue: DescriptionSource.CatalogRichText,
    }),
    slot: Slot(),
  },
});

runtime.registerComponent(MakeswiftProductDetail, {
  type: COMPONENT_TYPE,
  label: 'MakeswiftProductDetail (private)',
  hidden: true,
  props: {
    summaryText: TextArea({
      label: 'Summary',
    }),
    description,
    accordions: List({
      label: 'Product info',
      type: Shape({
        label: 'Product info section',
        type: {
          title: TextInput({ label: 'Title', defaultValue: 'Section' }),
          content: Slot(),
        },
      }),
      getItemLabel: (section) => section?.title || 'Section',
    }),
  },
});
