# Using the Cache Proxy

On this branch, you'll find a simple Node.js + Express.js server that acts as a proxy between Catalyst and the BigCommerce GraphQL API.

Its sole purpose is to help you determine if Catalyst is caching the data you expect it to cache.

## How it works

The proxy is a simple Node.js + Express.js server that listens for requests on port 8080.

When it receives a request, it proxies the request to the BigCommerce GraphQL API and returns the response.

Importantly, it logs the request to the console.

This branch also modifies `@bigcommerce/catalyst-client` to fingerprint each outgoing request with a unique hash created from the request's `RequestInit` options and the request URL.

This hash is sent as a header with each outgoing request to the cache proxy server and it logged so that you can trace a request as it moves from Catalyst to the cache proxy.

## How to use (on the `cache-proxy` branch)

### Testing `next dev`

1. Fetch the `cache-proxy` branch from the Catalyst upstream repository

   ```bash
   git fetch whatever-you-named-your-upstream-branch cache-proxy
   ```

2. Switch branches to the `cache-proxy` branch

   ```bash
   git switch cache-proxy
   ```

3. Install the dependencies

   ```bash
   pnpm install
   ```

4. Ensure you have a `CLIENT_LOGGER` environment variable set to `true`

   ```bash
   # .env.local
   CLIENT_LOGGER=true
   ```

5. Start the cache proxy server as well as the Catalyst development server

   ```bash
   pnpm dev
   ```

6. Make a request to the cache proxy server

### Testing `next start`

Follow the same steps as above but replace step 5 with:

5. Run the cache proxy server in a new shell

   ```bash
   pnpm -F "@bigcommerce/catalyst-proxy" dev
   ```

6. In a separate shell, build the Catalyst app

   ```bash
   pnpm -F "@bigcommerce/catalyst-core" build
   ```

7. Start the Catalyst app

   ```bash
   pnpm -F "@bigcommerce/catalyst-core" start
   ```

> ⚠️ If the cache proxy is not running when you run `pnpm -F "@bigcommerce/catalyst-core" build`, build will fail because no requests will be sent from Catalyst, through the cache proxy, to the BigCommerce GraphQL API (because the proxy is not running).

## How to use (when you want to test other branches)

1. Switch to the branch you want to test

   ```bash
   git switch branch-that-you-want-to-test
   ```

2. Fetch the `cache-proxy` branch from the Catalyst upstream repository

   ```bash
   git fetch whatever-you-named-your-upstream-branch cache-proxy
   ```

3. Cherry pick the commit from the `cache-proxy` branch

   ```bash
   git cherry-pick $(git rev-parse origin/cache-proxy) --no-commit
   ```

4. Resume from step 3 above (install dependencies, etc.)
