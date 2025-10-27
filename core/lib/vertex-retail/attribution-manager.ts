/**
 * Attribution Token Manager
 * Manages Vertex AI attribution tokens with tab-scoped sessionStorage
 *
 * Attribution tokens are unique per search/browse session and must be:
 * - Isolated per browser tab (multiple tabs = multiple searches)
 * - Passed from search results to product detail pages via URL
 * - Only sent in search events, not subsequent events (add-to-cart, purchase)
 */

'use client';

interface TokenMetadata {
  token: string;
  timestamp: number;
  searchQuery?: string;
}

interface TokenStorage {
  [key: string]: TokenMetadata;
}

const TAB_ID_KEY = 'vertex_tab_id';
const TOKEN_STORAGE_PREFIX = 'vertex_tokens_';
const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

export class AttributionManager {
  private tabId: string;
  private storageKey: string;

  constructor() {
    this.tabId = this.getOrCreateTabId();
    this.storageKey = `${TOKEN_STORAGE_PREFIX}${this.tabId}`;
  }

  /**
   * Get or create a unique ID for this browser tab
   * Uses sessionStorage which is isolated per tab
   */
  private getOrCreateTabId(): string {
    if (typeof window === 'undefined') {
      return 'server'; // Fallback for SSR
    }

    try {
      let tabId = sessionStorage.getItem(TAB_ID_KEY);

      if (!tabId) {
        tabId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        sessionStorage.setItem(TAB_ID_KEY, tabId);
      }

      return tabId;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[Attribution Manager] Failed to access sessionStorage:', error);

      return `fallback_${Date.now()}`;
    }
  }

  /**
   * Get all tokens for this tab
   */
  private getTokenStorage(): TokenStorage {
    if (typeof window === 'undefined') {
      return {};
    }

    try {
      const stored = sessionStorage.getItem(this.storageKey);

      if (!stored) {
        return {};
      }

      return JSON.parse(stored) as TokenStorage;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[Attribution Manager] Failed to parse token storage:', error);

      return {};
    }
  }

  /**
   * Save token storage for this tab
   */
  private setTokenStorage(storage: TokenStorage): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(storage));
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[Attribution Manager] Failed to save token storage:', error);
    }
  }

  /**
   * Store attribution token for a search query
   * @param searchQuery The search query this token is associated with
   * @param token The attribution token from Vertex AI
   */
  setSearchToken(searchQuery: string, token: string): void {
    const storage = this.getTokenStorage();

    storage[`search_${searchQuery}`] = {
      token,
      timestamp: Date.now(),
      searchQuery,
    };

    this.setTokenStorage(storage);

    // eslint-disable-next-line no-console
    console.log(`[Attribution Manager] Stored search token for query: "${searchQuery}"`);
  }

  /**
   * Retrieve attribution token for a search query
   * @param searchQuery The search query to retrieve token for
   * @returns The attribution token or null if not found/expired
   */
  getSearchToken(searchQuery: string): string | null {
    const storage = this.getTokenStorage();
    const metadata = storage[`search_${searchQuery}`];

    if (!metadata) {
      return null;
    }

    // Check if token is expired
    if (Date.now() - metadata.timestamp > TOKEN_TTL_MS) {
      // eslint-disable-next-line no-console
      console.log('[Attribution Manager] Token expired for search query:', searchQuery);
      delete storage[`search_${searchQuery}`];
      this.setTokenStorage(storage);

      return null;
    }

    return metadata.token;
  }

  /**
   * Store attribution token for a specific product
   * This is used when a product is clicked from search results
   * @param productId The product ID
   * @param token The attribution token from the search that surfaced this product
   */
  setProductToken(productId: string | number, token: string): void {
    const storage = this.getTokenStorage();

    storage[`product_${productId}`] = {
      token,
      timestamp: Date.now(),
    };

    this.setTokenStorage(storage);
  }

  /**
   * Retrieve attribution token for a product
   * @param productId The product ID to retrieve token for
   * @returns The attribution token or null if not found/expired
   */
  getProductToken(productId: string | number): string | null {
    const storage = this.getTokenStorage();
    const metadata = storage[`product_${productId}`];

    if (!metadata) {
      return null;
    }

    // Check if token is expired
    if (Date.now() - metadata.timestamp > TOKEN_TTL_MS) {
      delete storage[`product_${productId}`];
      this.setTokenStorage(storage);

      return null;
    }

    return metadata.token;
  }

  /**
   * Clear tokens older than the TTL
   * Should be called periodically to prevent storage bloat
   */
  clearOldTokens(maxAge: number = TOKEN_TTL_MS): void {
    const storage = this.getTokenStorage();
    const now = Date.now();
    let cleared = 0;

    Object.keys(storage).forEach((key) => {
      const metadata = storage[key];

      if (metadata && now - metadata.timestamp > maxAge) {
        delete storage[key];
        cleared++;
      }
    });

    if (cleared > 0) {
      this.setTokenStorage(storage);
      // eslint-disable-next-line no-console
      console.log(`[Attribution Manager] Cleared ${cleared} expired tokens`);
    }
  }

  /**
   * Clear all tokens for this tab
   * Useful for testing or cleanup
   */
  clearAllTokens(): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      sessionStorage.removeItem(this.storageKey);
      // eslint-disable-next-line no-console
      console.log('[Attribution Manager] Cleared all tokens for this tab');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn('[Attribution Manager] Failed to clear tokens:', error);
    }
  }

  /**
   * Get the current tab ID
   * Useful for debugging
   */
  getTabId(): string {
    return this.tabId;
  }
}

// Export a singleton instance for convenience
let managerInstance: AttributionManager | null = null;

export function getAttributionManager(): AttributionManager {
  if (!managerInstance) {
    managerInstance = new AttributionManager();
  }

  return managerInstance;
}
