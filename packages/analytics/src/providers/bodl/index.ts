import { v4 as uuidv4 } from 'uuid';

import { AnalyticsConfig, AnalyticsEvent, AnalyticsProvider, Customer, Product } from '../../types';

import { type Ga4Config, subscribeOnBodlEvents } from './ga4';

// TODO: import this types from bodl-events package?
declare global {
  interface Window {
    bodlEvents?: any;
  }
}

export interface BodlConfig {
  // More analytics providers supported by BODL can be added here
  ga4?: Ga4Config;
}

export class Bodl implements AnalyticsProvider {
  private initialized = false;

  constructor(private config: BodlConfig) {}

  init(globalConfig?: AnalyticsConfig) {
    if (typeof window == 'undefined') {
      console.warn('Bodl must be initialized in browser environment.');

      return;
    }

    if (!this.config.ga4) {
      console.warn('GA4 configuration is missing.');

      return;
    }

    if (this.initialized) {
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
    this.initialized = true;
  }

  trackEvent(event: AnalyticsEvent, globalConfig?: AnalyticsConfig) {
    if (!window.bodlEvents) {
      // TODO: temporary hack - wait for bodl-events script to be loaded
      setTimeout(() => this.trackEvent(event, globalConfig), 1000);

      console.warn('Bodl is not initialized, call init method first.');
      return;
    }

    const basicEvent = {
      event_id: uuidv4(),
      ...globalConfig,
    };

    const lineItemTransform = (product: Product) => {
      const categoryNames = product.categories?.edges
        .flatMap((category: { node: { breadcrumbs: any } }) => category.node.breadcrumbs.edges)
        .map((breadcrumb: { node: { name: any } }) => breadcrumb.node.name);

      return {
        product_id: product.entityId,
        product_name: product.name,
        brand_name: product.brand?.name,
        sku: product.sku,
        sale_price: product.prices?.salePrice?.value,
        purchase_price: product.prices?.price.value || product.prices?.salePrice?.value,
        base_price: product.prices?.price.value,
        retail_price: product.prices?.retailPrice?.value || null,
        currency: product.prices?.price.currencyCode,
        category_names: categoryNames,
        variant_id: product.variants?.edges.map(
          (variant: { node: { entityId: any } }) => variant.node.entityId,
        ),
      };
    };

    switch (event.type) {
      case 'product_viewed':
        window.bodlEvents?.product?.emit('bodl_v1_product_page_viewed', {
          ...basicEvent,
          product_value: event.product.prices?.price.value,
          currency: event.product.prices?.price.currencyCode,
          line_items: [lineItemTransform(event.product)],
        });
        break;

      case 'cart_added':
        window.bodlEvents?.cart?.emit('bodl_v1_cart_product_added', {
          ...basicEvent,
          product_value: event.product.prices?.price.value * event.quantity,
          currency: event.product.prices?.price.currencyCode,
          line_items: [
            {
              ...lineItemTransform(event.product),
              quantity: event.quantity,
            },
          ],
        });
        break;

      default:
        console.warn('Event is not supported by BODL', event);
    }
  }

  setCustomer(customer: Customer, globalConfig?: AnalyticsConfig) {
    console.log('setCustomer', customer, this.config, globalConfig);
  }
}
