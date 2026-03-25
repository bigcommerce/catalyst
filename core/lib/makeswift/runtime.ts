import { registerBoxComponent } from '@makeswift/runtime/react/builtins/box';
import { registerDividerComponent } from '@makeswift/runtime/react/builtins/divider';
import { registerEmbedComponent } from '@makeswift/runtime/react/builtins/embed';
import { registerImageComponent } from '@makeswift/runtime/react/builtins/image';
import { registerRootComponent } from '@makeswift/runtime/react/builtins/root';
import { registerSlotComponent } from '@makeswift/runtime/react/builtins/slot';
import { registerSocialLinksComponent } from '@makeswift/runtime/react/builtins/social-links';
import { registerTextComponent } from '@makeswift/runtime/react/builtins/text';
import { registerVideoComponent } from '@makeswift/runtime/react/builtins/video';
import { ReactRuntimeCore } from '@makeswift/runtime/react/core';

const runtime = new ReactRuntimeCore({
  breakpoints: {
    small: { width: 640, viewport: 390, label: 'Small' },
    medium: { width: 768, viewport: 765, label: 'Medium' },
    large: { width: 1024, viewport: 1000, label: 'Large' },
    screen: { width: 1280, label: 'XL' },
  },
});

// Only register necessary built-in components. Omitted components are:
// Navigation, Button, Form, Carousel, Countdown

registerRootComponent(runtime);
registerSlotComponent(runtime);
registerBoxComponent(runtime);
registerTextComponent(runtime);
registerImageComponent(runtime);
registerDividerComponent(runtime);
registerEmbedComponent(runtime);
registerSocialLinksComponent(runtime);
registerVideoComponent(runtime);

export { runtime };
