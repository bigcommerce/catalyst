**Reference**

# Environment variables

The following reference lists the environment variables that a Catalyst storefront can use, along with a description of their data types and approximate values.

## Required

Catalyst storefronts require the following variables to function.

> [!NOTE]
> Required variables are CLI-configured: If you created your Catalyst storefront using the CLI and chose to connect to an existing store, the CLI configured these variables and added them to `.env.local`.

### BIGCOMMERCE_STORE_HASH

| Attribute            | Value  |
| :------------------- | :----- |
| Type                 | string |
| Permanently required | true   |
| CLI-configurable     | true   |

The store hash identifies the BigCommerce store connected to this Catalyst storefront.

The store hash is visible as part of the store's canonical URL, and you can also locate the store hash in the control panel URL, which takes the following form.

```shell copy
https://{BIGCOMMERCE_STORE_HASH}.mybigcommerce.com/manage
```

### BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN

> [!CAUTION]
> This token is a **sensitive secret**. Do not expose outside environment variables.

| Attribute            | Value  |
| :------------------- | :----- |
| Type                 | string |
| Permanently required | true   |
| CLI-configurable     | true   |

This bearer token authorizes access to the [GraphQL Storefront API](https://developer.bigcommerce.com/docs/storefront/graphql) and supports operations that request information specific to individual customers, such as getting wishlist items.

**Without the CLI**
Create a store-level or app-level API account with the following token creation scope. Then use the API account access token to [Create a customer impersonation token](https://developer.bigcommerce.com/docs/rest-authentication/tokens/customer-impersonation-token#create-a-token).

| UI Name                                      | Permission | Parameter                                     |
| :------------------------------------------- | :--------- | :-------------------------------------------- |
| Storefront API Customer Impersonation Tokens | modify     | `store_storefront_api_customer_impersonation` |

### BIGCOMMERCE_CHANNEL_ID

| Attribute            | Value   |
| :------------------- | :------ |
| Type                 | integer |
| Permanently required | true    |
| CLI-configurable     | true    |

This numeric channel ID specifies which [sales channel](https://developer.bigcommerce.com/docs/rest-management/channels#channels) is associated with your Catalyst storefront.

**Without the CLI**
We recommend that you create a new channel of type `storefront` and platform `catalyst`, although Catalyst will still function if you use an existing channel ID that references a channel that has a different storefront type.

The default Stencil storefront that comes with every BigCommerce store by default has a channel ID of `1`. We do not recommend using any Stencil channel for a transactional Catalyst storefront, as Stencil channels do not support many headless features.

### AUTH_SECRET

> [!CAUTION]
> This token is a **sensitive secret**. Do not expose outside environment variables.

| Attribute            | Value               |
| :------------------- | :------------------ |
| Type                 | string, hexadecimal |
| Permanently required | true                |
| CLI-configurable     | true                |

Auth.js, formerly NextAuth, uses this pseudo-random hex string to sign session JWTs.

**Without the CLI**
To generate, open the terminal and run the following command. Then copy-paste the output into your environment variables file. Learn more about how generation works under the hood in the [OpenSSL docs](https://www.openssl.org/docs/manmaster/man1/openssl-rand.html).

```shell copy
openssl rand -hex 32
```

## Recommended

Catalyst does not require the following values, but we recommend setting them for optimal performance.

### TURBO_REMOTE_CACHE_SIGNATURE_KEY

> [!CAUTION]
> This token is a **sensitive secret**. Do not expose outside environment variables.

| Attribute        | Value               |
| :--------------- | :------------------ |
| Type             | string, hexadecimal |
| Default          | no value            |
| Required         | false               |
| CLI-configurable | false               |
| Recommended      | true                |

Providing a pseudo-random hex string for this environment variable lets you use the [Turborepo Remote Cache feature with signed artifacts](https://turbo.build/repo/docs/core-concepts/remote-caching#artifact-integrity-and-authenticity-verification), which will improve your build performance in Vercel and other environments that use Turborepo.

Do not re-use the value from `AUTH_SECRET`.

To generate, open the terminal and run the following command. Then copy-paste the output into your environment variables file. Learn more about how generation works under the hood in the [OpenSSL docs](https://www.openssl.org/docs/manmaster/man1/openssl-rand.html).

```shell copy
openssl rand -hex 32
```

## Optional

The following values relate to Catalyst's tuneable parameters, which may not be relevant to all users, hosting platforms, or scenarios. Consider which ones are right for your implementation and development phase.

### ENABLE_ADMIN_ROUTE

| Attribute        | Value   |
| :--------------- | :------ |
| Type             | boolean |
| Default          | false   |
| Required         | false   |
| CLI-configurable | false   |

This is a convenience feature for store admins.

When this option is set to `true`, the Catalyst storefront's admin URL at `https://store.example.com/admin` opens the store control panel at the store's canonical URL, `https://{BIGCOMMERCE_STORE_HASH}.mybigcommerce.com/admin`.

In production, setting this option to `false` improves the security posture of the storefront.

If you wish to remove this feature entirely from your codebase, you can delete [admin/route.ts](https://github.com/bigcommerce/catalyst/blob/main/core/app/admin/route.ts).

### NEXTAUTH_URL

| Attribute        | Value                                                                  |
| :--------------- | :--------------------------------------------------------------------- |
| Type             | string, URL                                                            |
| Default          | If deployed on Vercel, identical to `VERCEL_URL`. Otherwise, no value. |
| Required         | false                                                                  |
| CLI-configurable | false                                                                  |

The `NEXTAUTH_URL` environment variable tells the [Auth.js library the root URL of the storefront](https://next-auth.js.org/configuration/options#nextauth_url).

If your storefront is deployed on Vercel, `NEXTAUTH_URL` is automatically detected from `VERCEL_URL`, but for other environments, you should set `NEXTAUTH_URL` explicitly.

### TRAILING_SLASH

| Attribute        | Value   |
| :--------------- | :------ |
| Type             | boolean |
| Default          | true    |
| Required         | false   |
| CLI-configurable | false   |

This environment variable lets you choose your preferred URL appearance, with or without trailing slashes. This is purely cosmetic and has [no direct SEO implications, although it's a good idea to commit to one URL format](https://developers.google.com/search/blog/2010/04/to-slash-or-not-to-slash). Try not to create entity URLs with mixed cases of trailing slash and no-trailing slash—consistency is key.

The `TRAILING_SLASH` variable defaults to `true` and must be explicitly set to `false` to remove trailing slashes. If you set it to `false`, update your [Store Settings > URL Structure](https://login.bigcommerce.com/deep-links/manage/settings) in the store control panel. Note that this is a global setting, so the option you set will go into effect immediately on all the store's storefronts.

Catalyst uses the existing URLs of your BigCommerce objects, such as products and categories, as the URL paths on your storefront. Default [paths for BigCommerce products, categories, etc.](https://support.bigcommerce.com/s/article/Store-Settings#url-structure) create URLs with a trailing slash, while the [Next.js default behavior](https://nextjs.org/docs/app/api-reference/next-config-js/trailingSlash) does not use trailing slashes on URLs.

### DEFAULT_REVALIDATE_TARGET

| Attribute        | Value                                          |
| :--------------- | :--------------------------------------------- |
| Type             | integer representing seconds or boolean: false |
| Default          | 0                                              |
| Required         | false                                          |
| CLI-configurable | false                                          |

This environment variable sets a sensible revalidation target for cached requests.

NextJS persists cached queries in its [data cache](https://nextjs.org/docs/app/building-your-application/caching#data-cache). By default, the time persisted is not defined. For more information on how revalidate works, see [next.revalidate](https://nextjs.org/docs/app/api-reference/functions/fetch#optionsnextrevalidate).

### CLIENT_LOGGER

| Attribute        | Value   |
| :--------------- | :------ |
| Type             | boolean |
| Default          | false   |
| Required         | false   |
| CLI-configurable | true    |

This environment variable turns the [request logger](/docs/client#logging) built into the Catalyst API client on and off.

When enabled, the client logger logs the following information:

- Which GraphQL operation is being performed; for example, `getProducts`.
- How long the request took in milliseconds.
- The complexity score of the GraphQL request payload, as indicated by the `X-Bc-Graphql-Complexity` response header.

### WEBPACK_MAX_CHUNKS

| Attribute        | Value   |
| :--------------- | :------ |
| Type             | integer |
| Default          | 50      |
| Required         | false   |
| CLI-configurable | false   |

This environment variable sets a limit on the number of JS chunks webpack will generate via the `LimitChunkCountPlugin` in `next.config.js`. Generally speaking, using more chunks can improve performance, but will increase the number of requests to the origin to download these files. For hosts that charge for each asset request, this may make your site more expensive to serve. You can decrease this number to decrease the number of individual JS files that will be requested on each page, but each file will be larger, which may decrease Lighthouse scores due to more time spent on script parsing and more unused JS code in each chunk on a given page.

### BIGCOMMERCE_TRUSTED_PROXY_SECRET

> [!CAUTION]
> This token is a **sensitive secret**. Do not expose outside environment variables.

| Attribute        | Value    |
| :--------------- | :------- |
| Type             | string   |
| Default          | no value |
| Required         | false    |
| CLI-configurable | false    |

If BigCommerce has provided you with a Trusted Proxy secret, you may set it using this environment variable to have it automatically sent as a header on requests.
