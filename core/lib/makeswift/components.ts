import '~/makeswift/components/product-card/product-card.makeswift';
// import '~/makeswift/components/featured-products-carousel/featured-products-carousel.makeswift';
// import '~/makeswift/components/featured-products-list/featured-products-list.makeswift';
import '~/makeswift/components/header/register';
import '~/makeswift/components/footer/register';
import '~/makeswift/components/accordions/accordions.makeswift';
import '~/makeswift/components/button-link/button-link.makeswift';
import '~/makeswift/components/card/card.makeswift';
import '~/makeswift/components/carousel/carousel.makeswift';
import '~/makeswift/components/card-carousel/card-carousel.makeswift';
import '~/makeswift/components/product-detail/register';
import '~/makeswift/components/product-description/register';
import '~/makeswift/components/products-carousel/products-carousel.makeswift';
import '~/makeswift/components/products-list/products-list.makeswift';
// import '~/makeswift/components/inline-email-form/inline-email-form.makeswift';
// import '~/makeswift/components/icon/icon.makeswift';
import '~/makeswift/components/slideshow/slideshow.makeswift';
// import '~/makeswift/components/featured-image/featured-image.makeswift';
import '~/makeswift/components/sticky-sidebar-layout/sticky-sidebar-layout.makeswift';
import '~/makeswift/components/section-layout/section-layout.makeswift';
import '~/makeswift/components/css-theme/register';
import '~/makeswift/components/not-found/register';

import '~/belami/components/card-carousel/card-carousel.makeswift';
import '~/belami/components/product-card-carousel/product-card-carousel.makeswift';
import '~/belami/components/mega-menu/mega-menu.makeswift';

import { MakeswiftComponentType } from '@makeswift/runtime';

import { runtime } from './runtime';

// Hide some builtin Makeswift components

// TODO(migueloller): Hiding builtins this way results in existing components being rendered without
// the ability to edit them. We should find a way to hide them in the editor without affecting the
// rendering of existing components.

runtime.registerComponent(() => null, {
  type: MakeswiftComponentType.Carousel,
  label: 'Carousel (hidden)',
  hidden: true,
  props: {},
});

runtime.registerComponent(() => null, {
  type: MakeswiftComponentType.Countdown,
  label: 'Countdown (hidden)',
  hidden: true,
  props: {},
});

runtime.registerComponent(() => null, {
  type: MakeswiftComponentType.Form,
  label: 'Form (hidden)',
  hidden: true,
  props: {},
});

runtime.registerComponent(() => null, {
  type: MakeswiftComponentType.Navigation,
  label: 'Navigation (hidden)',
  hidden: true,
  props: {},
});
