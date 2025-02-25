import { Image, Link, List, Select, RichText, Group, TextInput } from '@makeswift/runtime/controls';

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
        type: Group({
          label: "Banner properties",
          preferredLayout: Group.Layout.Popover,
          props: {
            title: TextInput({ label: 'Title', defaultValue: 'Title' }),
            location: Select({
              label: "Location",
              labelOrientation: "horizontal",
              options: [
                { value: "top", label: "Top Line (Global)" },
                { value: "under-header", label: "Under Header (Global)" },
                { value: "under-gallery", label: "Under Gallery (PDP)" },
                { value: "above-products", label: "Above Products (PLP/SLP/Brand)" },
                { value: "before-footer", label: "Before Footer (Global)" },
              ],
              defaultValue: "default",
            }),
            link: Link({ label: 'Link' }),
            content: RichText({ mode: RichText.Mode.Block }),
            startDate: TextInput({ label: 'Start Date', defaultValue: '' }),
            endDate: TextInput({ label: 'End Date', defaultValue: '' }),

            brandIds: TextInput({ label: 'Brand Ids', defaultValue: '' }),
            categoryIds: TextInput({ label: 'Category Ids', defaultValue: '' }),
            productIds: TextInput({ label: 'Product Ids', defaultValue: '' }),

            excludeBrandIds: TextInput({ label: 'Exclude Brand Ids', defaultValue: '' }),
            excludeCategoryIds: TextInput({ label: 'Exclude Category Ids', defaultValue: '' }),
            excludeProductIds: TextInput({ label: 'Exclude Product Ids', defaultValue: '' }),
          },
        }),
        getItemLabel(menuItem) {
          return menuItem?.title || 'Banner item';
        },
      })
    },

  },
);
