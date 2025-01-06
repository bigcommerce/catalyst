import { runtime } from '~/lib/makeswift/runtime';
import { Discount } from '.';
import { List, Shape, TextInput } from '@makeswift/runtime/controls';

export const COMPONENT_TYPE = 'catalyst-makeswift-discount';

runtime.registerComponent(Discount, {
  type: COMPONENT_TYPE,
  label: 'Basic / Discount',
  props: {
    ctaLabel: TextInput({ label: 'CTA Label' }),
    discounts: List({
      label: 'Discounts',
      type: Shape({
        type: {
          label: TextInput({ label: 'Label', defaultValue: 'Link' }),
          code: TextInput({ label: 'Label', defaultValue: 'Link' }),
        },
      }),
    }),
  },
});
