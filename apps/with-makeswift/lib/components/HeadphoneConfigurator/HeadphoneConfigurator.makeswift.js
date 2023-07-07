import { Checkbox, Color, List, Style } from '@makeswift/runtime/controls';
import { forwardNextDynamicRef } from '@makeswift/runtime/next';
import { runtime } from 'lib/runtime';
import dynamic from 'next/dynamic';

runtime.registerComponent(
  forwardNextDynamicRef((patch) =>
    dynamic(() =>
      patch(
        import('./HeadphoneConfigurator').then(
          ({ HeadphoneConfigurator }) => HeadphoneConfigurator,
        ),
      ),
    ),
  ),
  {
    type: 'HeadphoneConfigurator',
    label: 'Headphone Configurator',
    props: {
      className: Style(),
      enableRotate: Checkbox({ label: 'Enable rotation', defaultValue: true }),
      colorOptions: List({
        label: 'Colors',
        type: Color({ defaultValue: '#ff0000' }),
      }),
    },
  },
);
