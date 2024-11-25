import { Checkbox, Color, Combobox, Number, Style } from '@makeswift/runtime/controls';

import { Icon, IconNames } from '@/vibes/soul/primitives/icon';
import { runtime } from '~/lib/makeswift/runtime';

// Helper function to convert kebab-case to Title Case
function toTitleCase(str: string): string {
  return str
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

runtime.registerComponent(
  function MSIcon({ name = 'star', ...rest }) {
    return <Icon {...rest} name={name} />;
  },
  {
    type: 'icon',
    label: 'Basic / Icon',
    props: {
      className: Style({ properties: [Style.Margin] }),
      size: Number({
        label: 'Size',
        defaultValue: 24,
      }),
      color: Color(),
      name: Combobox({
        label: 'Icon name',
        getOptions(query) {
          return IconNames.map((name) => ({
            id: name,
            value: name,
            label: toTitleCase(name),
          })).filter(
            (option) => !query || option.label.toLowerCase().includes(query.toLowerCase()),
          );
        },
      }),
      strokeWidth: Number({
        label: 'Stroke width',
        defaultValue: 2,
        step: 0.1,
      }),
      absoluteStrokeWidth: Checkbox({
        label: 'Absolute stroke width',
        defaultValue: false,
      }),
    },
  },
);
