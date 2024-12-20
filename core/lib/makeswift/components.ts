import './components/accordions/accordions.makeswift';
import './components/button-link/button-link.makeswift';
import './components/card-carousel/card-carousel.makeswift';
import './components/card/card.makeswift';
import './components/carousel/carousel.makeswift';
import './components/slideshow/slideshow.makeswift';

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
