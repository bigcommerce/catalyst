import { trace } from '@opentelemetry/api';

/**
 * OpenTelemetry tracer for creating custom spans in the Catalyst application.
 *
 * Use this tracer to instrument important operations and track their performance.
 * Spans created with this tracer will appear in your observability dashboard
 * nested under the appropriate HTTP request trace.
 *
 * @see https://nextjs.org/docs/app/guides/open-telemetry#custom-spans
 * @see OPENTELEMETRY.md for detailed usage guide
 *
 * @example Basic usage
 * import { tracer } from '~/lib/otel/tracer';
 *
 * export async function fetchProductRecommendations(productId: string) {
 *   return await tracer.startActiveSpan('fetchProductRecommendations', async (span) => {
 *     try {
 *       // Add attributes for context
 *       span.setAttribute('product.id', productId);
 *
 *       const recommendations = await fetch(`/api/recommendations/${productId}`);
 *
 *       span.setAttribute('recommendations.count', recommendations.length);
 *
 *       return recommendations;
 *     } finally {
 *       // Always end the span, even if an error occurs
 *       span.end();
 *     }
 *   });
 * }
 *
 * @example With error handling
 * import { tracer } from '~/lib/otel/tracer';
 * import { SpanStatusCode } from '@opentelemetry/api';
 *
 * export async function processOrder(orderId: string) {
 *   return await tracer.startActiveSpan('processOrder', async (span) => {
 *     try {
 *       span.setAttribute('order.id', orderId);
 *
 *       const result = await submitOrder(orderId);
 *
 *       return result;
 *     } catch (error) {
 *       // Record the exception and mark span as error
 *       span.recordException(error);
 *       span.setStatus({ code: SpanStatusCode.ERROR });
 *       throw error;
 *     } finally {
 *       span.end();
 *     }
 *   });
 * }
 *
 * @example Data transformation
 * export async function transformCartData(rawCart: RawCart) {
 *   return await tracer.startActiveSpan('transformCartData', async (span) => {
 *     try {
 *       span.setAttribute('cart.itemCount', rawCart.lineItems.length);
 *
 *       const transformed = {
 *         items: rawCart.lineItems.map(transformLineItem),
 *         total: calculateTotal(rawCart),
 *       };
 *
 *       return transformed;
 *     } finally {
 *       span.end();
 *     }
 *   });
 * }
 *
 * When to use custom spans:
 * - Operations that might be slow (> 100ms)
 * - Critical business logic (pricing, inventory, checkout)
 * - External API integrations
 * - Data transformations with variable performance
 * - Any operation you want to monitor and optimize
 *
 * When NOT to use custom spans:
 * - Operations already instrumented by Next.js (fetch calls, route rendering)
 * - Simple utility functions
 * - Trivial operations (< 10ms)
 *
 * Best practices:
 * - Use descriptive span names (e.g., 'cart.calculateDiscounts')
 * - Add meaningful attributes for filtering and debugging
 * - Always end spans in finally blocks
 * - Use hierarchical naming (e.g., 'cart.validate', 'cart.addItem')
 */
export const tracer = trace.getTracer('default');
