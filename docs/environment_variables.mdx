## Environment Variables

### Required
The following variables are required in order for Catalyst storefronts to function.

#### `BIGCOMMERCE_STORE_HASH`

> [!NOTE]
> This was automatically configured in `.env.local` if you created your Catalyst storefront using the CLI and chose the option to connect to an existing store.

This identifies the BigCommerce store to which this Catalyst storefront is connected. The store hash is visible as part of the Control Panel URL, which will be of the form `https://store-HASH.mybigcommerce.com/manage`.

#### `BIGCOMMERCE_ACCESS_TOKEN`

> [!CAUTION]
> This is a sensitive secret and should not be exposed outside of your environment variables.

> [!NOTE]
> This was automatically configured in `.env.local` if you created your Catalyst storefront using the CLI and chose the option to connect to an existing store.

> [!NOTE]
> An Admin API access token is only temporarily required, and will be removed in a future version of Catalyst which removes direct dependency on the Admin API.

This is an [Admin API token](https://support.bigcommerce.com/s/article/Store-API-Accounts?language=en_US#creating) for connecting to the BigCommerce Admin API for a critical API call Catalyst uses to generate Checkout Redirect URLs. The only [OAuth scope](https://developer.bigcommerce.com/docs/start/authentication/api-accounts#store-resource-scopes) required for this to work correctly is `store_cart_read_only`. If you wish to support checkout for logged-in customers, you should also add the `store_v2_customers_login` scope so that your [Client Secret](#bigcommerce_client_secret) can be used to generate valid Customer Login API JWTs.

#### `BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN`

> [!CAUTION]
> This is a sensitive secret and should not be exposed outside of your environment variables.

> [!NOTE]
> This was automatically configured in `.env.local` if you created your Catalyst storefront using the CLI and chose the option to connect to an existing store.

This is the token that authorizes access to the [GraphQL Storefront API](https://developer.bigcommerce.com/docs/storefront/graphql) that Catalyst uses for almost all of its interactions with the BigCommerce platform. This uses the special "Customer Impersonation" type of token which allows the Catalyst storefront to be the authority on which customer is considered logged in based on the session, and requests information from the perspective of that customer. Making the headless storefront layer responsible for this allows for lots of flexibility in how shoppers are authenticated, but it also means that this token is a secret and should never be exposed to end users or the browser. This should be automatically configured if you create a Catalyst storefront using the CLI.

#### `BIGCOMMERCE_CHANNEL_ID`

> [!NOTE]
> This was automatically configured in `.env.local` if you created your Catalyst storefront using the CLI and chose the option to connect to an existing store.

This is the numeric channel ID that specifies which [selling channel](https://developer.bigcommerce.com/docs/rest-management/channels#channels) this storefront services. It is strongly recommended to create a new Channel for your Catalyst storefront and specify it as type `storefront` and platform `catalyst`, although Catalyst will still function if you use an existing channel ID that references a different type of channel. The channel ID `1` is reserved for the default Stencil storefront that is pre-provisioned with every BigCommerce storefront, and re-using this channel for a transactional Catalyst storefront is strongly discouraged as it is not compatible with many of the features of BigCommerce that cater to headless storefronts. However, this can be a fast way to preview your existing storefront data through a Catalyst storefront if desired.

#### `AUTH_SECRET`

> [!CAUTION]
> This is a sensitive secret and should not be exposed outside of your environment variables.

> [!NOTE]
> This was automatically configured in `.env.local` if you created your Catalyst storefront using the CLI and chose the option to connect to an existing store.

This is used by NextAuth to sign session JWTs. To generate, run `openssl rand -hex 32` in your terminal. This should be automatically configured if you create a Catalyst storefront using the CLI.

### Recommended
The following values are not necessary for Catalyst to run but are recommended for it to function optimally.


#### `TURBO_REMOTE_CACHE_SIGNATURE_KEY`
Recommended so that you can use [Turborepo's Remote Cache feature with signed artifacts](https://turbo.build/repo/docs/core-concepts/remote-caching#artifact-integrity-and-authenticity-verification) which will improve your build performance in Vercel and other environments that use turbo. This can also be generated with `openssl rand -hex 32`, but do not re-use the value from `AUTH_SECRET`.

#### `BIGCOMMERCE_CLIENT_SECRET`

> [!CAUTION]
> This is a sensitive secret and should not be exposed outside of your environment variables.

> [!NOTE]
> An Admin API Client Secret is only temporarily required, and will be removed in a future version of Catalyst which removes direct dependency on the Admin API.

This is a Client Secret used to sign [Customer Login API](https://developer.bigcommerce.com/docs/start/authentication/customer-login) JWTs to allow shoppers to preserve their logged-in state when redirecting to checkout. You can create this by creating an [API Account](https://support.bigcommerce.com/s/article/Store-API-Accounts?language=en_US#creating) and being sure to select the `Cart - Read Only` and `Customer Login` scopes required for Catalyst to work properly. This value is _not_ populated programmatically today, and you will need to create an API Account specific to your Catalyst storefront to support logged-in customer checkout while this dependency still exists.

### Optional
The following values are related to tuneable parameters of Catalyst which may not be relevant to all users, hosting platforms, or scenarios. Consider which ones are right for you.

#### `ENABLE_ADMIN_ROUTE`
Enabling this by setting it to `true` causes the `/admin` path on the storefront to route to the connected BigCommerce Store's Control Panel, as a convenience feature for store admins. This can be disabled for production to improve the security posture of the storefront, and it will be disabled by default if no value is specified. If you wish to remove this feature entirely from your codebase, you can delete [`admin/route.ts`](https://github.com/bigcommerce/catalyst/blob/main/apps/core/app/admin/route.ts).

#### `NEXTAUTH_URL`
This tells the [NextAuth library the root URL of the headless storefront](https://next-auth.js.org/configuration/options#nextauth_url). When deployed to Vercel, this will be automatically detected from `VERCEL_URL`, but for other environments you should set it explicitly.

#### `TRAILING_SLASH`
Catalyst uses the existing URLs of your BigCommerce objects such as Products and Categories as the URL paths on your storefront. The default [URL generation](https://support.bigcommerce.com/s/article/Store-Settings?language=en_US#url-structure) in BigCommerce creates URLs with a trailing slash, while [Next.js' default behavior](https://nextjs.org/docs/app/api-reference/next-config-js/trailingSlash) is to prefer no trailing slash on URLs. This environment variable exists to allow you to choose your preferred URL appearance, with or without trailing slash. This is purely cosmetic and has [no direct SEO implications, although it's a good idea to pick one option and stick with it](https://developers.google.com/search/blog/2010/04/to-slash-or-not-to-slash). This defaults to `true` and must be explicitly set to `false` in order to remove trailing slashes. If you set it to `false` it is recommended to also update your URL Structure Settings in BigCommerce to match, and try not to create entity URLs with mixed cases of trailing-slash and no-trailing-slash - consistency is key.