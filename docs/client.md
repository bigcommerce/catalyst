# Catalyst Client

Catalyst allows you to retrieve info from BigCommerce's APIs through the Catalyst Client.<br /><br />

```ts
import { client } from '~/client';
```

The client simplifies what you need to do to handle requests and responses. For example, you don't need to construct request URLs, configure request headers, or parse JSON responses. The client uses the channel ID and authorization tokens configured in the `.env` file by default.

## Methods

- `fetch()`: allows you to interact with BigCommerce's [GraphQL Storefront API](https://developer.bigcommerce.com/docs/storefront/graphql). You can execute all queries and mutations available in [BigCommerce's Storefront graph](https://developer.bigcommerce.com/graphql-storefront/reference).

- `fetchSitemapIndex(channelId?: string)`: fetches the sitemap index for the store, which provides a URL to the XML sitemap.

### Deprecated

The following method is deprecated and requires the `BIGCOMMERCE_ACCESS_TOKEN` to be set in the `.env` file.

- `fetchShippingZones()`: retrieves shipping zones for the BigCommerce store. It sends an HTTP GET request to the [BigCommerce Management API](https://developer.bigcommerce.com/docs/rest-management/shipping-v2/shipping-zones), but simplifies how you would make a direct request to fetch shipping zones.

## Fetch

The following sections describe the `fetch()` method.

### Parameters

| Parameter name | Type | Required? | Description |
| - | - | - | - |
| `document` | object `DocumentDecoration<TResult, TVariables>` | Yes | The GraphQL query or mutation you want to execute. It must be in the form of a string or a GraphQL AST (Abstract Syntax Tree) that defines the query. <br /><br /> The `DocumentDecoration` interface supports types from `@graphql-typed-document-node/core` and `TypedQueryDocumentNode`. These ensure the types of variables and results match. The document could be a GraphQL query or mutation. |
| `variables` | object `TVariables` | No | Variables to be passed to the GraphQL query or mutation. |
| `customerId` | string | No | The ID of the customer to impersonate. <br /><br />If you want to fetch data as a specific customer, you can provide their ID here. This will add an `X-Bc-Customer-Id` header to the request. |
| `fetchOptions` | object `FetcherRequestInit` | No |  Custom options for the `fetch` request. <br /><br />`FetcherRequestInit` extends the global `RequestInit` interface in JavaScript, which includes parameters such as `method`, `headers`, `body`, and `options` for caching and credentials. |
| `channelId` | string | No | Allows you to specify a different storefront channel for the request. <br /><br />Defaults to the channel ID in the `.env` file. |

### Request headers

The `fetch` method automatically sets the following headers:

- `"Content-Type": "application/json"`
- `"Authorization": "Bearer <customerImpersonationToken>"`
- `"User-Agent": <backendUserAgent>`
- (Optional) `"X-Bc-Customer-Id"` if you provide a `customerId`

### Return value

The `fetch` method returns a promise that resolves to a response object containing the requested data. The response follows the structure defined in the GraphQL query.

- Return Type: `Promise<BigCommerceResponse<TResult>>`

  The `BigCommerceResponse` type wraps the actual data returned from the API, where `TResult` represents the expected shape of the response data.

  Inside `BigCommerceResponse`, the `data` field holds the actual data returned by the GraphQL API, which matches the structure of the query or mutation you executed.<br /><br />

- `Error Handling`:

  If the response is not `ok` (i.e., the request fails), the method throws a `BigCommerceAPIError`, which includes the HTTP status and any GraphQL errors returned in the response.

### Examples

#### Get product reviews

```ts
import { client } from '~/client';
import { graphql } from '~/client/graphql'; // A utility function for handling GraphQL queries

const GET_PRODUCT_REVIEWS_QUERY = graphql(`
  query getProductReviews($productIds: [Int!]) {
    site {
      products(entityIds: $productIds) {
        edges {
          node {
            reviews {
              edges {
                node {
                  author {
                    name
                  }
                  title
                  text
                }
              }
            }
          }
        }
      }
    }
  }
`);

const response = await client.fetch({
  document: GET_PRODUCT_REVIEWS_QUERY, // GraphQL query
  variables: { productIds: [101, 202] },  // Query variables
  fetchOptions: { cache: 'no-store' }, // Optional fetch options
});

console.log(response.data);
```

The example output in the console:

```ts
{
  "site": {
    "products": [
      {
        "reviews": {
          "edges": [
            {
              "node": {
                "author": {
                  "name": "John Doe"
                },
                "title": "Great product",
                "text": "This product exceeded my expectations!"
              }
            },
            {
              "node": {
                "author": {
                  "name": "Jane Smith"
                },
                "title": "Good value",
                "text": "Worth the price, very satisfied."
              }
            }
          ]
        }
      }
    ]
  }
}
```

#### Error handling

The `BigCommerceAPIError` class provides error handling and is instantiated when the fetch fails.

```ts
if (!response.ok) {
  throw await BigCommerceAPIError.createFromResponse(response);
}
```

### Logging

You can log the request's operation name, type, and execution time to the console, along with the [query complexity](https://developer.bigcommerce.com/docs/storefront/graphql#complexity-limits).

To use this feature, enable logging through the [`CLIENT_LOGGER` environment variable](/docs/environment-variables#client_logger). When you run the `fetch` method, it will invoke the `requestLogger()` function internally to capture and log the information.
