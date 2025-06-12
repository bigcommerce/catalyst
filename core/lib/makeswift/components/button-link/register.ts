import { MakeswiftComponentType } from '@makeswift/runtime';
import { Link, Select, Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MSButtonLink } from './client';

runtime.registerComponent(MSButtonLink, {
  type: MakeswiftComponentType.Button,
  label: 'Button',
  icon: 'button',
  props: {
    className: Style({ properties: [Style.Margin] }),
    link: Link({ label: 'Link' }),
    text: TextInput({ label: 'Button text', defaultValue: 'Button text' }),
    variant: Select({
      label: 'Color',
      options: [
        { value: 'primary', label: 'Primary' },
        { value: 'secondary', label: 'Secondary' },
        { value: 'tertiary', label: 'Tertiary' },
        { value: 'ghost', label: 'Ghost' },
      ],
      defaultValue: 'primary',
    }),
    size: Select({
      label: 'Size',
      options: [
        { value: 'x-small', label: 'X-small' },
        { value: 'small', label: 'Small' },
        { value: 'medium', label: 'Medium' },
        { value: 'large', label: 'Large' },
      ],
      defaultValue: 'medium',
    }),
    shape: Select({
      label: 'Shape',
      options: [
        { value: 'pill', label: 'Pill' },
        { value: 'rounded', label: 'Rounded' },
        { value: 'square', label: 'Rectangle' },
        { value: 'circle', label: 'Circle' },
      ],
      defaultValue: 'pill',
    }),
  },
});
