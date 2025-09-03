import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-node';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import packageJson from './package.json';

const serviceName = process.env.OTEL_SERVICE_NAME || packageJson.name;

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: serviceName,
  // Add more attributes via OTEL_RESOURCE_ATTRIBUTES or here if needed
});

const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'https://ingest.lightstep.com:443',
  headers: {
    'lightstep-access-token': process.env.LIGHTSTEP_TOKEN || '',
  },
});

const sdk = new NodeSDK({
  resource,
  spanProcessor: new SimpleSpanProcessor(traceExporter),
  instrumentations: [
    getNodeAutoInstrumentations({
      // example: disable noisy ones if needed
      // '@opentelemetry/instrumentation-fs': { enabled: false },
    }),
  ],
});

// Start the SDK
try {
  sdk.start();
  if (process.env.NODE_ENV !== 'production') {
    console.log('OpenTelemetry SDK started successfully');
  }
} catch (err) {
  // Avoid crashing app if OTel fails; log and continue.
  console.error('Failed to start OpenTelemetry SDK', err);
}

// Graceful shutdown
process.on('SIGTERM', () => sdk.shutdown());
process.on('SIGINT', () => sdk.shutdown());
