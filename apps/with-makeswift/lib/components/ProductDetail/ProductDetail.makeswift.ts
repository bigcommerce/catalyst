import { Style } from '@makeswift/runtime/controls';

import { ProductDetail } from './ProductDetail';
import { runtime } from 'lib/runtime';

runtime.registerComponent(ProductDetail, {
  type: 'ProductDetail',
  label: 'Product Detail',
  props: {
    className: Style(),
  },
});
