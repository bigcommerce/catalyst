import { OTLPHttpProtoTraceExporter, registerOTel } from '@vercel/otel';

const host = process.env.LIGHTSTEP_COLLECTOR_HOST || 'ingest.lightstep.com';
const port = process.env.LIGHTSTEP_COLLECTOR_PORT || '443';
const otlpApiPath = process.env.LIGHTSTEP_API_PATH || 'v1/traces';

const traceExporter = new OTLPHttpProtoTraceExporter({
  url: `https://${host}:${port}/${otlpApiPath}`,
  headers: {
    'lightstep-access-token': process.env.LIGHTSTEP_ACCESS_TOKEN || '',
  },
});

export function register() {
  registerOTel({ serviceName: 'catalyst', traceExporter });
}
