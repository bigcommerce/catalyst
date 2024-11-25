import { Select, Slot } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { DescriptionType, MakeswiftProductDetail } from './client';

export const COMPONENT_TYPE = 'catalyst-makeswift-product-detail-description';

runtime.registerComponent(MakeswiftProductDetail, {
  type: COMPONENT_TYPE,
  label: 'MakeswiftProductDetail (private)',
  hidden: true,
  props: {
    descriptionType: Select({
      label: 'Description',
      options: [
        { label: 'Catalog (plain text)', value: DescriptionType.PlainText },
        { label: 'Catalog (rich text)', value: DescriptionType.RichText },
        { label: 'Custom', value: DescriptionType.Custom },
      ],
      defaultValue: DescriptionType.PlainText,
    }),
    slot: Slot(),
  },
});
