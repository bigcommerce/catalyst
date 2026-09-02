import { AnalyticsProvider } from '~/lib/analytics/types';

export interface MetaPixelConfig {
  pixelId: string;
  consentModeEnabled?: boolean;
  nonce?: string;
  getConsent?: () => Analytics.Consent.ConsentValues | null;
}

/**
 * Meta Pixel (Facebook Pixel) Analytics Provider
 *
 * Implements the AnalyticsProvider interface to track e-commerce events using
 * Meta Pixel. Mirrors the GoogleAnalyticsProvider architecture: the base code
 * is injected once (defining the global `fbq`), consent is applied via Meta's
 * Consent Mode, and events are forwarded through `fbq`.
 *
 * Standard Meta events are sent with `fbq('track', …)`; events without a Meta
 * standard equivalent (ViewCart, RemoveFromCart, ViewCategory) are sent with
 * `fbq('trackCustom', …)`. Each event carries an `eventID` for browser ↔
 * Conversions API deduplication.
 *
 * @example
 * ```typescript
 * const metaPixel = new MetaPixelProvider({
 *   pixelId: '1234567890',
 *   consentModeEnabled: true,
 *   getConsent: () => getConsentCookie(),
 * });
 * metaPixel.initialize();
 * ```
 */
export class MetaPixelProvider implements AnalyticsProvider {
  static #instance: MetaPixelProvider | null = null;

  readonly cart = this.getCartEvents();
  readonly navigation = this.getNavigationEvents();
  readonly consent = this.getConsentEvents();

  private readonly pixelScriptId = 'meta-pixel-script';

  constructor(private readonly config: MetaPixelConfig) {
    this.validateConfig();

    if (MetaPixelProvider.#instance) {
      return MetaPixelProvider.#instance;
    }

    MetaPixelProvider.#instance = this;
  }

  initialize() {
    if (typeof window === 'undefined') {
      throw new Error('Meta Pixel is only available in the browser environment');
    }

    // Order matters: define `fbq`, apply consent, then init. Meta's Consent
    // Mode requires `fbq('consent', 'revoke')` to run *before* `fbq('init')`
    // so no events fire until marketing consent is granted.
    this.injectBaseCode();
    this.initializeConsent();
    this.trackPageView();
  }

  private validateConfig() {
    if (!this.config.pixelId) {
      throw new Error('Meta Pixel requires a Pixel ID');
    }

    // Pixel IDs are numeric strings.
    if (!/^\d+$/.test(this.config.pixelId)) {
      throw new Error('Meta Pixel ID must be a numeric string');
    }
  }

  // Inject the Meta Pixel base code. This defines the global `fbq` function
  // (which queues calls until fbevents.js loads) and loads the script. It does
  // NOT call `fbq('init')` — that happens in `trackPageView`, after consent.
  private injectBaseCode() {
    if (document.getElementById(this.pixelScriptId)) {
      return;
    }

    const script = document.createElement('script');

    script.id = this.pixelScriptId;
    script.type = 'text/javascript';
    script.nonce = this.config.nonce;
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
    `;

    document.head.appendChild(script);
  }

  // Apply Meta Consent Mode based on the user's marketing preference. Defaults
  // to revoked unless marketing consent is explicitly granted. Runs before
  // `fbq('init')` so the pixel stays dormant until consent.
  private initializeConsent() {
    if (!this.config.consentModeEnabled || !this.config.getConsent) {
      return;
    }

    const consent = this.config.getConsent();

    fbq('consent', consent?.marketing ? 'grant' : 'revoke');
  }

  private trackPageView() {
    fbq('init', this.config.pixelId);
    fbq('track', 'PageView');
  }

  private getContentIds(items: Analytics.Product[]): string[] {
    return items.map((item) => item.sku ?? item.id);
  }

  private getContents(items: Analytics.Product[]) {
    return items.map((item) => ({
      id: item.sku ?? item.id,
      quantity: item.quantity ?? 1,
      item_price: item.price,
    }));
  }

  private getCartEvents() {
    return {
      // No Meta standard event for cart view — sent as a custom event.
      cartViewed: (payload, metadata) => {
        fbq(
          'trackCustom',
          'ViewCart',
          {
            content_ids: this.getContentIds(payload.items),
            contents: this.getContents(payload.items),
            content_type: 'product',
            currency: payload.currency,
            value: payload.value,
          },
          { eventID: metadata.eventUuid },
        );
      },
      productAdded: (payload, metadata) => {
        fbq(
          'track',
          'AddToCart',
          {
            content_ids: this.getContentIds(payload.items),
            content_type: 'product',
            currency: payload.currency,
            value: payload.value,
          },
          { eventID: metadata.eventUuid },
        );
      },
      // No Meta standard event for cart removal — sent as a custom event.
      productRemoved: (payload, metadata) => {
        fbq(
          'trackCustom',
          'RemoveFromCart',
          {
            content_ids: this.getContentIds(payload.items),
            contents: this.getContents(payload.items),
            content_type: 'product',
            currency: payload.currency,
            value: payload.value,
          },
          { eventID: metadata.eventUuid },
        );
      },
    } satisfies Analytics.Cart.ProviderEvents;
  }

  private getNavigationEvents() {
    return {
      // No Meta standard event for category view — sent as a custom event.
      categoryViewed: (payload, metadata) => {
        fbq(
          'trackCustom',
          'ViewCategory',
          {
            content_category: payload.name,
            content_ids: this.getContentIds(payload.items),
            contents: this.getContents(payload.items),
            content_type: 'product',
            currency: payload.currency,
          },
          { eventID: metadata.eventUuid },
        );
      },
      productViewed: (payload, metadata) => {
        fbq(
          'track',
          'ViewContent',
          {
            content_ids: this.getContentIds(payload.items),
            content_type: 'product',
            currency: payload.currency,
            value: payload.value,
          },
          { eventID: metadata.eventUuid },
        );
      },
    } satisfies Analytics.Navigation.ProviderEvents;
  }

  private getConsentEvents() {
    return {
      consentUpdated: (consent) => {
        fbq('consent', consent.marketing ? 'grant' : 'revoke');
      },
    } satisfies Analytics.Consent.ProviderEvents;
  }
}
