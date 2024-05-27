import { v4 as uuidv4 } from 'uuid';

import { AnalyticsConfig, AnalyticsEvent, AnalyticsProvider, Customer } from '../../types';

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
  private bodlInitialized = false;

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

    if (this.bodlInitialized) {
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
    this.bodlInitialized = true;
  }

  trackEvent(event: AnalyticsEvent, globalConfig?: AnalyticsConfig) {
    if (!window.bodlEvents) {
      console.warn('Bodl is not initialized, call init method first.');
      // TODO: temporary hack - wait for bodl-events script to be loaded
      setTimeout(() => this.trackEvent(event, globalConfig), 1000);

      return;
    }

    const basicEvent = {
      event_id: uuidv4(),
      ...globalConfig,
    };

    switch (event.type) {
      case 'product_viewed':
        window.bodlEvents?.product?.emit('bodl_v1_product_page_viewed', {
          ...basicEvent,
          product_value: event.product.prices?.price.value,
          currency: event.product.prices?.price.currencyCode,
          line_items: [
            {
              product_id: event.product.entityId,
              product_name: event.product.name,
              sku: event.product.sku,
              base_price: event.product.prices?.price.value,
              currency: event.product.prices?.price.currencyCode,
            },
          ],
        });
        break;

      case 'cart_added':
        // const categoryNames = removeEdgesAndNodes(product.categories)
        //   .flatMap((category) => removeEdgesAndNodes(category.breadcrumbs))
        //   .map((breadcrumb) => breadcrumb.name);
        const categoryNames = event.product.categories?.edges.map(
          (category: { node: { name: any } }) => category.node.name,
        );

        window.bodlEvents?.cart?.emit('bodl_v1_cart_product_added', {
          ...basicEvent,
          product_value: event.product.prices?.price.value * event.quantity,
          currency: event.product.prices?.price.currencyCode,
          line_items: [
            {
              product_id: event.product.entityId,
              product_name: event.product.name,
              category_names: categoryNames,
              quantity: event.quantity,
              sku: event.product.sku,
              currency: event.product.prices?.price.currencyCode,
              base_price: event.product.prices?.price.value,
              retail_price: event.product.prices?.retailPrice?.value || null,
              sale_price: event.product.prices?.salePrice?.value || null,
              purchase_price:
                event.product.prices?.price.value || event.product.prices?.salePrice?.value,
              brand_name: event.product.brand?.name,
              variant_id: event.product.variants?.edges.map(
                (variant: { node: { entityId: any } }) => variant.node.entityId,
              ),
              discount: event.cart.discountedAmount.value,
              gift_certificate_id: event.cart.lineItems.giftCertificates.map(
                (certificate: { entityId: string }) => certificate.entityId,
              ),
              gift_certificate_name: event.cart.lineItems.giftCertificates.map(
                (certificate: { name: string }) => certificate.name,
              ),
              gift_certificate_theme: event.cart.lineItems.giftCertificates.map(
                (certificate: { theme: string }) => certificate.theme,
              ),
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
