import { v4 as uuidv4 } from 'uuid';
import { Analytics, bodlConfig, bodlEvent } from './types';
// import * as BodlEvents from '@bigcommerce-labs/bodl-events';

export { Ga4, type Ga4Config } from './analytics/ga4';

export class Bodl {
  constructor(
    private providers: Analytics[],
    private config: bodlConfig = {},
  ) {
    if (typeof window == 'undefined') {
      console.warn('Bodl must be initialized in browser environment.');
      return;
    }

    // TODO: This is a workaround init while bodl-events import doesn't work properly
    const el = document.getElementsByTagName('body')[0];
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = 'https://microapps.bigcommerce.com/bodl-events/index.js';
    script.onload = this.init.bind(this);
    el.appendChild(script);
  }

  init(event: Event) {
    this.providers.forEach((provider) => provider.init(event));
  }

  sendEvent(event: bodlEvent, payload: any) {
    if (!window.bodlEvents) {
      console.warn('Bodl is not initialized correctly.');
      // TODO: temporary hack - wait for bodl-events script to be loaded
      setTimeout(() => this.sendEvent(event, payload), 1000);
      return;
    }

    const basicEvent = {
      ...this.config,
      event_id: uuidv4(),
    };

    switch (event) {
      case 'bodl_v1_product_page_viewed': {
        window.bodlEvents?.product?.emit(event, { ...basicEvent, ...payload });
        break;
      }
      case 'bodl_v1_cart_product_added': {
        window.bodlEvents?.cart?.emit(event, { ...basicEvent, ...payload });
        break;
      }
      default: {
        console.warn('Event not supported by GA4', event);
        return;
      }
    }

    // Allow providers to do something on events
    this.providers.forEach((provider) => provider.sendEvent(event, { ...basicEvent, ...payload }));
  }
}
