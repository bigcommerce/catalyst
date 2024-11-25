import { Slot } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftNotFoundSection } from './client';

export const COMPONENT_TYPE = 'catalyst-makeswift-not-found-section';

runtime.registerComponent(MakeswiftNotFoundSection, {
  type: COMPONENT_TYPE,
  label: 'MakeswiftNotFoundSection (private)',
  hidden: true,
  props: {
    children: Slot(),
  },
});
