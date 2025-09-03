import { registerOTel } from '@vercel/otel';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';

export function register() {
  // Only register OTel in production or when explicitly enabled
  if (process.env.NODE_ENV !== 'production' && process.env.ENABLE_OTEL !== 'true') {
    return;
  }

  // Configure Lightstep OTLP exporter
  const traceExporter = new OTLPTraceExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'https://ingest.lightstep.com:443/v1/traces',
    headers: {
      'lightstep-access-token': process.env.LIGHTSTEP_ACCESS_TOKEN || '',
    },
  });

  // Create resource with service information
  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME || 'catalyst-storefront',
    [SemanticResourceAttributes.SERVICE_VERSION]: process.env.OTEL_SERVICE_VERSION || '1.0.0',
    [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: 'bigcommerce-catalyst',
  });

  registerOTel({
    serviceName: process.env.OTEL_SERVICE_NAME || 'catalyst-storefront',
    serviceVersion: process.env.OTEL_SERVICE_VERSION || '1.0.0',
    traceExporter,
    resource,
  });
}
