# Fetch

The `client.fetch()` method is used to send GraphQL queries or mutations to the BigCommerce Storefront GraphQL API. It allows you to execute a query and pass variables needed for the request. You can handle queries, mutations, and options like caching.

## Parameters

| Parameter name | Type | Required? | Description | Details |
| - | - | - | - | - |
| `document` | object `DocumentDecoration<TResult, TVariables>` | Yes | The GraphQL query or mutation you want to execute. It must be in the form of a string or a GraphQL AST (Abstract Syntax Tree) that defines the query. | The `DocumentDecoration` interface supports types from `@graphql-typed-document-node/core` and `TypedQueryDocumentNode`. These ensure the types of variables and results match. The document could be a GraphQL query or mutation. |
| `variables` | object `TVariables` | No | Variables to be passed to the GraphQL query or mutation. | This is a generic type constrained to `Record<string, unknown>`, meaning it can be any object where the keys are strings and the values are of any type. This allows you to pass variables into the query/mutation dynamically. |
| `customerId` | string | No | The ID of the customer to impersonate. |  If you want to fetch data as a specific customer, you can provide their ID here. This will add an `X-Bc-Customer-Id` header to the request. |
| `fetchOptions` | object `FetcherRequestInit` | No |  Custom options for the `fetch` request. | `FetcherRequestInit` extends the global `RequestInit` interface in JavaScript, which includes parameters such as `method`, `headers`, `body`, and `options` for caching and credentials. |
| `channelId` | string | No | Allows you to specify a different channel for the request. |  If no channelId is provided, the `defaultChannelId` from the `Client` configuration is used. This is useful if you are dealing with a multi-channel setup in BigCommerce. |

## Request headers

The `fetch` method automatically sets the following headers:

- `"Content-Type": "application/json"`
- `"Authorization": "Bearer <customerImpersonationToken>"`
- `"User-Agent": <backendUserAgent>`
- Optionally, `"X-Bc-Customer-Id"` if a `customerId` is provided.

## Return value

The `client.fetch()`s method returns a Promise that resolves to a response object containing the requested data. The response follows the structure defined in the GraphQL query.

- Type: `Promise<BigCommerceResponse<TResult>>`

The `BigCommerceResponse` type wraps the actual data returned from the API, where `TResult` represents the expected shape of the response data.

- `BigCommerceResponse`:

`data`: The actual data returned by the GraphQL API, matching the structure of the query or mutation you executed.

- `Error Handling`:

If the response is not `ok` (i.e., the request fails), the method throws a `BigCommerceAPIError`, which includes the HTTP status and any GraphQL errors returned in the response.

## Logging

If logging is enabled through the `logger` configuration, the request's operation name, type, and execution time are logged, along with the complexity of the query.

## Examples

### Get product reviews

```ts
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
  variables: { productIds: [101, 202] },           // Query variables
  fetchOptions: { cache: 'no-store' }, // Optional fetch options
});

console.log(response.data.site.products); // Access the fetched product reviews
```

An example output in the console:

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
      },
      {
        "reviews": {
          "edges": [
            {
              "node": {
                "author": {
                  "name": "Alex Johnson"
                },
                "title": "Not what I expected",
                "text": "The product quality was lower than expected."
              }
            }
          ]
        }
      }
    ]
  }
}
```

For the `fetchOptions` parameter, you are using `cache: 'no-store'` to prevent the request from being cached. Additional headers can also be passed in `fetchOptions`.  

### Error handling

The `BigCommerceAPIError` class provides error handling and is instantiated when the fetch fails.

```ts
if (!response.ok) {
  throw await BigCommerceAPIError.createFromResponse(response);
}
```
