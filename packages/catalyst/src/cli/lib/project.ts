import { z } from 'zod';

import { assertAuthorized } from './auth-errors';
import { UserActionableError } from './errors';
import { httpError } from './http-errors';
import { getTelemetry } from './telemetry';

export class InfrastructureProjectValidationError extends UserActionableError {
  constructor(message: string) {
    super(message);
    this.name = 'InfrastructureProjectValidationError';
  }
}

const fetchProjectsSchema = z.object({
  data: z.array(
    z.object({
      uuid: z.string(),
      name: z.string(),
      deployment_hostnames: z.array(z.string()),
    }),
  ),
});

export interface ProjectListItem {
  uuid: string;
  name: string;
  deployment_hostnames: string[];
}

function projectsUrl(storeHash: string, apiHost: string) {
  return `https://${apiHost}/stores/${storeHash}/v3/infrastructure/projects`;
}

function authHeaders(accessToken: string) {
  return {
    'X-Auth-Token': accessToken,
    'X-Correlation-Id': getTelemetry().correlationId,
  };
}

export async function hasProjectsAccess(
  storeHash: string,
  accessToken: string,
  apiHost: string,
): Promise<boolean> {
  const response = await fetch(projectsUrl(storeHash, apiHost), {
    method: 'GET',
    headers: authHeaders(accessToken),
  });

  assertAuthorized(response);

  if (response.status === 200) return true;
  if (response.status === 403) return false;

  throw await httpError(response, 'Failed to check project access');
}

export async function fetchProjects(
  storeHash: string,
  accessToken: string,
  apiHost: string,
): Promise<ProjectListItem[]> {
  const response = await fetch(projectsUrl(storeHash, apiHost), {
    method: 'GET',
    headers: authHeaders(accessToken),
  });

  assertAuthorized(response);

  if (response.status === 403) {
    throw new UserActionableError(
      'Infrastructure Projects API not enabled. If you are part of the beta, contact support@bigcommerce.com to enable it.',
    );
  }

  if (!response.ok) {
    throw await httpError(response, 'Failed to fetch projects');
  }

  const res: unknown = await response.json();

  const { data } = fetchProjectsSchema.parse(res);

  return data;
}

const createProjectSchema = z.object({
  data: z.object({
    uuid: z.string(),
    name: z.string(),
    date_created: z.coerce.date(),
    date_modified: z.coerce.date(),
  }),
});

export interface CreateProjectResult {
  uuid: string;
  name: string;
  date_created: Date;
  date_modified: Date;
}

const validationErrorBodySchema = z.object({
  title: z.string().optional(),
  detail: z.string().optional(),
  errors: z.record(z.string(), z.string()).optional(),
});

function extractValidationMessage(body: unknown): string | null {
  const parsed = validationErrorBodySchema.safeParse(body);

  if (!parsed.success) return null;

  const { title, detail, errors } = parsed.data;

  if (errors && Object.keys(errors).length > 0) {
    return Object.values(errors).join('; ');
  }

  return detail ?? title ?? null;
}

export async function createProject(
  name: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
): Promise<CreateProjectResult> {
  const response = await fetch(projectsUrl(storeHash, apiHost), {
    method: 'POST',
    headers: {
      ...authHeaders(accessToken),
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  assertAuthorized(response);

  if (response.status === 400 || response.status === 422) {
    const body: unknown = await response.json().catch(() => null);
    const fallback =
      response.status === 422
        ? "The project name you entered doesn't meet the requirements. It must be 3–32 characters long and use only letters, numbers, hyphens (-), underscores (_), and periods (.)"
        : response.statusText;
    const message = extractValidationMessage(body) ?? fallback;

    throw new InfrastructureProjectValidationError(message);
  }

  // The API returns 403 (or 404 when the flag is off) if the store isn't in the
  // Infrastructure Projects beta; both mean "not enabled for this store".
  if (response.status === 403 || response.status === 404) {
    throw new UserActionableError(
      'Infrastructure Projects API not enabled. If you are part of the beta, contact support@bigcommerce.com to enable it.',
    );
  }

  // TODO: TRAC-592 - remove this check once the API returns proper 400/422 with validation messages for duplicate names instead of 502
  if (response.status === 502) {
    throw new Error('Failed to create project, is the name already in use?');
  }

  if (!response.ok) {
    throw await httpError(response, 'Failed to create project');
  }

  const res: unknown = await response.json();

  const { data } = createProjectSchema.parse(res);

  return data;
}

export async function deleteProject(
  projectUuid: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
): Promise<void> {
  const response = await fetch(`${projectsUrl(storeHash, apiHost)}/${projectUuid}`, {
    method: 'DELETE',
    headers: authHeaders(accessToken),
  });

  assertAuthorized(response);

  if (response.status === 403) {
    throw new UserActionableError(
      'Infrastructure Projects API not enabled. If you are part of the beta, contact support@bigcommerce.com to enable it.',
    );
  }

  if (response.status === 404) {
    throw new UserActionableError(`Project ${projectUuid} not found.`);
  }

  if (!response.ok) {
    throw await httpError(response, 'Failed to delete project');
  }
}
