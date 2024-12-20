import { Shape } from '@makeswift/runtime/controls';

import { fontFamilyTokens } from '~/lib/makeswift/controls/font-tokens';
import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftSiteTheme } from './client';
import components from './components';

export const COMPONENT_TYPE = 'catalyst-makeswift-theme-provider';

runtime.registerComponent(MakeswiftSiteTheme, {
  type: COMPONENT_TYPE,
  label: 'MakeswiftSiteTheme (private)',
  hidden: true,
  props: {
    fontTokens: Shape({
      label: 'Fonts',
      layout: Shape.Layout.Popover,
      type: fontFamilyTokens,
    }),
    components: Shape({
      label: 'Components',
      type: components,
    }),
  },
});
