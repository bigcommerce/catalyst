import { Style } from '@makeswift/runtime/controls';
import { ReactRuntime } from '@makeswift/runtime/react';

import { Test } from './Test';

ReactRuntime.registerComponent(Test, {
  type: 'test-thing',
  label: 'Test, world!',
  props: {
    className: Style(),
  },
});
