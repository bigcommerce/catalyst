/**
 * Vertex AI Retail User Event Service
 * Sends user interaction events to Vertex AI for search quality and personalization
 */

import { UserEventServiceClient } from '@google-cloud/retail';

import { getCatalogPath } from './client';

interface VertexEventConfig {
  projectId: string;
  location: string;
  catalog: string;
  keyFilename?: string;
  credentials?: string;
}

function getConfig(): VertexEventConfig | null {
  const projectId = process.env.GCP_PROJECT_ID;
  const location = process.env.VERTEX_RETAIL_LOCATION || 'global';
  const catalog = process.env.VERTEX_RETAIL_CATALOG || 'default_catalog';
  const keyFilename = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const credentials = process.env.GCP_SERVICE_ACCOUNT_CREDENTIALS;

  if (!projectId) {
    return null;
  }

  return {
    projectId,
    location,
    catalog,
    keyFilename,
    credentials,
  };
}

function getClientOptions(keyFilename?: string, credentialsJson?: string) {
  // Priority 1: Use credentials from environment variable (for Vercel/production)
  if (credentialsJson) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const credentials = JSON.parse(credentialsJson);

      return {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        credentials,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('[Vertex Events] Failed to parse GCP_SERVICE_ACCOUNT_CREDENTIALS:', error);
    }
  }

  // Priority 2: Use keyfile path (for local development)
  if (keyFilename) {
    return {
      keyFilename,
    };
  }

  // Priority 3: Use Application Default Credentials (ADC)
  return {};
}

let eventClient: UserEventServiceClient | null = null;

function getEventClient(): UserEventServiceClient | null {
  if (eventClient) {
    return eventClient;
  }

  const config = getConfig();

  if (!config) {
    return null;
  }

  const options = getClientOptions(config.keyFilename, config.credentials);

  eventClient = new UserEventServiceClient(options);

  return eventClient;
}

function getEventStorePath(): string | null {
  const catalogPath = getCatalogPath();

  if (!catalogPath) {
    return null;
  }

  return `${catalogPath}/eventStores/default_event_store`;
}

/**
 * Convert product ID to Vertex AI product resource name format
 */
function formatProductId(productId: string | number, branchId: string = '1'): string {
  const catalogPath = getCatalogPath();

  return `${catalogPath}/branches/${branchId}/products/${productId}`;
}

// ============================================================================
// Event Interfaces
// ============================================================================

interface BaseEventParams {
  visitorId: string;
  userId?: string;
  eventTime?: Date;
}

interface SearchEventParams extends BaseEventParams {
  searchQuery: string;
  attributionToken?: string;
  productIds?: Array<string | number>;
  totalResults?: number;
  offset?: number;
  pageSize?: number;
}

interface ProductViewedEventParams extends BaseEventParams {
  productId: string | number;
  referrerUri?: string;
}

interface AddToCartEventParams extends BaseEventParams {
  productId: string | number;
  quantity: number;
  price?: number;
  currencyCode?: string;
}

interface HomePageViewedEventParams extends BaseEventParams {
  // Home page view requires minimal params
}

interface PurchaseCompleteEventParams extends BaseEventParams {
  transactionId: string;
  revenue: number;
  currencyCode: string;
  products: Array<{
    productId: string | number;
    quantity: number;
    price: number;
  }>;
  tax?: number;
  shipping?: number;
}

// ============================================================================
// Event Functions
// ============================================================================

/**
 * Send a search event to Vertex AI
 * This event should include the attribution token from the search response
 */
export async function sendVertexSearchEvent(params: SearchEventParams): Promise<void> {
  const client = getEventClient();
  const eventStorePath = getEventStorePath();

  if (!client || !eventStorePath) {
    // eslint-disable-next-line no-console
    console.warn('[Vertex Events] Client or event store path not configured, skipping search event');

    return;
  }

  try {
    const eventTime = params.eventTime || new Date();
    const timestampMillis = eventTime.getTime();

    const userEvent = {
      eventType: 'search',
      visitorId: params.visitorId,
      ...(params.userId && { userId: params.userId }),
      eventTime: {
        seconds: Math.floor(timestampMillis / 1000),
        nanos: (timestampMillis % 1000) * 1000000,
      },
      searchQuery: params.searchQuery,
      ...(params.attributionToken && { attributionToken: params.attributionToken }),
      ...(params.productIds &&
        params.productIds.length > 0 && {
          productDetails: params.productIds.map((id) => ({
            product: {
              id: formatProductId(id),
            },
          })),
        }),
      ...(params.offset !== undefined && { offset: params.offset }),
      ...(params.pageSize && { pageSize: params.pageSize }),
    };

    await client.writeUserEvent({
      parent: eventStorePath,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userEvent: userEvent as any,
    });

    // eslint-disable-next-line no-console
    console.log(
      `[Vertex Events] Search event sent: query="${params.searchQuery}", token=${params.attributionToken ? 'present' : 'missing'}`,
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Vertex Events] Error sending search event:', error);
  }
}

/**
 * Send a product detail page view event to Vertex AI
 * NOTE: This event does NOT include attribution token
 */
export async function sendVertexProductViewedEvent(
  params: ProductViewedEventParams,
): Promise<void> {
  const client = getEventClient();
  const eventStorePath = getEventStorePath();

  if (!client || !eventStorePath) {
    return;
  }

  try {
    const eventTime = params.eventTime || new Date();
    const timestampMillis = eventTime.getTime();

    const userEvent = {
      eventType: 'detail-page-view',
      visitorId: params.visitorId,
      eventTime: {
        seconds: Math.floor(timestampMillis / 1000),
        nanos: (timestampMillis % 1000) * 1000000,
      },
      userInfo: {
        ...(params.userId && { userId: params.userId }),
        directUserRequest: true,
      },
      productDetails: [
        {
          product: {
            id: formatProductId(params.productId),
          },
        },
      ],
      ...(params.referrerUri && { referrerUri: params.referrerUri }),
    };

    await client.writeUserEvent({
      parent: eventStorePath,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userEvent: userEvent as any,
    });

    // eslint-disable-next-line no-console
    console.log(`[Vertex Events] Product viewed event sent: productId=${params.productId}`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Vertex Events] Error sending product viewed event:', error);
  }
}

/**
 * Send an add-to-cart event to Vertex AI
 * NOTE: This event does NOT include attribution token
 */
export async function sendVertexAddToCartEvent(params: AddToCartEventParams): Promise<void> {
  const client = getEventClient();
  const eventStorePath = getEventStorePath();

  if (!client || !eventStorePath) {
    return;
  }

  try {
    const eventTime = params.eventTime || new Date();
    const timestampMillis = eventTime.getTime();

    const userEvent = {
      eventType: 'add-to-cart',
      visitorId: params.visitorId,
      ...(params.userId && { userId: params.userId }),
      eventTime: {
        seconds: Math.floor(timestampMillis / 1000),
        nanos: (timestampMillis % 1000) * 1000000,
      },
      productDetails: [
        {
          product: {
            id: formatProductId(params.productId),
          },
          quantity: params.quantity,
          ...(params.price !== undefined && {
            priceInfo: {
              price: params.price,
              ...(params.currencyCode && { currencyCode: params.currencyCode }),
            },
          }),
        },
      ],
    };

    await client.writeUserEvent({
      parent: eventStorePath,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userEvent: userEvent as any,
    });

    // eslint-disable-next-line no-console
    console.log(
      `[Vertex Events] Add to cart event sent: productId=${params.productId}, quantity=${params.quantity}`,
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Vertex Events] Error sending add to cart event:', error);
  }
}

/**
 * Send a home page view event to Vertex AI
 */
export async function sendVertexHomePageViewedEvent(
  params: HomePageViewedEventParams,
): Promise<void> {
  const client = getEventClient();
  const eventStorePath = getEventStorePath();

  if (!client || !eventStorePath) {
    return;
  }

  try {
    const eventTime = params.eventTime || new Date();
    const timestampMillis = eventTime.getTime();

    const userEvent = {
      eventType: 'home-page-view',
      visitorId: params.visitorId,
      eventTime: {
        seconds: Math.floor(timestampMillis / 1000),
        nanos: (timestampMillis % 1000) * 1000000,
      },
      userInfo: {
        ...(params.userId && { userId: params.userId }),
        directUserRequest: true,
      },
    };

    // eslint-disable-next-line no-console
    console.log('[Vertex Events] Sending home page event:', JSON.stringify(userEvent, null, 2));
    // eslint-disable-next-line no-console
    console.log('[Vertex Events] Event store path:', eventStorePath);

    await client.writeUserEvent({
      parent: eventStorePath,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userEvent: userEvent as any,
    });

    // eslint-disable-next-line no-console
    console.log('[Vertex Events] Home page viewed event sent');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Vertex Events] Error sending home page viewed event:', error);
  }
}

/**
 * Send a purchase complete event to Vertex AI
 */
export async function sendVertexPurchaseCompleteEvent(
  params: PurchaseCompleteEventParams,
): Promise<void> {
  const client = getEventClient();
  const eventStorePath = getEventStorePath();

  if (!client || !eventStorePath) {
    return;
  }

  try {
    const eventTime = params.eventTime || new Date();
    const timestampMillis = eventTime.getTime();

    const userEvent = {
      eventType: 'purchase-complete',
      visitorId: params.visitorId,
      ...(params.userId && { userId: params.userId }),
      eventTime: {
        seconds: Math.floor(timestampMillis / 1000),
        nanos: (timestampMillis % 1000) * 1000000,
      },
      productDetails: params.products.map((product) => ({
        product: {
          id: formatProductId(product.productId),
        },
        quantity: product.quantity,
        priceInfo: {
          price: product.price,
          currencyCode: params.currencyCode,
        },
      })),
      purchaseTransaction: {
        id: params.transactionId,
        revenue: params.revenue,
        ...(params.tax !== undefined && { tax: params.tax }),
        ...(params.shipping !== undefined && { cost: params.shipping }),
        currencyCode: params.currencyCode,
      },
    };

    await client.writeUserEvent({
      parent: eventStorePath,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userEvent: userEvent as any,
    });

    // eslint-disable-next-line no-console
    console.log(
      `[Vertex Events] Purchase complete event sent: transactionId=${params.transactionId}, revenue=${params.revenue}`,
    );
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[Vertex Events] Error sending purchase complete event:', error);
  }
}
