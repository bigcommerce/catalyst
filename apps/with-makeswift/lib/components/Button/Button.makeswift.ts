import { MakeswiftComponentType } from '@makeswift/runtime/components';
import { Link, Select, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from 'lib/runtime';

import { LinkButton } from '../Button';

// @ts-ignore
runtime.registerComponent(LinkButton, {
  type: MakeswiftComponentType.Button,
  label: 'Button',
  props: {
    children: TextInput({ label: 'Text', defaultValue: 'Button text', selectAll: true }),
    link: Link({ label: 'Link' }),
    variant: Select({
      label: 'Variant',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'subtle', label: 'Subtle' },
      ],
      defaultValue: 'primary',
    }),
    icon: Select({
      label: 'Icon',
      options: [
        { value: 'none', label: 'No icon' },
        { value: 'filter', label: 'Filter' },
        { value: 'gift', label: 'Gift' },
        { value: 'heart', label: 'Heart' },
        { value: 'scale', label: 'Scale' },
        { value: 'search', label: 'Search' },
        { value: 'shopping-cart', label: 'Shopping cart' },
        { value: 'user', label: 'User' },
      ],
      defaultValue: 'none',
    }),
    className: Style({ properties: [Style.Margin] }),
  },
});
