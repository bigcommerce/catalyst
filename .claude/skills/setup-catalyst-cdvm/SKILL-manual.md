---
name: setup-catalyst-cdvm-manual
description: Use when setting up Catalyst on your local CDVM dev store. The starting point is already having a running CDVM cluster and dev store. It handles catalyst profile activation, OAuth token creation, channel and site creation, storefront token generation, and local env configuration. The user will be prompted during the process either to provide store or cluster information, or to do store config steps.
---

# Setup Catalyst on a Local Dev Store

> **Note:** `{cdvmPath}` was set during the path detection step in `SKILL.md`. Use it in place of the `cloud-dev-vm` directory path throughout these steps.

## Step 1: Confirm Store ID

Ask the user:

> The default store ID is **10000000**. Is this correct, or would you like to use a different store ID?

Wait for confirmation or a new store ID before proceeding.

## Step 2: Dev Store Hash

Ask the user:

> Please enter your dev store hash (e.g. `abc123xyz`).

Wait for the store hash before proceeding.

## Step 3: CDVM Cluster Name

Ask the user:

> Please enter your CDVM cluster name (e.g. `evelineshore`).

Wait for the cluster name before proceeding.

## Step 4: Create OAuth Token

Run the following command from the `~/dev/cloud-dev-vm` directory using the confirmed store ID:

```bash
cd {cdvmPath} && bcli store oauth token create --store_id {storeId} --cluster {clusterName}
```

Show the user the exact command output. Save the `accessToken` from the result for use in subsequent steps.

## Step 5: Activate Catalyst Profile

From the same `{cdvmPath}` directory, run:

```bash
cd {cdvmPath} && bcli profiles activate catalyst
```

If this fails, fall back to:

```bash
cd {cdvmPath} && ./bcloud profiles activate catalyst
```

Show the user the exact command output.

## Step 6: Enable AdditionalStorefronts

Prompt the user to:

1. Go to `https://store-{storeHash}.store.bcdev/tools/assetsmanager.php`
2. Find the `AdditionalStorefronts` store config and set its value to **2** or more.

Wait for the user to confirm before proceeding.

## Step 7: Enable Multi-Storefront

Prompt the user to:

1. Go to `https://store-{storeHash}.store.bcdev/manage/ninja/msf`
2. Click the **"Enable all"** button

> **Note:** You must be logged in as an admin/staff user to access this page.

Wait for the user to confirm before proceeding.

## Step 8: Create Catalyst Channel

Make a POST request to create a Catalyst channel:

```bash
curl -X POST https://api.service.bcdev/stores/{storeHash}/v3/channels \
  -H "X-Auth-Token: {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Catalyst",
    "type": "Storefront",
    "platform": "catalyst"
  }'
```

Save the `id` from the response as `channelId` for use in subsequent steps and show the user the output.

## Step 9: Create Site for Channel

Make a POST request to create a site for the new channel:

```bash
curl -X POST https://api.service.bcdev/stores/{storeHash}/v3/channels/{channelId}/site \
  -H "X-Auth-Token: {accessToken}" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{
    "url": "catalyst-demo.site",
    "channelId": {channelId}
  }'
```

Show the user the exact response output.

## Step 10: Generate Storefront Token

Make a POST request to generate a storefront API token:

```bash
curl -X POST https://api.service.bcdev/stores/{storeHash}/v3/storefront/api-token \
  -H "X-Auth-Token: {accessToken}" \
  -H "Content-Type: application/json" \
  -d "{
    \"channel_ids\": [],
    \"expires_at\": $(date -v+1y +%s),
    \"allowed_cors_origins\": []
  }"
```

Show the user the exact response output. Save the `token` from the response as `storefrontToken` for use in the next step.

## Step 11: Configure .env.local

If `.env.local` does not exist in the repo root, copy `.env.example` to `.env.local` first.

Set the following values in `.env.local`:

```
BIGCOMMERCE_CHANNEL_ID=1
BIGCOMMERCE_STORE_HASH={storeHash}
BIGCOMMERCE_STOREFRONT_TOKEN={storefrontToken}
BIGCOMMERCE_GRAPHQL_API_DOMAIN="store.bcdev"
BIGCOMMERCE_ADMIN_API_HOST="api.service.bcdev"
NEXT_PUBLIC_BIGCOMMERCE_CDN_HOSTNAME="cdn.store.bcdev,{clusterName}-cloud-dev-vm.store.bcdev"
AUTH_SECRET={run `openssl rand -hex 32` in your terminal}
# Disables TLS certificate validation, allowing self-signed or invalid certs.
# Useful for local development or testing with untrusted SSL endpoints.
NODE_TLS_REJECT_UNAUTHORIZED="0"
```

## Step 12: Start Storefront Service

Ask the user:

> The storefront service needs to be running for Catalyst to work without schema errors. This command can take a while — skip it if you're sure the storefront service is already running. Should I start it now?

If the user confirms → run:

```bash
cd {cdvmPath} && bcli service start storefront
```

Show the user the command output. If the user skips → proceed to the next step.

## Step 13: Run Catalyst Locally

Prompt the user to:

> Run Catalyst locally via `pnpm run dev` as instructed in the README, then open the dev Catalyst storefront at `http://localhost:3000` (or the URL shown by the dev command). You should see the Catalyst store with the default sample products and be able to see your Catalyst changes live.