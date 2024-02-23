# Environment Variables
**Reference**

The following reference lists the environment variables that a Catalyst storefront can use, along with a description of their datatypes and approximate values.

## Required

> [!NOTE]
> **On required env vars**
> Catalyst storefronts require the following variables to function.
> If you created your Catalyst storefront using the CLI and chose the option to connect to an existing store, the CLI configured these variables and added them to `.env.local`.

### BIGCOMMERCE_STORE_HASH

> [!NOTE]
> **Type**: string
> **Permanently required**: true
> **CLI-configured**: true

This identifies the BigCommerce store connected to this Catalyst storefront. The store hash is visible as part of the store's canonical URL, and you can also locate the store hash in the control panel URL, which takes the following form.

```shell copy
https://{BIGCOMMERCE_STORE_HASH}.mybigcommerce.com/manage
```

### BIGCOMMERCE_ACCESS_TOKEN

> [!CAUTION]
> **Sensitive secret**: true. Do not expose outside environment variables.
> **Type**: string
> **Permanently required**: false
> **CLI-configured**: true <!-- ?? -->

Catalyst requires this access token to make a few key API calls to the Management API and the Customer Login API. This dependency will be removed in a future version of Catalyst.

The CLI will prompt you to enter this access token. The following brief steps will help you create the necessary API account and collect the access token.

#### Creating the access token

In the control panel of the subject store, [create a store-level API account](https://developer.bigcommerce.com/docs/start/authentication/api-accounts#creating-store-level-api-credentials) and add the following OAuth scopes. To learn more, see [OAuth scopes](https://developer.bigcommerce.com/docs/start/authentication/api-accounts#store-resource-scopes).

| UI Name | Permission | Parameter | Required |
|:--------|:-----------|:----------|:---------|
| Carts | modify| `store_cart` | true. See [Carts](#carts). |
| Customers Login | modify | `store_v2_customers_login` | false. See [Customer Login](#customer-login). |

The value of `BIGCOMMERCE_ACCESS_TOKEN` is the access token that's automatically generated when you create this API account.

#### Carts

The call to the carts feature of Management API generates checkout redirect URLs. This dependency will be removed in a future version of Catalyst.

#### Customer Login

If you want to support checkout for signed-in customers, add the Customers Login scope so you can generate valid Customer Login JWTs to pass to the [Customer Login API](https://developer.bigcommerce.com/docs/start/authentication/customer-login). To learn more, see [BIGCOMMERCE_CLIENT_SECRET](#bigcommerce_client_secret).

### BIGCOMMERCE_CUSTOMER_IMPERSONATION_TOKEN

> [!CAUTION]
> **Sensitive secret**: true. Do not expose outside environment variables.
> **Type**: string
> **Permanently required**: true
> **CLI-configured**: true

This bearer token authorizes access to the [GraphQL Storefront API](https://developer.bigcommerce.com/docs/storefront/graphql) and supports operations that request information specific to individual customers, such as getting wishlist items.

**Without the CLI**
Create a store-level or app-level API account with the following token creation scope, then use the API account access token to [Create a customer impersonation token](https://developer.bigcommerce.com/docs/rest-authentication/tokens/customer-impersonation-token#create-a-token).

| UI Name | Permission | Parameter |
|:--------|:-----------|:----------|
| Storefront API Customer Impersonation Tokens | modify | `store_storefront_api_customer_impersonation` |

### BIGCOMMERCE_CHANNEL_ID

> [!NOTE]
> **Type**: integer
> **Permanently required**: true
> **CLI-configured**: true

This is the numeric channel ID that specifies which [sales channel](https://developer.bigcommerce.com/docs/rest-management/channels#channels) is associated with your Catalyst storefront.

**Without the CLI**
We recommend that you create a new channel of type `storefront` and platform `catalyst`, although Catalyst will still function if you use an existing channel ID that references a different storefront-type channel.

The default Stencil storefront that comes with every BigCommerce store by default has a channel ID of `1`. We do not recommend using any Stencil channel for a transactional Catalyst storefront, as Stencil channels do not support many headless features.

### AUTH_SECRET

> [!CAUTION]
> **Sensitive secret**: true. Do not expose outside environment variables.
> **Type**: string, hexadecimal
> **Permanently required**: true
> **CLI-configured**: true

NextAuth uses this pseudo-random hex string to sign session JWTs. 

**Without the CLI**
To generate, open the terminal and run the following command, then copy-paste the output into your environment variables file. Learn more about how generation works under the hood in the [OpenSSL docs](https://www.openssl.org/docs/manmaster/man1/openssl-rand.html).

```shell copy
openssl rand -hex 32
```

## Recommended

Catalyst does not require the following values to run, but we recommend setting them for optimal performance.

### TURBO_REMOTE_CACHE_SIGNATURE_KEY

> [!CAUTION]
> **Sensitive secret**: true. Do not expose outside environment variables.
> **Type**: string, hexadecimal
> **Default**: no value
> **Required**: false
> **CLI-configured**: false
> **Recommended**: true

Providing a pseudo-random hex string for this environment variable lets you use the [Turborepo Remote Cache feature with signed artifacts](https://turbo.build/repo/docs/core-concepts/remote-caching#artifact-integrity-and-authenticity-verification), which will improve your build performance in Vercel and other environments that use Turborepo.

Do not re-use the value from `AUTH_SECRET`.

To generate, open the terminal and run the following command, then copy-paste the output into your environment variables file. Learn more about how generation works under the hood in the [OpenSSL docs](https://www.openssl.org/docs/manmaster/man1/openssl-rand.html).

```shell copy
openssl rand -hex 32
```

### BIGCOMMERCE_CLIENT_SECRET

> [!CAUTION]
> **Sensitive secret**: true. Do not expose outside environment variables.
> **Type**: string
> **Default**: no value
> **Required**: false
> **CLI-configured**: false
> **Recommended**: true

This is an API account client secret that you can use to sign [Customer Login API](https://developer.bigcommerce.com/docs/start/authentication/customer-login) JWTs. Providing this value lets shoppers preserve their logged-in state when Catalyst redirects them to checkout.

You can use the client secret from the same API account you configured in [BIGCOMMERCE_ACCESS_TOKEN](#bigcommerce_access_token), or configure a dedicated API account with the following scope.

| UI Name | Permission | Parameter |
|:--------|:-----------|:----------|
| Customers Login | modify | `store_v2_customers_login` |

To learn more, see any of the following docs:
* [Customer Login](#customer-login) in this reference
* Guide to the [Customer Login API](https://developer.bigcommerce.com/docs/start/authentication/customer-login), which describes how to make the necessary JWT
* Reference for the endpoint to [Log a customer in](https://developer.bigcommerce.com/docs/rest-authentication/customer-login), which describes how to send the JWT to BigCommerce

### Optional

The following values are related to tuneable parameters of Catalyst which may not be relevant to all users, hosting platforms, or scenarios. Consider which ones are right for your implementation and phase of development.

### ENABLE_ADMIN_ROUTE

> [!NOTE]
> **Type**: boolean
> **Default**: false
> **Required**: false
> **CLI-configured**: false

This is a convenience feature for store admins.

When this option is set to `true`, the Catalyst storefront's admin URL at `https://store.example.com/admin` opens the store control panel at the store's canonical URL, `https://{BIGCOMMERCE_STORE_HASH}.mybigcommerce.com/admin`.

In production, setting this option to `false` improves the security posture of the storefront. 

If you wish to remove this feature entirely from your codebase, you can delete [admin/route.ts](https://github.com/bigcommerce/catalyst/blob/main/apps/core/app/admin/route.ts).

### NEXTAUTH_URL

> [!NOTE]
> **Type**: string, URL
> **Default**: If deployed on Vercel, identical to `VERCEL_URL`. Otherwise, no value.
> **Required**: false
> **CLI-configured**: false

The `NEXTAUTH_URL` environment variable tells the [NextAuth library the root URL of the storefront](https://next-auth.js.org/configuration/options#nextauth_url).

If your storefront is deployed on Vercel, `NEXTAUTH_URL` is automatically detected from `VERCEL_URL`, but for other environments you should set `NEXTAUTH_URL` explicitly.

### TRAILING_SLASH

> [!NOTE]
> **Type**: boolean
> **Default**: true
> **Required**: false
> **CLI-configured**: false

Catalyst uses the existing URLs of your BigCommerce objects such as products and categories as the URL paths on your storefront.

Default [paths for BigCommerce products, categories, etc.](https://support.bigcommerce.com/s/article/Store-Settings?language=en_US#url-structure) create URLs with a trailing slash, while the [Next.js default behavior](https://nextjs.org/docs/app/api-reference/next-config-js/trailingSlash) does not use trailing slashes on URLs.

This environment variable lets you choose your preferred URL appearance, with or without trailing slashes. This is purely cosmetic and has [no direct SEO implications, although it's a good idea to commit to one URL format](https://developers.google.com/search/blog/2010/04/to-slash-or-not-to-slash). Try not to create entity URLs with mixed cases of trailing-slash and no-trailing-slash -- consistency is key.

The `TRAILING_SLASH` variable defaults to `true`, and must be explicitly set to `false` in order to remove trailing slashes. If you set it to `false`, update your [Store Settings > URL Structure](https://login.bigcommerce.com/deep-links/manage/settings) in the store control panel. Note that this is a currently a global setting, so the option you set will go into effect immediately on all the store's storefronts.