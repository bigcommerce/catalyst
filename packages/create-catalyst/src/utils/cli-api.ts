import { z } from 'zod';

import { InfrastructureProjectValidationError } from './cli-api-errors';
import { Https } from './https';

interface CliApiConfig {
  origin: string;
  storeHash: string;
  accessToken: string;
  apiHostname: string;
}

const infrastructureProjectSchema = z.object({
  uuid: z.string(),
  name: z.string(),
});

export type InfrastructureProject = z.infer<typeof infrastructureProjectSchema>;

const createInfrastructureProjectSchema = z.object({
  data: infrastructureProjectSchema,
});

const listInfrastructureProjectsSchema = z.object({
  data: z.array(infrastructureProjectSchema),
});

const infrastructureErrorSchema = z.object({
  title: z.string().optional(),
  detail: z.string().optional(),
  errors: z.record(z.string(), z.string()).optional(),
});

function extractValidationMessage(body: unknown): string | null {
  const parsed = infrastructureErrorSchema.safeParse(body);

  if (!parsed.success) return null;

  const { title, detail, errors } = parsed.data;

  if (errors && Object.keys(errors).length > 0) {
    return Object.values(errors).join('; ');
  }

  return detail ?? title ?? null;
}

export class CliApi {
  private client: Https;
  private infrastructureClient: Https;

  constructor({ origin, storeHash, accessToken, apiHostname }: CliApiConfig) {
    this.client = new Https({
      baseUrl: `${origin}/stores/${storeHash}/cli-api/v3`,
      accessToken,
    });
    this.infrastructureClient = new Https({
      baseUrl: `https://${apiHostname}/stores/${storeHash}/v3/infrastructure`,
      accessToken,
    });
  }

  async hasProjectsAccess(): Promise<boolean> {
    const response = await this.infrastructureClient.fetch('/projects', { method: 'GET' });

    if (response.status === 200) return true;
    if (response.status === 403) return false;

    throw new Error(
      `GET /v3/infrastructure/projects failed: ${response.status} ${response.statusText}`,
    );
  }

  async listInfrastructureProjects() {
    try {
      const response = await this.infrastructureClient.fetch('/projects', { method: 'GET' });

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const { data } = listInfrastructureProjectsSchema.parse(await response.json());

      return data;
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'unknown error';

      throw new Error(`Could not load Commerce Hosting projects: ${reason}`, { cause: error });
    }
  }

  async createInfrastructureProject(name: string) {
    try {
      const response = await this.infrastructureClient.fetch('/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (response.status === 400 || response.status === 422) {
        const body: unknown = await response.json().catch(() => null);
        const message = extractValidationMessage(body) ?? response.statusText;

        throw new InfrastructureProjectValidationError(message);
      }

      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText}`);
      }

      const { data } = createInfrastructureProjectSchema.parse(await response.json());

      return data;
    } catch (error) {
      // Validation errors carry a specific class that consumers `instanceof`-check; preserve it.
      if (error instanceof InfrastructureProjectValidationError) throw error;

      const reason = error instanceof Error ? error.message : 'unknown error';

      throw new Error(`Could not create Commerce Hosting project: ${reason}`, { cause: error });
    }
  }

  async getChannelInit(channelId: number | string) {
    return this.client.fetch(`/channels/${channelId}/init`, {
      method: 'GET',
    });
  }

  async checkEligibility() {
    return this.client.fetch('/channels/catalyst/eligibility', {
      method: 'GET',
    });
  }

  async createChannel(
    name: string,
    storefrontLocale: string,
    additionalLocales: string[],
    installSampleData = false,
  ) {
    return this.client.fetch('/channels/catalyst', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        initialData: {
          type: installSampleData ? 'sample' : 'none',
        },
        deployStorefront: true,
        devOrigin: 'http://localhost:3000',
        storefrontLanguage: storefrontLocale,
        additionalLocales,
      }),
    });
  }
}
