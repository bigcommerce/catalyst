import { z } from 'zod';

const fetchProjectsSchema = z.object({
  data: z.array(
    z.object({
      uuid: z.string(),
      name: z.string(),
    }),
  ),
});

export interface ProjectListItem {
  uuid: string;
  name: string;
}

export async function fetchProjects(
  storeHash: string,
  accessToken: string,
  apiHost: string,
): Promise<ProjectListItem[]> {
  const response = await fetch(
    `https://${apiHost}/stores/${storeHash}/v3/infrastructure/projects`,
    {
      method: 'GET',
      headers: {
        'X-Auth-Token': accessToken,
      },
    },
  );

  if (response.status === 403) {
    throw new Error(
      'Infrastructure Projects API not enabled. If you are part of the alpha, contact support@bigcommerce.com to enable it.',
    );
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch projects: ${response.statusText}`);
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

export async function createProject(
  name: string,
  storeHash: string,
  accessToken: string,
  apiHost: string,
): Promise<CreateProjectResult> {
  const response = await fetch(
    `https://${apiHost}/stores/${storeHash}/v3/infrastructure/projects`,
    {
      method: 'POST',
      headers: {
        'X-Auth-Token': accessToken,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    },
  );

  if (response.status === 502) {
    throw new Error('Failed to create project, is the name already in use?');
  }

  if (response.status === 403) {
    throw new Error(
      'Infrastructure Projects API not enabled. If you are part of the alpha, contact support@bigcommerce.com to enable it.',
    );
  }

  if (!response.ok) {
    throw new Error(`Failed to create project: ${response.statusText}`);
  }

  const res: unknown = await response.json();

  const { data } = createProjectSchema.parse(res);

  return data;
}
