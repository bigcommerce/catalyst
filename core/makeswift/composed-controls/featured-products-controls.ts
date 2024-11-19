import { Checkbox, Link, Number, Style, TextArea, TextInput } from '@makeswift/runtime/controls';

export function featuredProductsControls() {
  return {
    className: Style(),
    limit: Number({ label: 'Products shown', defaultValue: 9 }),
    title: TextInput({ label: 'Title', defaultValue: 'Featured Products' }),
    description: TextArea({
      label: 'Description',
      defaultValue: 'Explore our top picks in this featured collection.',
    }),
    showButton: Checkbox({ label: 'Show button', defaultValue: true }),
    buttonText: TextInput({ label: 'Button text', defaultValue: 'Shop' }),
    buttonHref: Link({ label: 'Button link' }),
  };
}
