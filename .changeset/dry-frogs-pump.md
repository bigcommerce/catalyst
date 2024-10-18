---
"@bigcommerce/catalyst-client": minor
---

GQL requests that respond as `200` but have an `errors` field will now be properly handled by the client and throw a proper `BigCommerceGQLError` response with the message reason from the API. This will provide a more detailed description of why the GQL request errored out.

API errors will still be handled and attribute the errored status as the message with this change as `BigCommerceAPIError`.
