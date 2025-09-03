import { trace, SpanStatusCode } from '@opentelemetry/api';

/**
 * OpenTelemetry utilities for custom instrumentation
 */

// Get the tracer instance
export const tracer = trace.getTracer('catalyst-storefront');

/**
 * Create a custom span with automatic error handling
 */
export async function withSpan<T>(
  name: string,
  fn: (span: any) => Promise<T>,
  attributes?: Record<string, string | number | boolean>
): Promise<T> {
  const span = tracer.startSpan(name);
  
  // Add custom attributes if provided
  if (attributes) {
    span.setAttributes(attributes);
  }

  try {
    const result = await fn(span);
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
}

/**
 * Add attributes to the current active span
 */
export function addSpanAttributes(attributes: Record<string, string | number | boolean>): void {
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    activeSpan.setAttributes(attributes);
  }
}

/**
 * Record an event in the current active span
 */
export function recordSpanEvent(name: string, attributes?: Record<string, string | number | boolean>): void {
  const activeSpan = trace.getActiveSpan();
  if (activeSpan) {
    activeSpan.addEvent(name, attributes);
  }
}

/**
 * Create a span for GraphQL operations
 */
export async function withGraphQLSpan<T>(
  operationName: string,
  fn: () => Promise<T>
): Promise<T> {
  return withSpan(
    `graphql.${operationName}`,
    async (span) => {
      span.setAttributes({
        'graphql.operation.name': operationName,
        'graphql.operation.type': 'query',
      });
      return await fn();
    }
  );
}

/**
 * Create a span for BigCommerce API operations
 */
export async function withBigCommerceSpan<T>(
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  return withSpan(
    `bigcommerce.${operation}`,
    async (span) => {
      span.setAttributes({
        'service.name': 'bigcommerce-api',
        'operation.name': operation,
      });
      return await fn();
    }
  );
}
