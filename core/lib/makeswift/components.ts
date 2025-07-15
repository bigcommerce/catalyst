import './components/accordion/register';
import './components/button-link/register';
import './components/card/register';
import './components/card-carousel/register';
import './components/carousel/register';
import './components/customer-group-slot/register';
import './components/graphql-query/register';
import './components/product-card/register';
import './components/product-detail/register';
import './components/products-carousel/register';
import './components/products-list/register';
import './components/section/register';
import './components/site-footer/register';
import './components/site-header/register';
import './components/site-theme/register';
import './components/slideshow/register';
import './components/sticky-sidebar/register';

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
