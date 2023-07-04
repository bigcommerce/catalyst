import { ReactRuntime } from '@makeswift/runtime/react';

export const runtime = new ReactRuntime({
  breakpoints: {
    mobile: { width: 575, viewport: 390, label: 'Mobile' },
    tablet: { width: 768, viewport: 768, label: 'Tablet' },
    laptop: { width: 970, viewport: 970, label: 'Laptop' },
    external: { width: 1280, label: 'External' },
  },
});
