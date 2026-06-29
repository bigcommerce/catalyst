import { z } from 'zod';

import { assertAuthorized } from './auth-errors';
import { formatV3Error } from './observability';
import { getTelemetry } from './telemetry';

export const domainStatusSchema = z.enum(['pending', 'verified', 'failed', 'unknown']);

export type DomainStatus = z.infer<typeof domainStatusSchema>;

const domainSchema = z.object({
  domain: z.string(),
  project_uuid: z.string(),
  verification_status: domainStatusSchema,
});

const domainResponseSchema = z.object({
  data: domainSchema,
});

export type Domain = z.infer<typeof domainSchema>;

const DOMAINS_API_NOT_ENABLED =
  'Infrastructure Domains API not enabled. If you are part of the alpha, contact support@bigcommerce.com to enable it.';

function domainsUrl(storeHash: string, projectUuid: string, apiHost: string) {
  return `https://${apiHost}/stores/${storeHash}/v3/infrastructure/projects/${projectUuid}/domains`;
}

function domainUrl(storeHash: string, projectUuid: string, domain: string, apiHost: string) {
  return `${domainsUrl(storeHash, projectUuid, apiHost)}/${encodeURIComponent(domain)}`;
}

function authHeaders(accessToken: string) {
  return {
    Accept: 'application/json',
    'X-Auth-Token': accessToken,
    'X-Correlation-Id': getTelemetry().correlationId,
  };
}

async function getErrorMessage(response: Response, fallback: string): Promise<string> {
  const body: unknown = await response.json().catch(() => null);

  return formatV3Error(body) ?? fallback;
}

async function assertDomainResponse(response: Response, fallback: string): Promise<void> {
  assertAuthorized(response);

  if (response.status === 403) {
    throw new Error(DOMAINS_API_NOT_ENABLED);
  }

  if (!response.ok) {
    throw new Error(await getErrorMessage(response, fallback));
  }
}

export async function createDomain(
  domain: string,
  projectUuid: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
): Promise<Domain> {
  const response = await fetch(domainsUrl(storeHash, projectUuid, apiHost), {
    method: 'POST',
    headers: {
      ...authHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ domain }),
  });

  await assertDomainResponse(response, `Failed to add domain: ${response.statusText}`);

  const result: unknown = await response.json();

  return domainResponseSchema.parse(result).data;
}

export async function getDomain(
  domain: string,
  projectUuid: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
): Promise<Domain> {
  const response = await fetch(domainUrl(storeHash, projectUuid, domain, apiHost), {
    method: 'GET',
    headers: authHeaders(accessToken),
  });

  await assertDomainResponse(response, `Failed to fetch domain: ${response.statusText}`);

  const result: unknown = await response.json();

  return domainResponseSchema.parse(result).data;
}
