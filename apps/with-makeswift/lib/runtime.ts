import { ReactRuntime } from '@makeswift/runtime/react';

export const runtime = new ReactRuntime({
  breakpoints: {
    mobile: { width: 575, viewport: 390, label: 'Mobile' },
    tablet: { width: 768, viewport: 767, label: 'Tablet' },
    laptop: { width: 1024, viewport: 1024, label: 'Laptop' },
    external: { width: 1280, label: 'External' },
  },
});
