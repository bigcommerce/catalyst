/* eslint-disable max-classes-per-file -- the two domain-collision error types are co-located with the response parsing that throws them */
import { z } from 'zod';

import { assertAuthorized } from './auth-errors';
import { UserActionableError } from './errors';
import { formatV3Error } from './observability';
import { getTelemetry } from './telemetry';

export const domainStatusSchema = z.enum(['pending', 'verified', 'failed', 'unknown']);

export type DomainStatus = z.infer<typeof domainStatusSchema>;

const domainSchema = z.object({
  domain: z.string(),
  project_uuid: z.string(),
  verification_status: domainStatusSchema,
});

const ownershipVerificationSchema = z.object({
  type: z.string(),
  name: z.string(),
  value: z.string().optional(),
});

export type OwnershipVerification = z.infer<typeof ownershipVerificationSchema>;

const ownershipVerificationMetaSchema = z.object({
  meta: z.object({
    ownership_verification: ownershipVerificationSchema,
  }),
});

// Raised when the Domains API rejects an add/claim because ownership of a
// domain bound to another store has not been verified. Carries the TXT record
// the caller must publish so the command can render actionable next steps
// instead of an opaque error.
export class DomainOwnershipVerificationError extends UserActionableError {
  readonly ownershipVerification: OwnershipVerification;

  constructor(message: string, ownershipVerification: OwnershipVerification) {
    super(message);
    this.name = 'DomainOwnershipVerificationError';
    this.ownershipVerification = ownershipVerification;
  }
}

function parseOwnershipVerification(body: unknown): OwnershipVerification | undefined {
  const parsed = ownershipVerificationMetaSchema.safeParse(body);

  return parsed.success ? parsed.data.meta.ownership_verification : undefined;
}

const boundProjectMetaSchema = z.object({
  meta: z.object({
    project_uuid: z.string(),
  }),
});

// Raised when the Domains API rejects an add/claim because the domain is
// already bound to a different project in the *same* store. Carries the UUID of
// that project so the caller can point the user at `domains transfer`.
export class DomainBoundToProjectError extends UserActionableError {
  readonly projectUuid: string;

  constructor(message: string, projectUuid: string) {
    super(message);
    this.name = 'DomainBoundToProjectError';
    this.projectUuid = projectUuid;
  }
}

function parseBoundProjectUuid(body: unknown): string | undefined {
  const parsed = boundProjectMetaSchema.safeParse(body);

  return parsed.success ? parsed.data.meta.project_uuid : undefined;
}

const domainResponseSchema = z.object({
  data: domainSchema,
});

const domainListResponseSchema = z.object({
  data: z.array(domainSchema),
});

export type Domain = z.infer<typeof domainSchema>;
export type DomainStatusFilter = Exclude<DomainStatus, 'unknown'>;

interface ListDomainsFilters {
  domains?: string[];
  verificationStatus?: DomainStatusFilter;
}

const DOMAINS_API_NOT_ENABLED =
  'Infrastructure Domains API not enabled. If you are part of the beta, contact support@bigcommerce.com to enable it.';

function domainsUrl(storeHash: string, projectUuid: string, apiHost: string) {
  return `https://${apiHost}/stores/${storeHash}/v3/infrastructure/projects/${projectUuid}/domains`;
}

function domainUrl(storeHash: string, projectUuid: string, domain: string, apiHost: string) {
  return `${domainsUrl(storeHash, projectUuid, apiHost)}/${encodeURIComponent(domain)}`;
}

function domainClaimUrl(storeHash: string, projectUuid: string, domain: string, apiHost: string) {
  return `${domainUrl(storeHash, projectUuid, domain, apiHost)}/claim`;
}

function domainTransferUrl(
  storeHash: string,
  projectUuid: string,
  domain: string,
  apiHost: string,
) {
  return `${domainUrl(storeHash, projectUuid, domain, apiHost)}/transfer`;
}

function authHeaders(accessToken: string) {
  return {
    Accept: 'application/json',
    'X-Auth-Token': accessToken,
    'X-Correlation-Id': getTelemetry().correlationId,
  };
}

function formatResponseStatus(response: Response, message?: string): string {
  return [response.status, response.statusText || message].filter(Boolean).join(' ');
}

function buildErrorMessage(response: Response, body: unknown, action: string): string {
  const message = formatV3Error(body);

  if (response.status >= 500) {
    const status = formatResponseStatus(response, message);

    return `${action}: ${status}. This is a server-side response from the Domains API.`;
  }

  return message ?? `${action}: ${response.statusText}`;
}

// Throws for any non-OK Domains API response. Surfaces typed errors for the two
// claimable/movable conflicts so callers can guide the user: a
// `meta.ownership_verification` TXT record (domain on another store → claim) or
// a `meta.project_uuid` (domain on another project in this store → transfer).
// Otherwise throws a plain formatted error.
async function assertDomainResponse(response: Response, action: string): Promise<void> {
  assertAuthorized(response);

  if (response.status === 403) {
    throw new UserActionableError(DOMAINS_API_NOT_ENABLED);
  }

  if (response.ok) {
    return;
  }

  const body: unknown = await response.json().catch(() => null);
  const message = buildErrorMessage(response, body, action);
  const ownershipVerification = parseOwnershipVerification(body);

  if (ownershipVerification) {
    throw new DomainOwnershipVerificationError(message, ownershipVerification);
  }

  const boundProjectUuid = parseBoundProjectUuid(body);

  if (boundProjectUuid) {
    throw new DomainBoundToProjectError(message, boundProjectUuid);
  }

  // 5xx responses are server-side failures worth escalating, so keep the
  // Correlation ID + support framing. A 4xx (validation, not-found, conflict)
  // is a clear, user-actionable response — surface just the message.
  if (response.status >= 500) {
    throw new Error(message);
  }

  throw new UserActionableError(message);
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

  await assertDomainResponse(response, 'Failed to add domain');

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

  await assertDomainResponse(response, 'Failed to fetch domain');

  const result: unknown = await response.json();

  return domainResponseSchema.parse(result).data;
}

export async function listDomains(
  projectUuid: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
  filters: ListDomainsFilters = {},
): Promise<Domain[]> {
  const search = new URLSearchParams();

  if (filters.domains && filters.domains.length > 0) {
    search.set('domain:in', filters.domains.join(','));
  }

  if (filters.verificationStatus) {
    search.set('verification_status', filters.verificationStatus);
  }

  const query = search.toString();
  const url = `${domainsUrl(storeHash, projectUuid, apiHost)}${query ? `?${query}` : ''}`;
  const response = await fetch(url, {
    method: 'GET',
    headers: authHeaders(accessToken),
  });

  await assertDomainResponse(response, 'Failed to fetch domains');

  const result: unknown = await response.json();

  return domainListResponseSchema.parse(result).data;
}

export async function deleteDomain(
  domain: string,
  projectUuid: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
): Promise<void> {
  const response = await fetch(domainUrl(storeHash, projectUuid, domain, apiHost), {
    method: 'DELETE',
    headers: authHeaders(accessToken),
  });

  await assertDomainResponse(response, `Failed to remove domain: ${response.statusText}`);
}

export async function claimDomain(
  domain: string,
  projectUuid: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
): Promise<void> {
  const response = await fetch(domainClaimUrl(storeHash, projectUuid, domain, apiHost), {
    method: 'POST',
    headers: authHeaders(accessToken),
  });

  await assertDomainResponse(response, 'Failed to claim domain');
}

// Moves a domain from its current project (`projectUuid`, the source) to
// `newProjectUuid` (the destination) within the same store. The API rejects a
// transfer where the destination equals the source.
export async function transferDomain(
  domain: string,
  projectUuid: string,
  newProjectUuid: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
): Promise<void> {
  const response = await fetch(domainTransferUrl(storeHash, projectUuid, domain, apiHost), {
    method: 'POST',
    headers: {
      ...authHeaders(accessToken),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ new_project_uuid: newProjectUuid }),
  });

  await assertDomainResponse(response, 'Failed to transfer domain');
}
