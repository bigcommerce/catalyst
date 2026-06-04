import { z } from 'zod';

import { assertAuthorized } from './auth-errors';
import { getTelemetry } from './telemetry';

// `origin` is the CLI-API gateway (configured via `--cli-api-origin`, default
// `https://cxm-prd.bigcommerceapp.com`). Distinct from `apiHost` used for the
// BC store API (api.bigcommerce.com).
const cliApiUrl = (origin: string, storeHash: string, path: string) =>
  `${origin}/stores/${storeHash}/cli-api/v3${path}`;

const channelsUrl = (storeHash: string, apiHost: string, query: Record<string, string> = {}) => {
  const params = new URLSearchParams(query).toString();

  return `https://${apiHost}/stores/${storeHash}/v3/channels${params ? `?${params}` : ''}`;
};

const authHeaders = (accessToken: string) => ({
  'X-Auth-Token': accessToken,
  'X-Correlation-Id': getTelemetry().correlationId,
  Accept: 'application/json',
});

// envVars values are coerced to strings: the BC API returns mixed primitives
// (e.g. BIGCOMMERCE_CHANNEL_ID is a number) but they all end up in .env.local as text.
const envVarsSchema = z.record(z.string(), z.coerce.string());

const channelSchema = z.object({
  id: z.number(),
  name: z.string(),
  platform: z.string(),
});

export type Channel = z.infer<typeof channelSchema>;

const channelsResponseSchema = z.object({
  data: z.array(channelSchema),
});

const initResponseSchema = z.object({
  data: z.object({
    storefront_api_token: z.string(),
    envVars: envVarsSchema,
  }),
});

const createChannelResponseSchema = z.object({
  data: z.object({
    id: z.number(),
    storefront_api_token: z.string(),
    envVars: envVarsSchema,
  }),
});

const eligibilityResponseSchema = z.object({
  data: z.object({
    eligible: z.boolean(),
    message: z.string(),
  }),
});

const channelSiteSchema = z.object({
  data: z.object({
    id: z.number(),
    url: z.string(),
    channel_id: z.number(),
  }),
});

export interface ChannelInit {
  storefrontToken: string;
  envVars: Record<string, string>;
}

export async function getChannelInit(
  channelId: number | string,
  storeHash: string,
  accessToken: string,
  origin: string,
): Promise<ChannelInit> {
  const response = await fetch(cliApiUrl(origin, storeHash, `/channels/${channelId}/init`), {
    method: 'GET',
    headers: authHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(
      `GET /channels/${channelId}/init failed: ${response.status} ${response.statusText}`,
    );
  }

  const { data } = initResponseSchema.parse(await response.json());

  return { storefrontToken: data.storefront_api_token, envVars: data.envVars };
}

export interface ChannelEligibility {
  eligible: boolean;
  message: string;
}

export async function checkChannelEligibility(
  storeHash: string,
  accessToken: string,
  origin: string,
): Promise<ChannelEligibility> {
  const response = await fetch(cliApiUrl(origin, storeHash, '/channels/catalyst/eligibility'), {
    method: 'GET',
    headers: authHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error(
      `GET /channels/catalyst/eligibility failed: ${response.status} ${response.statusText}`,
    );
  }

  return eligibilityResponseSchema.parse(await response.json()).data;
}

export interface CreatedChannel {
  channelId: number;
  storefrontToken: string;
  envVars: Record<string, string>;
}

export async function createChannel(
  name: string,
  storefrontLocale: string,
  additionalLocales: string[],
  installSampleData: boolean,
  storeHash: string,
  accessToken: string,
  origin: string,
): Promise<CreatedChannel> {
  const response = await fetch(cliApiUrl(origin, storeHash, '/channels/catalyst'), {
    method: 'POST',
    headers: { ...authHeaders(accessToken), 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      initialData: { type: installSampleData ? 'sample' : 'none' },
      deployStorefront: true,
      devOrigin: 'http://localhost:3000',
      storefrontLanguage: storefrontLocale,
      additionalLocales,
    }),
  });

  if (!response.ok) {
    throw new Error(`POST /channels/catalyst failed: ${response.status} ${response.statusText}`);
  }

  const { data } = createChannelResponseSchema.parse(await response.json());

  return {
    channelId: data.id,
    storefrontToken: data.storefront_api_token,
    envVars: data.envVars,
  };
}

export async function fetchAvailableChannels(
  storeHash: string,
  accessToken: string,
  apiHost: string,
): Promise<Channel[]> {
  const response = await fetch(
    channelsUrl(storeHash, apiHost, { available: 'true', type: 'storefront' }),
    {
      method: 'GET',
      headers: {
        'X-Auth-Token': accessToken,
        'X-Correlation-Id': getTelemetry().correlationId,
        Accept: 'application/json',
      },
    },
  );

  assertAuthorized(response);

  if (!response.ok) {
    throw new Error(`GET /v3/channels failed: ${response.status} ${response.statusText}`);
  }

  return channelsResponseSchema.parse(await response.json()).data;
}

export interface ChannelSite {
  id: number;
  url: string;
  channelId: number;
}

export async function updateChannelSiteUrl(
  channelId: number,
  siteUrl: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
): Promise<ChannelSite> {
  const response = await fetch(
    `https://${apiHost}/stores/${storeHash}/v3/channels/${channelId}/site`,
    {
      method: 'PUT',
      headers: {
        'X-Auth-Token': accessToken,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Correlation-Id': getTelemetry().correlationId,
      },
      body: JSON.stringify({ url: siteUrl }),
    },
  );

  if (response.status === 401 || response.status === 403) {
    throw new Error(
      `Failed to update channel site (${response.status}). Re-run \`catalyst auth login\` to refresh your access token with the store_channel_settings scope.`,
    );
  }

  if (!response.ok) {
    throw new Error(`Failed to update channel site: ${response.status} ${response.statusText}`);
  }

  const res: unknown = await response.json();
  const { data } = channelSiteSchema.parse(res);

  return { id: data.id, url: data.url, channelId: data.channel_id };
}
