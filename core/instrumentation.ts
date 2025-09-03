import { registerOTel } from '@vercel/otel';

export function register() {
  // Only register OTel in production or when explicitly enabled
  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_OTEL !== 'true') {
    return;
  }

  // Use simple configuration - let @vercel/otel handle the details
  // Set environment variables for Lightstep configuration
  if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'https://ingest.lightstep.com:443/v1/traces';
  }
  
  if (process.env.LIGHTSTEP_ACCESS_TOKEN && !process.env.OTEL_EXPORTER_OTLP_HEADERS) {
    process.env.OTEL_EXPORTER_OTLP_HEADERS = `lightstep-access-token=${process.env.LIGHTSTEP_ACCESS_TOKEN}`;
  }

  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME || 'catalyst-storefront',
    serviceVersion: process.env.OTEL_SERVICE_VERSION || '1.0.0',
  });
}
