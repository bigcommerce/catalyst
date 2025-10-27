# Vertex Retail AI Search-As-You-Type Integration

This document describes the Vertex Retail AI search integration that has been added to Catalyst.

## Overview

The search-as-you-type functionality in the header now supports Vertex Retail AI as an alternative backend to BigCommerce's native search. When enabled, the quick search will use Google Cloud's Vertex AI for Retail **Search API** to provide product suggestions, then hydrate full product details from the BigCommerce GraphQL API.

## Architecture

The integration follows a two-step process:

1. **Vertex Retail Search API**: Returns product IDs based on the search query
2. **BigCommerce GraphQL API**: Fetches full product details (name, price, images, etc.) for those IDs

This ensures we have all the necessary product data to render the existing UI components without modification.

## Environment Variables

Add the following environment variables to `/core/.env.local`:

```bash
# Enable Vertex Retail AI search
ENABLE_VERTEX_RETAIL_SEARCH=true

# Google Cloud Project ID
GCP_PROJECT_ID=your-project-id

# Vertex Retail API location (default: global)
VERTEX_RETAIL_LOCATION=global

# Catalog name (default: default_catalog)
VERTEX_RETAIL_CATALOG=default_catalog

# Serving config name (will be auto-constructed to full path)
# Format: just the config name, e.g., "default_search"
# Full path: projects/{PROJECT}/locations/{LOCATION}/catalogs/{CATALOG}/servingConfigs/{PLACEMENT}
VERTEX_RETAIL_PLACEMENT=default_search

# Path to service account key file (local development only)
# For production/Vercel, use GCP_SERVICE_ACCOUNT_CREDENTIALS instead
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/vertex-retail-key.json
```

**Note:** The service account key file should be stored outside the repository and added to `.gitignore`. Never commit credentials to git.

## Setup Instructions

### 1. Install Dependencies

Dependencies have already been installed:
- `@google-cloud/retail@^4.2.1`

Run `pnpm install` if needed.

### 2. Configure Google Cloud

1. **Create or use an existing GCP project**
   - Create a new project in [Google Cloud Console](https://console.cloud.google.com/)
   - Note your project ID (e.g., `your-project-id`)

2. **Enable the Retail API**:
   ```bash
   gcloud services enable retail.googleapis.com --project=your-project-id
   ```

3. **Create a service account**:
   ```bash
   gcloud iam service-accounts create vertex-retail-search \
     --display-name="Vertex Retail Search" \
     --project=your-project-id
   ```

4. **Grant necessary permissions**:
   ```bash
   gcloud projects add-iam-policy-binding your-project-id \
     --member="serviceAccount:vertex-retail-search@your-project-id.iam.gserviceaccount.com" \
     --role="roles/retail.admin"
   ```

5. **Create and download a key**:
   ```bash
   gcloud iam service-accounts keys create ~/vertex-retail-key.json \
     --iam-account=vertex-retail-search@your-project-id.iam.gserviceaccount.com
   ```

6. **For local development**: Copy the key file to your project directory (outside the repo) and reference it in `.env.local`:
   ```bash
   GOOGLE_APPLICATION_CREDENTIALS=/path/to/vertex-retail-key.json
   ```

7. **For production/Vercel**: Copy the JSON content from `~/vertex-retail-key.json` and paste it as a single-line string into the `GCP_SERVICE_ACCOUNT_CREDENTIALS` environment variable in Vercel. See `VERCEL_DEPLOYMENT.md` for details.

### 3. Set Up Vertex Retail Catalog

Before the search will work, you need to import your product catalog into Vertex Retail:

1. **Prepare product data** in the [Vertex Retail format](https://cloud.google.com/retail/docs/reference/rest/v2/projects.locations.catalogs.branches.products#Product)

2. **Import products** using the Retail API:
   ```bash
   # See: https://cloud.google.com/retail/docs/import-products
   ```

3. **Wait for indexing** to complete (can take several hours for large catalogs)

### 4. Test the Integration

1. Set `ENABLE_VERTEX_RETAIL_SEARCH=true` in `.env.local`

2. Start the development server:
   ```bash
   cd core
   pnpm run dev
   ```

3. Open the site and use the search in the header

4. Type at least 3 characters to trigger the search

5. Check the console for any errors

## Product ID Extraction

The integration extracts BigCommerce product IDs from Vertex search results using regex patterns that support multiple formats:

**Supported Formats:**
1. `product-123` (hyphen separator) ← **Recommended**
2. `product:123` (colon separator)
3. `product/123` (slash separator)
4. `123` (direct numeric ID)

**Regex Pattern:** `/product[-:/](\d+)/i`

**Important**: When importing products to Vertex Retail, use IDs that match these patterns. The hyphen format (`product-123`) is most commonly used and recommended.

## File Structure

### New Files Created

```
core/
├── lib/vertex-retail/
│   ├── client.ts           # Vertex Retail client initialization
│   └── types.ts            # TypeScript types for Vertex API
├── client/queries/
│   └── get-products-by-ids.ts  # GraphQL query to fetch products by IDs
└── components/header/_actions/
    └── vertex-search.ts    # Server action for Vertex search
```

### Modified Files

```
core/
├── package.json            # Added @google-cloud/retail dependency
├── .env.example            # Added Vertex configuration variables
└── components/header/
    └── index.tsx           # Conditional search action selection
```

## How It Works

1. User types in the search box (minimum 3 characters)
2. If `ENABLE_VERTEX_RETAIL_SEARCH=true`, the `vertexSearch` action is called
3. `vertexSearch` calls Vertex Retail's **Search API** with the search term and branch
4. Product IDs are extracted from the search results (from `result.id` field)
5. Up to 5 product IDs are passed to `getProductsByIds` GraphQL query
6. Full product details are fetched from BigCommerce
7. Results are transformed using the existing `searchResultsTransformer`
8. UI displays products, categories, and brands (same as before)

**Search Request Structure:**
```javascript
{
  placement: "projects/{project}/locations/{location}/catalogs/{catalog}/servingConfigs/{config}",
  branch: "projects/{project}/locations/{location}/catalogs/{catalog}/branches/0",
  query: "user search term",
  pageSize: 10,
  visitorId: "unique-visitor-id"
}
```

**Response Structure:**
```javascript
// Response is a tuple: [results[], request, response]
const [searchResults, , fullResponse] = await searchClient.search(request);
// searchResults[0].id = "product-169"
// fullResponse.attributionToken, totalSize, etc.
```

## Fallback Behavior

- If `ENABLE_VERTEX_RETAIL_SEARCH=false` or not set, the original BigCommerce search is used
- If Vertex API fails, an error is returned but the site continues to function
- Feature-flagged for easy A/B testing or gradual rollout

## Troubleshooting

### "No matching version found for @google-cloud/retail"
- Make sure you're using version `^4.2.1` (not `^3.7.0`)

### "Failed to parse GCP_SERVICE_ACCOUNT_KEY"
- Ensure the JSON is valid and properly escaped in `.env.local`
- Try wrapping in single quotes: `GCP_SERVICE_ACCOUNT_KEY='{"type":"service_account",...}'`

### "Getting metadata from plugin failed with error: error:1E08010C:DECODER routines::unsupported"
- This error was caused by the private key newlines not being properly interpreted
- **Fixed**: The client now automatically converts literal `\n` strings to actual newlines
- You can use the service account JSON exactly as provided, no manual escaping needed
- The fix handles the environment variable storing `\n` as two literal characters

### "No results found"
- Check that products have been imported into Vertex Retail catalog
- Verify product IDs in Vertex match BigCommerce product IDs (use `product-{ID}` format)
- Check the console for `[Vertex Search]` logs to see extracted IDs
- Ensure indexing is complete in Vertex Retail
- Verify `VERTEX_RETAIL_PLACEMENT` is set correctly
- Check that the `branch` parameter is included in search request

### Authentication errors
- Verify service account has `roles/retail.admin` role
- Check that the service account key is valid and not expired
- Ensure the project ID matches in both `.env.local` and the service account

## Next Steps

After testing the search-as-you-type integration, the following phases can be implemented:

- **Phase 2**: Full search results page with Vertex Search API
- **Phase 3**: Category/Brand PLPs with Browse endpoints
- **Phase 4**: Faceted search with Vertex API
- **Phase 5**: Conversational search integration

## Performance Considerations

- Search API typically responds in 50-400ms
- Results are limited to 5 products to keep response times fast
- BigCommerce product hydration adds 100-300ms
- Total end-to-end latency: 150-700ms
- Currency and customer access tokens are passed through for proper pricing
- React `cache()` wrapper prevents duplicate requests within a render cycle

## Cost Optimization

- Search API pricing applies per request
- Only fetch full product details for the top 5 suggestions
- Consider caching Vertex responses for popular queries
- Monitor API usage in Google Cloud Console
- Use `autoPaginate: false` to control result set size
