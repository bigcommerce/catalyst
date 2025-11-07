---
"@bigcommerce/catalyst-core": minor
---

Adds OpenTelemetry instrumentation for Catalyst, enabling the collection of spans for Catalyst storefronts.

### Migration

Change is new code only, so just copy over `/core/instrumentation.ts` and `core/lib/otel/tracers.ts`.