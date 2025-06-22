import './components/accordions/accordions.makeswift';
import './components/button-link/button-link.makeswift';
import './components/card-carousel/card-carousel.makeswift';
import './components/card/card.makeswift';
import './components/carousel/carousel.makeswift';
import './components/customer-group-slot/customer-group-slot.makeswift';
import './components/product-card/product-card.makeswift';
import './components/products-carousel/products-carousel.makeswift';
import './components/products-list/products-list.makeswift';
import './components/section/section.makeswift';
import './components/site-footer/site-footer.makeswift';
import './components/site-header/site-header.makeswift';
import './components/slideshow/slideshow.makeswift';
import './components/sticky-sidebar/sticky-sidebar.makeswift';
import './components/product-detail/register';
// Custom Created MakeSwift Components
import './components/logo-carousel/logo-carousel.makeswift';
import './components/product-card-git/product-card-git.makeswift';

import './components/site-theme/register';

import { MakeswiftComponentType } from '@makeswift/runtime';

import { runtime } from './runtime';

// Hide some builtin Makeswift components

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
