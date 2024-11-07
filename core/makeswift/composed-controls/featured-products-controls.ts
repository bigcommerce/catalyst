import { Checkbox, Number, Style, TextInput } from '@makeswift/runtime/controls';

export function featuredProductsControls() {
  return {
    className: Style(),
    limit: Number({ label: 'Limit', defaultValue: 6 }),
    title: TextInput({ label: 'Title', defaultValue: 'Featured Products' }),
    description: TextInput({
      label: 'Description',
      defaultValue: 'Explore our top picks in this featured collection.',
    }),
    showButton: Checkbox({ label: 'Show Button', defaultValue: true }),
    buttonText: TextInput({ label: 'Button Text', defaultValue: 'Shop' }),
    buttonHref: TextInput({ label: 'Button Link', defaultValue: '/' }),
  };
}
