import { AnalyticsProvider } from '~/lib/analytics/types';

export interface MetaPixelConfig {
  pixelId: string;
  consentModeEnabled?: boolean;
  nonce?: string;
  getConsent?: () => Analytics.Consent.ConsentValues | null;
  debugMode?: boolean;
}

/**
 * Meta Pixel (Facebook Pixel) Analytics Provider
 *
 * Implements the AnalyticsProvider interface to track e-commerce events
 * using Meta Pixel. Supports standard events like ViewContent, AddToCart,
 * RemoveFromCart, and ViewCategory.
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
  private readonly initScriptId = 'meta-pixel-init';

  constructor(private readonly config: MetaPixelConfig) {
    this.validateConfig();

    if (MetaPixelProvider.#instance) {
      return MetaPixelProvider.#instance;
    }

    MetaPixelProvider.#instance = this;
  }

  /**
   * Initialize Meta Pixel script and consent management
   * Must be called in browser environment
   */
  initialize() {
    if (typeof window === 'undefined') {
      throw new Error('Meta Pixel is only available in the browser environment');
    }

    // Check consent before initializing
    if (this.config.consentModeEnabled && this.config.getConsent) {
      const consent = this.config.getConsent();
      if (consent && !consent.marketing) {
        // Consent denied, don't initialize pixel
        if (this.config.debugMode) {
          console.log('[Meta Pixel] Consent denied, pixel not initialized');
        }
        return;
      }
    }

    this.initializePixel();
    this.initializeConsent();
  }

  private validateConfig() {
    if (!this.config.pixelId) {
      throw new Error('Meta Pixel requires a Pixel ID');
    }

    // Validate pixel ID format (should be numeric string)
    if (!/^\d+$/.test(this.config.pixelId)) {
      throw new Error('Meta Pixel ID must be a numeric string');
    }
  }

  /**
   * Initialize Meta Pixel base code
   * Creates the fbq function and loads the pixel script
   */
  private initializePixel() {
    const existingScript = document.getElementById(this.pixelScriptId);

    if (existingScript) {
      return;
    }

    // Initialize fbq function
    const initScript = document.createElement('script');
    initScript.id = this.initScriptId;
    initScript.type = 'text/javascript';
    initScript.nonce = this.config.nonce;
    initScript.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${this.config.pixelId}');
      ${this.config.debugMode ? "fbq('track', 'PageView');" : ''}
    `;

    document.head.appendChild(initScript);

    // Load the pixel script
    const pixelScript = document.createElement('script');
    pixelScript.id = this.pixelScriptId;
    pixelScript.nonce = this.config.nonce;
    pixelScript.src = 'https://connect.facebook.net/en_US/fbevents.js';
    pixelScript.async = true;

    document.head.appendChild(pixelScript);

    if (this.config.debugMode) {
      console.log('[Meta Pixel] Initialized with Pixel ID:', this.config.pixelId);
    }
  }

  /**
   * Initialize consent management
   * Sets default consent state based on user preferences
   */
  private initializeConsent() {
    if (!this.config.consentModeEnabled || !this.config.getConsent) {
      return;
    }

    const consent = this.config.getConsent();

    if (!consent) {
      // Set default consent to denied if no consent is available
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('consent', 'revoke');
      }

      if (this.config.debugMode) {
        console.log('[Meta Pixel] No consent available, defaulting to denied');
      }

      return;
    }

    // Update consent based on marketing preference
    if (typeof window !== 'undefined' && (window as any).fbq) {
      if (consent.marketing) {
        (window as any).fbq('consent', 'grant');
      } else {
        (window as any).fbq('consent', 'revoke');
      }
    }

    if (this.config.debugMode) {
      console.log('[Meta Pixel] Consent initialized:', consent.marketing ? 'granted' : 'denied');
    }
  }

  /**
   * Transform product items to Meta Pixel content format
   */
  private transformProducts(items: Analytics.Product[]) {
    return items.map((item) => ({
      id: item.sku ?? item.id,
      quantity: item.quantity ?? 1,
      item_price: item.price ?? 0,
    }));
  }

  /**
   * Get content IDs array from products
   */
  private getContentIds(items: Analytics.Product[]): string[] {
    return items.map((item) => item.sku ?? item.id);
  }

  /**
   * Get cart events handlers
   */
  private getCartEvents() {
    return {
      cartViewed: (payload, metadata) => {
        if (typeof window === 'undefined' || !(window as any).fbq) {
          return;
        }

        const contents = this.transformProducts(payload.items);
        const contentIds = this.getContentIds(payload.items);

        (window as any).fbq('track', 'ViewCart', {
          content_ids: contentIds,
          contents: contents,
          currency: payload.currency,
          value: payload.value,
        });

        if (this.config.debugMode) {
          console.log('[Meta Pixel] ViewCart event:', {
            content_ids: contentIds,
            contents,
            currency: payload.currency,
            value: payload.value,
          });
        }
      },
      productAdded: (payload, metadata) => {
        if (typeof window === 'undefined' || !(window as any).fbq) {
          return;
        }

        const contents = this.transformProducts(payload.items);
        const contentIds = this.getContentIds(payload.items);

        (window as any).fbq('track', 'AddToCart', {
          content_ids: contentIds,
          contents: contents,
          currency: payload.currency,
          value: payload.value,
        });

        if (this.config.debugMode) {
          console.log('[Meta Pixel] AddToCart event:', {
            content_ids: contentIds,
            contents,
            currency: payload.currency,
            value: payload.value,
          });
        }
      },
      productRemoved: (payload, metadata) => {
        if (typeof window === 'undefined' || !(window as any).fbq) {
          return;
        }

        const contents = this.transformProducts(payload.items);
        const contentIds = this.getContentIds(payload.items);

        (window as any).fbq('track', 'RemoveFromCart', {
          content_ids: contentIds,
          contents: contents,
          currency: payload.currency,
          value: payload.value,
        });

        if (this.config.debugMode) {
          console.log('[Meta Pixel] RemoveFromCart event:', {
            content_ids: contentIds,
            contents,
            currency: payload.currency,
            value: payload.value,
          });
        }
      },
    } satisfies Analytics.Cart.ProviderEvents;
  }

  /**
   * Get navigation events handlers
   */
  private getNavigationEvents() {
    return {
      categoryViewed: (payload, metadata) => {
        if (typeof window === 'undefined' || !(window as any).fbq) {
          return;
        }

        const contents = this.transformProducts(payload.items);
        const contentIds = this.getContentIds(payload.items);

        (window as any).fbq('track', 'ViewCategory', {
          content_category: payload.name,
          content_ids: contentIds,
          contents: contents,
          currency: payload.currency,
        });

        if (this.config.debugMode) {
          console.log('[Meta Pixel] ViewCategory event:', {
            content_category: payload.name,
            content_ids: contentIds,
            contents,
            currency: payload.currency,
          });
        }
      },
      productViewed: (payload, metadata) => {
        if (typeof window === 'undefined' || !(window as any).fbq) {
          return;
        }

        const contents = this.transformProducts(payload.items);
        const contentIds = this.getContentIds(payload.items);

        (window as any).fbq('track', 'ViewContent', {
          content_ids: contentIds,
          contents: contents,
          content_type: 'product',
          currency: payload.currency,
          value: payload.value,
        });

        if (this.config.debugMode) {
          console.log('[Meta Pixel] ViewContent event:', {
            content_ids: contentIds,
            contents,
            content_type: 'product',
            currency: payload.currency,
            value: payload.value,
          });
        }
      },
    } satisfies Analytics.Navigation.ProviderEvents;
  }

  /**
   * Get consent events handlers
   */
  private getConsentEvents() {
    return {
      consentUpdated: (consent, metadata) => {
        if (typeof window === 'undefined' || !(window as any).fbq) {
          return;
        }

        if (consent.marketing) {
          (window as any).fbq('consent', 'grant');
        } else {
          (window as any).fbq('consent', 'revoke');
        }

        if (this.config.debugMode) {
          console.log('[Meta Pixel] Consent updated:', consent.marketing ? 'granted' : 'denied');
        }
      },
    } satisfies Analytics.Consent.ProviderEvents;
  }
}

