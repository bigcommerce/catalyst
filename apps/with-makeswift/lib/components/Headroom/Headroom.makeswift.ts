import dynamic from 'next/dynamic';

import { Number, Slot } from '@makeswift/runtime/controls';
import { forwardNextDynamicRef } from '@makeswift/runtime/next';

import { runtime } from 'lib/runtime';
import { Headroom } from './Headroom';

// @ts-ignore
runtime.registerComponent(Headroom, {
  type: 'Headroom',
  label: 'Headroom',
  props: {
    children: Slot(),
    upTolerance: Number({ label: 'Up tolerance', defaultValue: 0, suffix: 'px' }),
    downTolerance: Number({ label: 'Down tolerance', defaultValue: 0, suffix: 'px' }),
    pinStart: Number({ label: 'Pin start', defaultValue: 0, suffix: 'px' }),
  },
});
