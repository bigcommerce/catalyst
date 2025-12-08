/**
 * TypeScript declarations for Vertex AI Retail JavaScript pixel
 */

interface VertexProductDetail {
  product: {
    id: string;
  };
  quantity?: number;
  priceInfo?: {
    price: number;
    currencyCode?: string;
  };
}

interface VertexUserEvent {
  eventType: string;
  visitorId: string;
  eventTime?: string;
  userInfo?: {
    userId?: string;
    directUserRequest?: boolean;
  };
  productDetails?: VertexProductDetail[];
  searchQuery?: string;
  attributionToken?: string;
  purchaseTransaction?: {
    id: string;
    revenue: number;
    tax?: number;
    cost?: number;
    currencyCode: string;
  };
  pageCategories?: string[];
  experimentIds?: string[];
  uri?: string;
  referrerUri?: string;
  [key: string]: unknown;
}

interface Window {
  _gre?: Array<[string, unknown]> & {
    push: (command: [string, unknown]) => void;
  };
  dataLayer?: Array<Record<string, unknown>>;
  gtag?: (...args: unknown[]) => void;
}
