// Adapters for the OTel API's span, tracer, provider and context-manager interfaces.
/* eslint-disable max-classes-per-file */
import {
  type Attributes,
  type AttributeValue,
  context,
  type Context,
  type ContextManager,
  type Exception,
  INVALID_SPAN_CONTEXT,
  ROOT_CONTEXT,
  type Span,
  type SpanContext,
  type SpanOptions,
  type SpanStatus,
  SpanStatusCode,
  trace,
  type Tracer,
  type TracerProvider,
} from '@opentelemetry/api';
import { AsyncLocalStorage } from 'node:async_hooks';

// Bridges `@opentelemetry/api` onto the Workers runtime's native tracing
// (`ctx.tracing`), so spans from Next.js and `~/lib/otel/tracer` land in
// Workers traces and whatever OTLP destination the Worker exports to. There is
// no SDK, exporter or flush here: the runtime records and ships the spans.
//
// https://developers.cloudflare.com/workers/observability/traces/custom-spans/

type PrimitiveAttribute = string | number | boolean;

// Older workerd releases ship spans without the optional methods.
interface WorkersSpan {
  readonly isTraced: boolean;
  setAttribute(key: string, value: PrimitiveAttribute): this;
  setAttributes(attributes: Record<string, PrimitiveAttribute | undefined>): this;
  recordException?(exception: string | { name?: string; message?: string; stack?: string }): void;
  setStatus?(status: { code: 'unset' | 'ok' | 'error'; message?: string }): this;
  updateName?(name: string): this;
  spanContext?(): { traceId: string; spanId: string; traceFlags: number };
  end(): void;
}

interface WorkersTracing {
  startActiveSpan<T>(name: string, callback: (span: WorkersSpan) => T): T;
  startSpan(name: string): WorkersSpan;
}

// Same key `~/lib/kv/adapters/cloudflare-kv` reads; see the drift warning there.
const CLOUDFLARE_CONTEXT_SYMBOL = Symbol.for('__cloudflare-context__');

// Resolved per span rather than once at register() time: the context global
// only holds the request's `ctx` while OpenNext is handling a request.
function getWorkersTracing(): WorkersTracing | undefined {
  const cloudflareContext: unknown = Reflect.get(globalThis, CLOUDFLARE_CONTEXT_SYMBOL);

  if (typeof cloudflareContext !== 'object' || cloudflareContext === null) return undefined;

  const ctx: unknown = Reflect.get(cloudflareContext, 'ctx');

  if (typeof ctx !== 'object' || ctx === null) return undefined;

  const tracing: unknown = Reflect.get(ctx, 'tracing');

  if (
    typeof tracing === 'object' &&
    tracing !== null &&
    typeof Reflect.get(tracing, 'startActiveSpan') === 'function' &&
    typeof Reflect.get(tracing, 'startSpan') === 'function'
  ) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return tracing as WorkersTracing;
  }

  return undefined;
}

// Workers attributes are primitives only; OTel also allows homogeneous arrays.
function toPrimitive(value: AttributeValue | undefined): PrimitiveAttribute | undefined {
  if (value === undefined) return undefined;

  if (Array.isArray(value)) return JSON.stringify(value);

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return value as PrimitiveAttribute;
}

const STATUS_CODES = {
  [SpanStatusCode.UNSET]: 'unset',
  [SpanStatusCode.OK]: 'ok',
  [SpanStatusCode.ERROR]: 'error',
} as const;

class WorkersSpanAdapter implements Span {
  constructor(private readonly span: WorkersSpan) {}

  spanContext(): SpanContext {
    return this.span.spanContext?.() ?? INVALID_SPAN_CONTEXT;
  }

  setAttribute(key: string, value: AttributeValue): this {
    const primitive = toPrimitive(value);

    if (primitive !== undefined) this.span.setAttribute(key, primitive);

    return this;
  }

  setAttributes(attributes: Attributes): this {
    this.span.setAttributes(
      Object.fromEntries(
        Object.entries(attributes).map(([key, value]) => [key, toPrimitive(value)]),
      ),
    );

    return this;
  }

  // The Workers span API has no events or links.
  addEvent(): this {
    return this;
  }

  addLink(): this {
    return this;
  }

  addLinks(): this {
    return this;
  }

  setStatus({ code, message }: SpanStatus): this {
    this.span.setStatus?.({ code: STATUS_CODES[code], message });

    return this;
  }

  updateName(name: string): this {
    this.span.updateName?.(name);

    return this;
  }

  end(): void {
    this.span.end();
  }

  isRecording(): boolean {
    return this.span.isTraced;
  }

  recordException(exception: Exception): void {
    this.span.recordException?.(
      typeof exception === 'string'
        ? exception
        : { name: exception.name, message: exception.message, stack: exception.stack },
    );
  }
}

const nonRecordingSpan = () => trace.wrapSpanContext(INVALID_SPAN_CONTEXT);

function adapt(span: WorkersSpan, options?: SpanOptions): Span {
  const adapted = new WorkersSpanAdapter(span);

  if (options?.attributes) adapted.setAttributes(options.attributes);

  return adapted;
}

function normalizeStartActiveSpanArgs<F>(
  args: [F] | [SpanOptions, F] | [SpanOptions, Context, F],
): [SpanOptions | undefined, Context, F] {
  if (args.length === 1) return [undefined, context.active(), args[0]];

  if (args.length === 2) return [args[0], context.active(), args[1]];

  return args;
}

// Parenting comes from the runtime's own async context, not the OTel `Context`
// argument: the Workers API has no way to pass an explicit parent.
class WorkersTracer implements Tracer {
  startSpan(name: string, options?: SpanOptions): Span {
    const tracing = getWorkersTracing();

    return tracing ? adapt(tracing.startSpan(name), options) : nonRecordingSpan();
  }

  startActiveSpan<F extends (span: Span) => unknown>(name: string, fn: F): ReturnType<F>;
  startActiveSpan<F extends (span: Span) => unknown>(
    name: string,
    options: SpanOptions,
    fn: F,
  ): ReturnType<F>;
  startActiveSpan<F extends (span: Span) => unknown>(
    name: string,
    options: SpanOptions,
    parentContext: Context,
    fn: F,
  ): ReturnType<F>;
  startActiveSpan<F extends (span: Span) => unknown>(
    name: string,
    ...args: [F] | [SpanOptions, F] | [SpanOptions, Context, F]
  ): ReturnType<F> {
    const [options, parentContext, fn] = normalizeStartActiveSpanArgs(args);
    const tracing = getWorkersTracing();

    const run = (span: Span) =>
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      context.with(trace.setSpan(parentContext, span), () => fn(span)) as ReturnType<F>;

    if (!tracing) return run(nonRecordingSpan());

    return tracing.startActiveSpan(name, (span) => run(adapt(span, options)));
  }
}

class WorkersTracerProvider implements TracerProvider {
  private readonly tracer = new WorkersTracer();

  getTracer(): Tracer {
    return this.tracer;
  }
}

// `context.with()` / `context.active()` are no-ops without a context manager,
// and Next.js's tracer relies on them to find the active span.
class AsyncLocalStorageContextManager implements ContextManager {
  private readonly storage = new AsyncLocalStorage<Context>();

  active(): Context {
    return this.storage.getStore() ?? ROOT_CONTEXT;
  }

  with<A extends unknown[], F extends (...args: A) => ReturnType<F>>(
    ctx: Context,
    fn: F,
    thisArg?: ThisParameterType<F>,
    ...args: A
  ): ReturnType<F> {
    return this.storage.run(ctx, () => fn.apply(thisArg, args));
  }

  bind<T>(ctx: Context, target: T): T {
    if (typeof target !== 'function') return target;

    const run = this.with.bind(this);

    // A plain function, so callers' `this` (e.g. Next.js's `.apply`) reaches `target`.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return function bound(this: unknown, ...args: unknown[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return run(ctx, () => Reflect.apply(target, this, args));
    } as T;
  }

  enable(): this {
    return this;
  }

  disable(): this {
    this.storage.disable();

    return this;
  }
}

export function registerWorkersTracing() {
  context.setGlobalContextManager(new AsyncLocalStorageContextManager());
  trace.setGlobalTracerProvider(new WorkersTracerProvider());
}
