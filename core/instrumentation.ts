import { OTLPHttpProtoTraceExporter, registerOTel } from '@vercel/otel';

const host: string = process.env.COLLECTOR_HOST ?? 'ingest.lightstep.com';
const port: string = process.env.COLLECTOR_PORT ?? '443';
const otlpApiPath: string = process.env.API_PATH ?? 'v1/traces';

const lsTraceExporter = new OTLPHttpProtoTraceExporter({
  url: `https://${host}:${port}/${otlpApiPath}`,
  headers: {
    'lightstep-access-token': process.env.LIGHTSTEP_ACCESS_TOKEN || '',
  },
});

export function register() {
  registerOTel({ serviceName: 'catalyst', traceExporter: lsTraceExporter });
}
