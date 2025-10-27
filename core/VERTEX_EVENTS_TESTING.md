# Vertex AI Retail Events - Testing Guide

This guide explains how to test the Vertex AI Retail event tracking integration in Catalyst.

## Overview

Catalyst includes event tracking for Vertex AI Retail to enable personalization and improve search relevance. Events are automatically sent to Vertex AI when users interact with your storefront.

## Implementation Status

### ✅ Completed
1. **Vertex Event Service** (`lib/vertex-retail/events.ts`)
   - Uses official `@google-cloud/retail` SDK
   - Supports both service account credentials and keyfile paths
   - `sendVertexProductViewedEvent()` - Product detail page views
   - `sendVertexHomePageViewedEvent()` - Home page views
   - `sendVertexSearchEvent()` - Search events with attribution tokens
   - `sendVertexAddToCartEvent()` - Add to cart events
   - `sendVertexPurchaseCompleteEvent()` - Purchase completion events

2. **Attribution Token Manager** (`lib/vertex-retail/attribution-manager.ts`)
   - Tab-scoped sessionStorage for multi-tab support
   - Token storage/retrieval for search sessions
   - Automatic token expiration (30 min TTL)

3. **Middleware Integration** (`middlewares/with-routes.ts`)
   - **Product detail page views** - Fires on every product page load
   - **Home page views** - Fires on home page load
   - Both use `waitUntil()` for non-blocking event submission

4. **Search Attribution Tokens** (`fetch-vertex-search.ts`)
   - Extracts attribution tokens from Vertex search responses
   - Returns tokens in search results for downstream use

### 🚧 Pending (for full implementation)
- Update `fetch-vertex-browse.ts` to extract attribution tokens
- Pass attribution tokens in product URLs from search/browse pages
- Create API endpoint for client-side search event tracking
- Add add-to-cart event tracking to cart actions

## Testing E2E Event Flow

### Test 1: Product Detail Page View Event

**Steps:**
1. Start the dev server: `pnpm run dev`
2. Navigate to any product detail page (e.g., `/product/123`)
3. Check server logs for:
   ```
   [Vertex Events] Product viewed event sent: productId=123
   ```

**Expected Behavior:**
- Event fires automatically via middleware
- Uses visitorId from cookie
- Does NOT include attribution token (correct for detail-page-view)
- Sent to: `projects/{project}/locations/{location}/catalogs/{catalog}/eventStores/default_event_store`

**Verify in Vertex AI Console:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/) → Retail API
2. Navigate to "User Events" section
3. Look for event with:
   - `eventType: "detail-page-view"`
   - `visitorId`: Your session visitor ID
   - `productDetails`: Contains the product ID

**Note:** Events may take a few minutes to appear in the console.

### Test 2: Home Page View Event

**Steps:**
1. Navigate to the home page (`/`)
2. Check server logs for:
   ```
   [Vertex Events] Home page viewed event sent
   ```

**Expected Behavior:**
- Event fires automatically via middleware
- Minimal data (just visitorId)
- Tracks homepage engagement for personalization

**Verify in Vertex AI Console:**
- Event type: `home-page-view`
- Contains visitorId only

### Test 3: Attribution Token Extraction (Search)

**Steps:**
1. Enable Vertex search: `ENABLE_VERTEX_RETAIL_SEARCH=true`
2. Perform a search (e.g., `/search?term=shirt`)
3. Check server logs for:
   ```
   [Vertex Full Search] Attribution token present
   ```
   or
   ```
   [Vertex Full Search] No attribution token in response
   ```

**Expected Behavior:**
- If Vertex returns an attribution token, it should be logged
- Token is extracted and available in search results
- Token will be used later for search event tracking

## Debugging

### Enable Detailed Logging

All event functions already include console logging. Check your terminal for:
- `[Vertex Events]` - Event submission logs
- `[Vertex Full Search]` - Search and attribution token logs
- `[Attribution Manager]` - Token storage logs (client-side)

### Common Issues

#### Events Not Appearing in Vertex Console
1. **Check credentials**: Verify `GOOGLE_APPLICATION_CREDENTIALS` or `GCP_SERVICE_ACCOUNT_CREDENTIALS`
2. **Check project config**: Verify `GCP_PROJECT_ID`, `VERTEX_RETAIL_LOCATION`, `VERTEX_RETAIL_CATALOG`
3. **Check catalog path**: Event store should be `{catalog}/eventStores/default_event_store`
4. **Check permissions**: Service account needs `retail.userEvents.write` permission

#### Product IDs Not Matching
- Events use full resource names: `projects/{project}/locations/{location}/catalogs/{catalog}/branches/0/products/{id}`
- Ensure product IDs in events match those in your Vertex product catalog

#### Attribution Tokens Missing
- Tokens are ONLY returned from search/browse API calls
- Tokens are only needed for search events, NOT for detail-page-view or add-to-cart
- Check that serving config has attribution enabled

### Monitoring Event Quality

In the Vertex AI console, monitor:
1. **Event count**: Total events received
2. **Unjoined event rate**: Events that don't match products in catalog
   - Should be < 5%
   - High rate indicates product ID mismatch
3. **Event types distribution**: Should see mix of detail-page-view, search, etc.

## Product ID Format

Events use the full Vertex resource name format:
```
projects/{PROJECT_ID}/locations/{LOCATION}/catalogs/{CATALOG}/branches/0/products/{PRODUCT_ID}
```

The `formatProductId()` function in `events.ts` handles this automatically based on your environment variables (`GCP_PROJECT_ID`, `VERTEX_RETAIL_LOCATION`, `VERTEX_RETAIL_CATALOG`).

## Next Steps for Full Implementation

To complete the event tracking system:

1. **Search Events**:
   - Create API endpoint to receive search events from client
   - Pass attribution token from search results to client
   - Fire search event with token when results load

2. **Attribution Token Flow**:
   - Update product URLs to include `?at={token}` parameter
   - Client reads token from URL and stores in AttributionManager
   - Token gets included in subsequent search events

3. **Add to Cart**:
   - Hook into cart actions
   - Fire add-to-cart event with product ID and quantity
   - Use existing visitorId from cookies

4. **Purchase Complete**:
   - Hook into checkout success/webhook
   - Fire purchase event with transaction details

## Configuration

Required environment variables:
```bash
# Vertex AI Configuration
GCP_PROJECT_ID=your-project-id
VERTEX_RETAIL_LOCATION=global
VERTEX_RETAIL_CATALOG=default_catalog
VERTEX_RETAIL_PLACEMENT=default_search

# Authentication (choose one)
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
# OR
GCP_SERVICE_ACCOUNT_CREDENTIALS='{"type":"service_account",...}'

# Enable Vertex Search (optional, for testing search flow)
ENABLE_VERTEX_RETAIL_SEARCH=true
```
