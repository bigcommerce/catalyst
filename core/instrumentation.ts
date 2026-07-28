import { registerOTel } from '@vercel/otel';

// eslint-disable-next-line valid-jsdoc
/**
 * Initializes OpenTelemetry instrumentation for the Next.js application.
 *
 * This function is automatically called by Next.js during application startup
 * to set up distributed tracing and observability.
 *
 * @see https://nextjs.org/docs/app/guides/instrumentation
 * @see https://nextjs.org/docs/app/guides/open-telemetry
 *
 * Configuration:
 * - Uses @vercel/otel for simplified OpenTelemetry setup
 * - Automatically instruments Next.js internals (requests, rendering, fetches)
 * - Service name is read from OTEL_SERVICE_NAME environment variable
 * - If OTEL_SERVICE_NAME is not set, defaults to 'next-app'
 *
 * Environment Variables:
 * - OTEL_SERVICE_NAME: Custom service name (e.g., 'catalyst-storefront')
 * - NEXT_OTEL_VERBOSE: Set to '1' to see all spans (default: essential spans only)
 * - NEXT_OTEL_FETCH_DISABLED: Set to '1' to disable automatic fetch instrumentation
 *
 * What's automatically instrumented:
 * - All HTTP requests (route, method, status)
 * - App Router page and layout rendering
 * - API route handler execution
 * - fetch() calls to external APIs
 * - Metadata generation (generateMetadata)
 *
 * Custom instrumentation:
 * Import the tracer from ~/lib/otel/tracer to create custom spans:
 *
 * @example
 * import { tracer } from '~/lib/otel/tracer';
 *
 * export async function myFunction() {
 *   return await tracer.startActiveSpan('myFunction', async (span) => {
 *     try {
 *       const result = await doWork();
 *       span.setAttribute('result.count', result.length);
 *       return result;
 *     } finally {
 *       span.end();
 *     }
 *   });
 * }
 *
 * For more information about using OpenTelemetry in Catalyst, see:
 * - OPENTELEMETRY.md in this directory
 * - Official Next.js guide: https://nextjs.org/docs/app/guides/open-telemetry
 */
export function register() {
  // Service name is pulled from the OTEL_SERVICE_NAME env var.
  // If you wish to manually set it, you can remove the env var and set it here:
  // registerOTel({ serviceName: 'catalyst-storefront' });
  registerOTel();
}
