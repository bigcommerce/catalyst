import { z } from 'zod';

import { httpError } from './http-errors';

export const DEVICE_OAUTH_CLIENT_ID = 'b8063bu6hhml4e0lqh22yut63atsbyv';
export const DEVICE_OAUTH_SCOPES = [
  'store_v2_information',
  'store_storefront_api',
  'store_infrastructure_deployments_manage',
  'store_infrastructure_logs_read_only',
  'store_infrastructure_projects_manage',
  'store_channel_settings',
].join(' ');

export const DEFAULT_LOGIN_URL = 'https://login.bigcommerce.com';

export const DeviceCodeResponseSchema = z.object({
  device_code: z.string(),
  user_code: z.string(),
  verification_uri: z.string(),
  expires_in: z.number(),
  interval: z.number(),
});

export const DeviceCodeSuccessSchema = z.object({
  access_token: z.string(),
  store_hash: z.string(),
  context: z.string(),
  api_uri: z.string(),
});

export async function requestDeviceCode(loginUrl: string) {
  const response = await fetch(`${loginUrl}/device/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: DEVICE_OAUTH_CLIENT_ID,
      scopes: DEVICE_OAUTH_SCOPES,
    }),
  });

  if (!response.ok) {
    throw await httpError(response, 'Failed to request device code');
  }

  const res: unknown = await response.json();

  return DeviceCodeResponseSchema.parse(res);
}

export async function pollDeviceToken(loginUrl: string, deviceCode: string) {
  const response = await fetch(`${loginUrl}/device/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      device_code: deviceCode,
      client_id: DEVICE_OAUTH_CLIENT_ID,
    }),
  });

  if (response.status !== 200) {
    return null;
  }

  const res: unknown = await response.json();

  return DeviceCodeSuccessSchema.parse(res);
}

export async function waitForDeviceToken(
  loginUrl: string,
  deviceCode: string,
  interval: number,
): Promise<z.infer<typeof DeviceCodeSuccessSchema>> {
  const credentials = await pollDeviceToken(loginUrl, deviceCode);

  if (credentials) {
    return credentials;
  }

  await new Promise((resolve) => {
    setTimeout(resolve, interval * 1000);
  });

  return waitForDeviceToken(loginUrl, deviceCode, interval);
}
