import { ReactRuntime } from '@makeswift/runtime/react';

export const runtime = new ReactRuntime({
  breakpoints: {
    small: { width: 640, viewport: 390, label: 'Small' },
    medium: { width: 768, viewport: 765, label: 'Medium' },
    large: { width: 1024, viewport: 1000, label: 'Large' },
    screen: { width: 1280, label: 'XL' },
  },
});