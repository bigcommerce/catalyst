import { Checkbox, Combobox, Group, Select, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { searchProducts } from '../../utils/search-products';

import { MakeswiftProductCard } from './client';

runtime.registerComponent(MakeswiftProductCard, {
  type: 'catalog-product-card',
  label: 'Catalog / Product Card',
  props: {
    className: Style(),
    entityId: Combobox({
      label: 'Product',
      async getOptions(query) {
        const products = await searchProducts(query);

        return products.map((product) => ({
          id: product.entityId.toString(),
          label: product.name,
          value: product.entityId.toString(),
        }));
      },
    }),
    aspectRatio: Select({
      label: 'Image aspect ratio',
      options: [
        { value: '1:1', label: 'Square' },
        { value: '5:6', label: '5:6' },
        { value: '3:4', label: '3:4' },
      ],
      defaultValue: '5:6',
    }),
    colorScheme: Select({
      label: 'Color scheme',
      options: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
      ],
      defaultValue: 'light',
    }),
    badge: Group({
      label: 'Badge',
      props: {
        show: Checkbox({ label: 'Show badge', defaultValue: true }),
        text: TextInput({ label: 'Badge text', defaultValue: 'New' }),
      },
    }),
    showCompare: Checkbox({ label: 'Show compare', defaultValue: true }),
  },
});
