import { NextResponse } from 'next/server';
import { trace } from '@opentelemetry/api';

export async function GET() {
  const tracer = trace.getTracer('api-health');
  return await tracer.startActiveSpan('healthcheck', async (span) => {
    try {
      // Simulate some logic
      const status = { ok: true };
      return NextResponse.json(status);
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: 2, message: 'error' }); // 2 = ERROR
      throw err;
    } finally {
      span.end();
    }
  });
}
