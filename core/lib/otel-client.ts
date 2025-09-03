import { trace, SpanStatusCode } from '@opentelemetry/api';
import { createClient } from '@bigcommerce/catalyst-client';
import { DocumentDecoration } from '@bigcommerce/catalyst-client/types';

// Get the tracer instance
const tracer = trace.getTracer('catalyst-client');

/**
 * Extract operation information from a GraphQL query string
 */
function getOperationInfo(query: string): { name?: string; type?: string } {
  if (!query || typeof query !== 'string') {
    return {};
  }
  
  const operationRegex = /(?:query|mutation|subscription)\s+(\w+)?/i;
  const match = query.match(operationRegex);
  
  if (match) {
    const type = match[0].split(' ')[0].toLowerCase();
    const name = match[1];
    return { name, type };
  }
  
  return {};
}

/**
 * Normalize a GraphQL query by removing extra whitespace
 */
function normalizeQuery(query: string): string {
  if (!query || typeof query !== 'string') {
    return '';
  }
  return query.replace(/\s+/g, ' ').trim();
}

/**
 * Enhanced client with automatic OpenTelemetry instrumentation using composition
 */
class InstrumentedClient<FetcherRequestInit extends RequestInit = RequestInit> {
  private client: any;

  constructor(config: any) {
    this.client = createClient(config);
  }

  // Delegate all other methods to the wrapped client
  fetchSitemapIndex(channelId?: string) {
    return this.client.fetchSitemapIndex(channelId);
  }
  // Overload for documents that require variables
  async fetch<TResult, TVariables extends Record<string, unknown>>(config: {
    document: DocumentDecoration<TResult, TVariables>;
    variables: TVariables;
    customerAccessToken?: string;
    fetchOptions?: FetcherRequestInit;
    channelId?: string;
    errorPolicy?: 'none' | 'all' | 'auth' | 'ignore';
    validateCustomerAccessToken?: boolean;
  }): Promise<any>;

  // Overload for documents that do not require variables
  async fetch<TResult>(config: {
    document: DocumentDecoration<TResult, Record<string, never>>;
    variables?: undefined;
    customerAccessToken?: string;
    fetchOptions?: FetcherRequestInit;
    channelId?: string;
    errorPolicy?: 'none' | 'all' | 'auth' | 'ignore';
    validateCustomerAccessToken?: boolean;
  }): Promise<any>;

  async fetch<TResult, TVariables>(config: {
    document: DocumentDecoration<TResult, TVariables>;
    variables?: TVariables;
    customerAccessToken?: string;
    fetchOptions?: FetcherRequestInit;
    channelId?: string;
    errorPolicy?: 'none' | 'all' | 'auth' | 'ignore';
    validateCustomerAccessToken?: boolean;
  }): Promise<any> {
    // Extract the query string from the document
    // DocumentDecoration has a definitions property that contains the actual GraphQL query
    let query: string;
    try {
      if (typeof config.document === 'string') {
        query = config.document;
      } else if (config.document && typeof config.document === 'object') {
        // Try to extract the query from the document object
        query = (config.document as any).definitions?.[0]?.loc?.source?.body || 
                (config.document as any).loc?.source?.body ||
                config.document.toString();
      } else {
        query = String(config.document);
      }
    } catch (error) {
      // Fallback to string conversion
      query = String(config.document);
    }
    
    const normalizedQuery = normalizeQuery(query);
    const operationInfo = getOperationInfo(normalizedQuery);
    
    // Create span name from operation info
    const spanName = operationInfo.name 
      ? `graphql.${operationInfo.name}` 
      : `graphql.${operationInfo.type || 'query'}`;

    return await tracer.startActiveSpan(spanName, async (span) => {
      try {
        // Add operation attributes
        span.setAttributes({
          'graphql.operation.name': operationInfo.name || 'anonymous',
          'graphql.operation.type': operationInfo.type || 'query',
          'graphql.operation.source': 'bigcommerce',
          'user.authenticated': !!config.customerAccessToken,
          'request.channel_id': config.channelId || 'default',
        });

        // Add variables information (without sensitive data)
        if (config.variables) {
          const variables = config.variables as Record<string, any>;
          
          // Add safe variable attributes
          Object.entries(variables).forEach(([key, value]) => {
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
              span.setAttributes({
                [`graphql.variables.${key}`]: value,
              });
            } else if (Array.isArray(value)) {
              span.setAttributes({
                [`graphql.variables.${key}.count`]: value.length,
              });
            } else if (value && typeof value === 'object') {
              // For objects, add a count if it's an array-like structure
              if ('length' in value) {
                span.setAttributes({
                  [`graphql.variables.${key}.count`]: (value as any).length,
                });
              }
            }
          });
        }

        // Execute the original fetch
        const result = await this.client.fetch(config);

        // Add response attributes
        if (result.data) {
          span.setAttributes({
            'graphql.response.has_data': true,
            'graphql.response.has_errors': !!result.errors,
          });

          // Add specific data attributes based on operation type
          this.addDataAttributes(span, operationInfo.name, result.data);
        }

        span.setStatus({ code: SpanStatusCode.OK });
        return result;

      } catch (error) {
        span.recordException(error as Error);
        span.setStatus({ 
          code: SpanStatusCode.ERROR, 
          message: error instanceof Error ? error.message : 'Unknown error' 
        });
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * Add specific attributes based on the operation and response data
   */
  private addDataAttributes(span: any, operationName: string | undefined, data: any) {
    if (!operationName || !data) return;

    // Product-related operations
    if (operationName.includes('Product') || operationName.includes('product')) {
      const product = this.findProductInData(data);
      if (product) {
        span.setAttributes({
          'product.entity_id': product.entityId || 'unknown',
          'product.name': product.name || 'unknown',
          'product.sku': product.sku || 'unknown',
          'product.has_images': !!(product.images?.edges?.length),
          'product.images_count': product.images?.edges?.length || 0,
          'product.has_options': !!(product.productOptions?.edges?.length),
          'product.options_count': product.productOptions?.edges?.length || 0,
          'product.has_pricing': !!product.prices,
          'product.inventory_status': product.inventory?.isInStock ? 'in_stock' : 'out_of_stock',
        });
      }
    }

    // Search-related operations
    if (operationName.includes('Search') || operationName.includes('search')) {
      const searchData = this.findSearchInData(data);
      if (searchData) {
        span.setAttributes({
          'search.results_count': searchData.products?.edges?.length || 0,
          'search.has_filters': !!(searchData.filters?.length),
        });
      }
    }

    // Category-related operations
    if (operationName.includes('Category') || operationName.includes('category')) {
      const category = this.findCategoryInData(data);
      if (category) {
        span.setAttributes({
          'category.entity_id': category.entityId || 'unknown',
          'category.name': category.name || 'unknown',
          'category.products_count': category.products?.edges?.length || 0,
        });
      }
    }

    // Route-related operations
    if (operationName.includes('Route') || operationName.includes('route')) {
      const route = this.findRouteInData(data);
      if (route) {
        span.setAttributes({
          'route.has_redirect': !!route.redirect,
          'route.node_type': route.node?.__typename || 'unknown',
        });
      }
    }
  }

  /**
   * Helper methods to find specific data in GraphQL responses
   */
  private findProductInData(data: any): any {
    return data?.site?.product || 
           data?.product || 
           data?.node?.__typename === 'Product' ? data.node : null;
  }

  private findSearchInData(data: any): any {
    return data?.site?.search?.searchProducts || 
           data?.search?.searchProducts || 
           data?.searchProducts || null;
  }

  private findCategoryInData(data: any): any {
    return data?.site?.category || 
           data?.category || 
           data?.node?.__typename === 'Category' ? data.node : null;
  }

  private findRouteInData(data: any): any {
    return data?.site?.route || 
           data?.route || null;
  }
}

/**
 * Create an instrumented client with automatic OpenTelemetry spans
 */
export function createInstrumentedClient<FetcherRequestInit extends RequestInit = RequestInit>(
  config: Parameters<typeof createClient>[0]
): InstrumentedClient<FetcherRequestInit> {
  return new InstrumentedClient<FetcherRequestInit>(config);
}
