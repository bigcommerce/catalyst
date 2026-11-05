import { context, SpanStatusCode, trace } from '@opentelemetry/api';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { registerWorkersTracing } from './cloudflare';

const CLOUDFLARE_CONTEXT_SYMBOL = Symbol.for('__cloudflare-context__');

interface RecordedSpan {
  name: string;
  attributes: Record<string, unknown>;
  statuses: unknown[];
  exceptions: unknown[];
  ended: boolean;
}

// Records what the bridge hands the Workers runtime.
function createFakeTracing() {
  const spans: RecordedSpan[] = [];

  const startSpan = (name: string) => {
    const recorded: RecordedSpan = {
      name,
      attributes: {},
      statuses: [],
      exceptions: [],
      ended: false,
    };

    spans.push(recorded);

    const span = {
      isTraced: true,
      setAttribute(key: string, value: unknown) {
        recorded.attributes[key] = value;

        return span;
      },
      setAttributes(attributes: Record<string, unknown>) {
        Object.assign(recorded.attributes, attributes);

        return span;
      },
      recordException(exception: unknown) {
        recorded.exceptions.push(exception);
      },
      setStatus(status: unknown) {
        recorded.statuses.push(status);

        return span;
      },
      updateName(newName: string) {
        recorded.name = newName;

        return span;
      },
      spanContext: () => ({ traceId: 'a'.repeat(32), spanId: 'b'.repeat(16), traceFlags: 1 }),
      end() {
        recorded.ended = true;
      },
    };

    return span;
  };

  return {
    spans,
    tracing: {
      startSpan,
      startActiveSpan: <T>(name: string, callback: (span: ReturnType<typeof startSpan>) => T) =>
        callback(startSpan(name)),
    },
  };
}

function setCloudflareContext(value: unknown) {
  Reflect.set(globalThis, CLOUDFLARE_CONTEXT_SYMBOL, value);
}

beforeAll(() => {
  registerWorkersTracing();
});

afterAll(() => {
  trace.disable();
  context.disable();
});

afterEach(() => {
  Reflect.deleteProperty(globalThis, CLOUDFLARE_CONTEXT_SYMBOL);
});

describe('registerWorkersTracing', () => {
  it('records active spans on ctx.tracing and exposes them as the OTel active span', () => {
    const { spans, tracing } = createFakeTracing();

    setCloudflareContext({ ctx: { tracing } });

    const tracer = trace.getTracer('test');

    const traceId = tracer.startActiveSpan(
      'render',
      { attributes: { 'next.route': '/[locale]', tags: ['a', 'b'] } },
      (span) => {
        const active = trace.getActiveSpan();

        span.setStatus({ code: SpanStatusCode.ERROR, message: 'boom' });
        span.recordException(new Error('boom'));
        span.end();

        return active?.spanContext().traceId;
      },
    );

    expect(traceId).toBe('a'.repeat(32));
    expect(spans).toEqual([
      {
        name: 'render',
        attributes: { 'next.route': '/[locale]', tags: '["a","b"]' },
        statuses: [{ code: 'error', message: 'boom' }],
        exceptions: [expect.objectContaining({ name: 'Error', message: 'boom' })],
        ended: true,
      },
    ]);
  });

  it('records non-active spans with startSpan', () => {
    const { spans, tracing } = createFakeTracing();

    setCloudflareContext({ ctx: { tracing } });

    const span = trace
      .getTracer('test')
      .startSpan('fetch', { attributes: { 'http.method': 'GET' } });

    span.setAttribute('http.status_code', 200);
    span.end();

    expect(spans).toEqual([
      expect.objectContaining({
        name: 'fetch',
        attributes: { 'http.method': 'GET', 'http.status_code': 200 },
        ended: true,
      }),
    ]);
  });

  it('runs the callback with a non-recording span outside a Workers request', () => {
    const result = trace.getTracer('test').startActiveSpan('render', (span) => {
      expect(span.isRecording()).toBe(false);
      span.end();

      return 'rendered';
    });

    expect(result).toBe('rendered');
  });
});
