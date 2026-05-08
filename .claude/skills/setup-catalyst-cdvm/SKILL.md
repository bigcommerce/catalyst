---
name: setup-catalyst-cdvm
description: Use when setting up Catalyst on a local CDVM dev store. Requires an existing CDVM cluster.
---

# Setup Catalyst on a Local Dev Store

## Prerequisite: Confirm cloud-dev-vm Path

Check if `cloud-dev-vm` exists as a sibling of the current Catalyst directory:

```bash
ls "$(dirname $(pwd))/cloud-dev-vm" 2>/dev/null && echo "exists" || echo "not found"
```

- If it exists → use `$(dirname $(pwd))/cloud-dev-vm` as `cdvmPath`
- If not found → ask the user:

> Could not find `cloud-dev-vm` at the expected path (`../cloud-dev-vm` relative to this repo). Please provide the full path to your `cloud-dev-vm` directory.

Save the result as `cdvmPath`. Use it in place of `~/dev/cloud-dev-vm` throughout all subsequent steps.

---

## Choose Your Setup Path

Before starting, ask the user which setup path they prefer:

> There are two ways to set up Catalyst on your local dev store:
>
> **Option A — Automated** *(recommended)*
> - Automatically detects your cluster and store via `bcli`
> - Minimal input required — only manual store config steps need your attention
> - Requires `bcli` to be available and a CDVM cluster to exist (does not need to be running)
> - **Processing time:** Longer — may include cluster resume polling and BMP service startup
>
> **Option B — Manual**
> - You provide the cluster name, store ID, and store hash yourself
> - Useful if you want full control
> - Requires a running CDVM cluster and active dev store upfront
> - **Processing time:** Faster — no auto-detection overhead, proceeds immediately with the info you provide
>
> Which would you like to use? (A/B)

- If **A** → proceed with the automated steps below
- If **B** → read and follow `.claude/skills/setup-catalyst-cdvm/SKILL-manual.md`

---

## Step 1: Auto-detect Cluster

Run from `~/dev/cloud-dev-vm`:

```bash
cd {cdvmPath} && bcli clusters list
```

- If one cluster → use it automatically and inform the user of the cluster name
- If multiple clusters → show the cluster names and prompt the user to choose one

Save the result as `clusterName`.

Check the `STATUS` column of the selected cluster:
- If `RUNNING` → proceed
- If not `RUNNING` → inform the user and run:

```bash
cd {cdvmPath} && bcli clusters resume --cluster {clusterName}
```

Then poll every 30 seconds until the status is `RUNNING`:

```bash
cd {cdvmPath} && bcli clusters list
```

Inform the user of the current status after each check (e.g. "Cluster is not running yet, rechecking in 30 seconds..."). Once `RUNNING`, inform the user and proceed.

## Step 2: Get Store Details

Run:

```bash
cd {cdvmPath} && bcli store list --cluster {clusterName}
```

> **Note:** This command may take longer than expected if the BMP service is stopped — `bcli` will pull and start it automatically. If this happens, inform the user and wait for the command to fully complete before proceeding.

- If one active store → show the store details to the user and confirm before proceeding. Extract `Store ID` as `storeId` and `Store Hash` as `storeHash`.
- If multiple stores → show the list and prompt the user to choose one
- If no active store → prompt the user:

> No active store found. Would you like to create one? Run: `bcli stores create --cluster {clusterName}`

Wait for the user to confirm before proceeding.

## Step 3: Create OAuth Token

Run the following command from the `~/dev/cloud-dev-vm` directory:

```bash
cd {cdvmPath} && bcli store oauth token create --store_id {storeId} --cluster {clusterName}
```

Show the user the exact command output. Save the `accessToken` from the result for use in subsequent steps.

## Step 4: Activate Catalyst Profile

From the same `{cdvmPath}` directory, run:

```bash
cd {cdvmPath} && bcli profiles activate catalyst
```

If this fails, fall back to:

```bash
cd {cdvmPath} && ./bcloud profiles activate catalyst
```

Show the user the exact command output.

## Step 5: Enable AdditionalStorefronts

Prompt the user to:

1. Go to `https://store-{storeHash}.store.bcdev/tools/assetsmanager.php`
2. Find the `AdditionalStorefronts` store config and set its value to **2** or more

Wait for the user to confirm before proceeding.

## Step 6: Enable Multi-Storefront

Prompt the user to:

1. Go to `https://store-{storeHash}.store.bcdev/manage/ninja/msf`
2. Click the **"Enable all"** button

> **Note:** You must be logged in as an admin/staff user to access this page.

Wait for the user to confirm before proceeding.

## Step 7: Create Catalyst Channel

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

## Step 8: Create Site for Channel

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

## Step 9: Generate Storefront Token

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

## Step 10: Configure .env.local

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

## Step 11: Start Storefront Service

Ask the user:

> The storefront service needs to be running for Catalyst to work without schema errors. This command can take a while — skip it if you're sure the storefront service is already running. Should I start it now?

If the user confirms → run:

```bash
cd {cdvmPath} && bcli service start storefront
```

Show the user the command output. If the user skips → proceed to the next step.

## Step 12: Run Catalyst Locally

Check if dependencies are installed:

```bash
ls node_modules 2>/dev/null && echo "installed" || echo "not found"
```

- If not found → inform the user and run in the Catalyst directory:

```bash
nvm use 24 && pnpm install
```

- If found → proceed

Open a new Terminal window and run the dev server in the Catalyst directory so the user can see the full output:

```bash
osascript -e "tell application \"Terminal\" to do script \"cd $(pwd) && nvm use 24 && pnpm run dev\""
```

Inform the user that a new terminal window has opened running `pnpm run dev`, and to look there for the local URL (typically `http://localhost:3000`).
