import { v4 as uuidv4 } from 'uuid';

import {
  CartViewedPayload,
  Category,
  CategoryViewedPayload,
  Product,
  ProductAddedPayload,
  ProductRemovedPayload,
  ProductViewedPayload,
  Provider,
  SearchPayload,
} from '../../types';

import { type Ga4Config, subscribeOnBodlEvents } from './ga4';
import { removeEdgesAndNodes } from './removeEdgesAndNodes';

// TODO: import this types from bodl-events package?
declare global {
  interface Window {
    bodlEvents?: {
      cart?: {
        emit: (event: string, payload: unknown) => void;
      };
      product?: {
        emit: (event: string, payload: unknown) => void;
      };
    };
  }
}

export interface BodlConfig {
  channel_id: string;
  // More analytics providers supported by BODL can be added here
  ga4?: Ga4Config;
}

const lineItemTransform = (product: Product) => {
  const category: Category = removeEdgesAndNodes(product.categories).at(0);
  const breadcrumbs: Array<{ name: string; path: string }> = removeEdgesAndNodes(
    category.breadcrumbs,
  );

  return {
    product_id: product.entityId,
    product_name: product.name,
    brand_name: product.brand?.name,
    sku: product.sku,
    sale_price: product.prices?.salePrice?.value,
    purchase_price: product.prices?.salePrice?.value || product.prices?.price.value,
    base_price: product.prices?.price.value,
    retail_price: product.prices?.retailPrice?.value || null,
    currency: product.prices?.price.currencyCode,
    category_names: breadcrumbs.map(({ name }) => name),
    variant_id: product.variants?.edges.map(
      (variant: { node: { entityId: any } }) => variant.node.entityId,
    ),
  };
};

export class BodlProvider implements Provider {
  constructor(private config: BodlConfig) {}

  // eslint-disable-next-line @typescript-eslint/member-ordering
  navigation = {
    search: this.call((payload: SearchPayload) => null),
    productViewed: this.call((payload: ProductViewedPayload) => {
      window.bodlEvents?.product?.emit('bodl_v1_product_page_viewed', {
        event_id: uuidv4(),
        channel_id: this.config.channel_id,
        product_value: payload.product.prices?.price.value,
        currency: payload.product.prices?.price.currencyCode,
        line_items: [lineItemTransform(payload.product)],
      });
    }),
    categoryViewed: this.call((payload: CategoryViewedPayload) => null),
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  cart = {
    productAdded: this.call((payload: ProductAddedPayload) => {
      window.bodlEvents?.cart?.emit('bodl_v1_cart_product_added', {
        event_id: uuidv4(),
        channel_id: this.config.channel_id,
        product_value: payload.product.prices?.price.value * payload.quantity,
        currency: payload.product.prices?.price.currencyCode,
        line_items: [
          {
            ...lineItemTransform(payload.product),
            quantity: payload.quantity,
          },
        ],
      });
    }),
    productRemoved: this.call((payload: ProductRemovedPayload) => null),
    cartViewed: this.call((payload: CartViewedPayload) => null),
  };

  customEvent(payload: unknown) {
    return null;
  }

  init() {
    if (typeof window == 'undefined') {
      console.warn('Bodl must be initialized in browser environment.');

      return;
    }

    if (!this.config.ga4) {
      console.warn('GA4 configuration is missing.');

      return;
    }

    // Subscribe analytic providers to BODL events here
    const load = () => {
      subscribeOnBodlEvents(
        this.config.ga4?.gaId,
        this.config.ga4?.developerId,
        this.config.ga4?.consentModeEnabled,
      );
    };

    // TODO: This is a workaround init while import from @bigcommerce/bodl-events doesn't work properly
    const el = document.getElementsByTagName('body')[0];
    const script = document.createElement('script');

    script.type = 'text/javascript';
    script.src = 'https://microapps.bigcommerce.com/bodl-events/index.js';
    script.onload = load;
    el.appendChild(script);
  }

  private call(originalMethod: (payload: any) => void) {
    return (payload: any) => {
      if (!window.bodlEvents) {
        // TODO: temporary hack - wait for bodl-events script to be loaded
        setTimeout(originalMethod.bind(this, payload), 500);

        console.warn('Bodl is not initialized, call init method first.');
        return;
      }
      originalMethod.apply(this, [payload]);
    };
  }
}
