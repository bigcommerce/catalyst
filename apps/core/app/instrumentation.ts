import { OTLPHttpProtoTraceExporter, registerOTel } from '@vercel/otel';

const traceExporter = new OTLPHttpProtoTraceExporter({
  url: 'https://ingest.lightstep.com:443/v1/traces',
  headers: {
    'lightstep-access-token': process.env.LIGHTSTEP_ACCESS_TOKEN,
  },
});

export function register() {
  registerOTel({ serviceName: 'catalyst', traceExporter });
}
