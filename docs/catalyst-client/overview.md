# BigCommerce Catalyst Client

Catalyst allows you to retrieve info from BigCommerce's APIs through the Catalyst Client.

The client allows you to execute all queries and mutations available for the Storefront GraphQL API.

The client simplifies what you need to do to handle queries, requests, and responses. For example, you don't need to construct request URLs, configure request headers, or parse JSON responses. The client uses the channel ID and authorization tokens configured in the `.env` file by default.

Include the following import statements:

```ts
import { client } from '~/client';
import { graphql } from '~/client/graphql'; // A utility function for handling GraphQL queries
```

## Methods

- `client.fetch()`: allows you to interact with BigCommerce's GraphQL Storefront API.

- `client.fetchShippingZones()`: retrieves shipping zones for the BigCommerce store. It sends an HTTP GET request to the BigCommerce Management API, but abstracts the complexity of making a direct API request to fetch shipping zones.

- `client.fetchSitemapIndex(channelId?: string)`: fetches the sitemap index for the store, which provides a URL to the XML sitemap.

- `client.getCanonicalUrl(channelId?: string)`: constructs and returns the canonical URL for the BigCommerce store, optionally including a specific channel ID. This URL is used for constructing various API endpoint URLs and is based on the store's hash and the provided or default channel ID.

- `client.getGraphQLEndpoint(channelId?: string)`: returns the GraphQL endpoint URL for the store, incorporating the optional channel ID to specify which store channel's GraphQL API to access. This URL is used for sending GraphQL queries and mutations.

- `client.requestLogger(document: string)`: provides a logging function that tracks the duration and complexity of GraphQL requests. It logs details such as the operation type, name, request duration, and query complexity, helping with debugging and performance monitoring.
