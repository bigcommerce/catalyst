---
'@bigcommerce/catalyst-core': minor
---

Send OpenTelemetry spans to Cloudflare Workers tracing when running on Workers. `instrumentation.ts` now detects the Workers runtime and registers a bridge that hands spans from Next.js and `~/lib/otel/tracer` to the runtime's native tracing, instead of loading `@vercel/otel`, which fails on Workers. Other runtimes keep using `@vercel/otel`.

Migration: if you customized `instrumentation.ts`, keep your `registerOTel()` call behind the new Workers check and import `@vercel/otel` lazily, so it never loads on Workers.
