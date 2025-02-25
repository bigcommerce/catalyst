import { Image, Link, List, Select, RichText, TextArea, Group, TextInput } from '@makeswift/runtime/controls';

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
          label: "Banner Properties",
          preferredLayout: Group.Layout.Inline,
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
            imageSrc: Image({ label: 'Image' }),
            imageMobileSrc: Image({ label: 'Alt. Image (Mobile)' }),
            //imageAlt: TextInput({ label: 'Image alt', defaultValue: '' }),
            imageCss: TextInput({ label: 'Image CSS', defaultValue: '' }),
            link: Link({ label: 'Link' }),
            //content: RichText({ mode: RichText.Mode.Block }),
            content: TextArea({ label: "Content", defaultValue: '' }),
/*
            startDate: TextInput({ label: 'Start Date', defaultValue: '' }),
            endDate: TextInput({ label: 'End Date', defaultValue: '' }),

            brandIds: TextInput({ label: 'Brand Ids', defaultValue: '' }),
            categoryIds: TextInput({ label: 'Category Ids', defaultValue: '' }),
            productIds: TextInput({ label: 'Product Ids', defaultValue: '' }),

            excludeBrandIds: TextInput({ label: 'Exclude Brand Ids', defaultValue: '' }),
            excludeCategoryIds: TextInput({ label: 'Exclude Category Ids', defaultValue: '' }),
            excludeProductIds: TextInput({ label: 'Exclude Product Ids', defaultValue: '' }),
*/
            schedule: Group({
              label: "Schedule",
              preferredLayout: Group.Layout.Popover,
              props: {
                startDate: TextInput({ label: 'Start Date', defaultValue: '' }),
                endDate: TextInput({ label: 'End Date', defaultValue: '' }),
              },
            }),              
            conditions: Group({
              label: "Conditions",
              preferredLayout: Group.Layout.Popover,
              props: {
                brandNames: TextInput({ label: 'Brand Names', defaultValue: '' }),
                categoryNames: TextInput({ label: 'Category Names', defaultValue: '' }),
                productIds: TextInput({ label: 'Product Ids', defaultValue: '' }),
    
                excludeBrandNames: TextInput({ label: 'Exclude Brand Names', defaultValue: '' }),
                excludeCategoryNames: TextInput({ label: 'Exclude Category Names', defaultValue: '' }),
                excludeProductIds: TextInput({ label: 'Exclude Product Ids', defaultValue: '' }),
              },
            }),
          },
        }),
        getItemLabel(menuItem) {
          return menuItem?.title || 'Banner item';
        },
      })
    },

  },
);
