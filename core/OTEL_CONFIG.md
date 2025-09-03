# OpenTelemetry Configuration with Lightstep

This project is configured to use OpenTelemetry with Lightstep as the observability backend.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# OpenTelemetry Configuration
# Enable OpenTelemetry (set to 'true' to enable in development)
ENABLE_OTEL=false

# Service identification
OTEL_SERVICE_NAME=catalyst-storefront
OTEL_SERVICE_VERSION=1.0.0

# Lightstep Configuration
# Your Lightstep access token
LIGHTSTEP_ACCESS_TOKEN=your_lightstep_access_token_here

# OTLP Exporter Configuration
# Lightstep ingest endpoint (default is already set for Lightstep)
OTEL_EXPORTER_OTLP_ENDPOINT=https://ingest.lightstep.com:443/v1/traces
```

## Configuration Details

### Automatic Instrumentation

The project uses `@vercel/otel` with environment variable configuration for Lightstep, which provides automatic instrumentation for:

- **Next.js**: Page requests, API routes, middleware
- **HTTP**: Outgoing HTTP requests
- **Database**: Database queries (if using supported drivers)
- **GraphQL**: All BigCommerce GraphQL queries are automatically instrumented
- **Custom spans**: Manual instrumentation for business logic

### GraphQL Auto-Instrumentation

All GraphQL queries through the BigCommerce client are automatically wrapped with OpenTelemetry spans. This includes:

- **Operation tracking**: Each GraphQL operation gets its own span with operation name and type
- **Variable tracking**: Safe variable values are added as span attributes
- **Response analysis**: Response data is analyzed to add relevant attributes
- **Error handling**: GraphQL errors are automatically recorded in spans
- **Performance monitoring**: Request duration and complexity tracking

The automatic instrumentation provides rich metadata for:
- Product queries (entity ID, SKU, inventory status, pricing)
- Search queries (search terms, result counts, filters)
- Category queries (category ID, product counts)
- Route queries (redirect information, node types)

### Lightstep Integration

The configuration sends traces to Lightstep using the OTLP (OpenTelemetry Protocol) over HTTP. The traces include:

- Service name and version
- Deployment environment
- Request spans with timing and metadata
- Error tracking and status codes
- Custom attributes and tags

### Development vs Production

- **Development**: OTel is disabled by default. Set `ENABLE_OTEL=true` to enable.
- **Production**: OTel is automatically enabled when deployed.

### Getting Your Lightstep Access Token

1. Log in to your Lightstep account
2. Navigate to Settings > Access Tokens
3. Create a new access token with appropriate permissions
4. Copy the token and set it as `LIGHTSTEP_ACCESS_TOKEN`

## Manual Instrumentation

You can add custom spans in your code:

```typescript
import { trace } from '@opentelemetry/api';

const tracer = trace.getTracer('catalyst-storefront');

// Create a custom span
const span = tracer.startSpan('custom-operation');
try {
  // Your business logic here
  span.setAttributes({
    'operation.type': 'data-processing',
    'operation.id': '12345'
  });
} catch (error) {
  span.recordException(error);
  span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
  throw error;
} finally {
  span.end();
}
```

## Troubleshooting

- Ensure `LIGHTSTEP_ACCESS_TOKEN` is set correctly
- Check that the Lightstep endpoint is accessible from your deployment
- Verify that `instrumentationHook: true` is set in `next.config.ts`
- Check the browser console and server logs for any OTel-related errors
