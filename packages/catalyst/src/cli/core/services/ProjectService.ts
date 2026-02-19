import { Context, Effect, Layer } from 'effect';
import { z } from 'zod';

import { HttpApiError, MissingCredentialsError } from '../errors';
import { ProjectConfig } from '../../providers/services/ProjectConfig';
import { Telemetry } from '../../providers/services/Telemetry';

export interface ProjectListItem {
  readonly uuid: string;
  readonly name: string;
}

export interface CreateProjectResult {
  readonly uuid: string;
  readonly name: string;
  readonly date_created: Date;
  readonly date_modified: Date;
}

export interface Credentials {
  readonly storeHash: string;
  readonly accessToken: string;
}

export interface StoreProfile {
  readonly store_name: string;
}

export class ProjectService extends Context.Tag('@catalyst/ProjectService')<
  ProjectService,
  {
    readonly fetchProjects: (
      storeHash: string,
      accessToken: string,
      apiHost: string,
    ) => Effect.Effect<ProjectListItem[], HttpApiError>;
    readonly createProject: (
      name: string,
      storeHash: string,
      accessToken: string,
      apiHost: string,
    ) => Effect.Effect<CreateProjectResult, HttpApiError>;
    readonly resolveCredentials: (options: {
      storeHash?: string;
      accessToken?: string;
    }) => Effect.Effect<Credentials, MissingCredentialsError, ProjectConfig>;
    readonly fetchStoreProfile: (
      storeHash: string,
      accessToken: string,
      apiHost: string,
    ) => Effect.Effect<StoreProfile, HttpApiError>;
  }
>() {}

const fetchProjectsSchema = z.object({
  data: z.array(
    z.object({
      uuid: z.string(),
      name: z.string(),
    }),
  ),
});

const createProjectSchema = z.object({
  data: z.object({
    uuid: z.string(),
    name: z.string(),
    date_created: z.coerce.date(),
    date_modified: z.coerce.date(),
  }),
});

const StoreProfileSchema = z.object({
  data: z.object({
    store_name: z.string(),
  }),
});

export const ProjectServiceLive = Layer.effect(
  ProjectService,
  Effect.gen(function* () {
    const telemetry = yield* Telemetry;

    return {
      fetchProjects: (storeHash, accessToken, apiHost) =>
        Effect.gen(function* () {
          const sessionId = yield* telemetry.sessionId();

          return yield* Effect.tryPromise({
            try: async () => {
              const response = await fetch(
                `https://${apiHost}/stores/${storeHash}/v3/infrastructure/projects`,
                {
                  method: 'GET',
                  headers: {
                    'X-Auth-Token': accessToken,
                    'X-Correlation-Id': sessionId,
                  },
                },
              );

              if (response.status === 403) {
                throw new HttpApiError({
                  message:
                    'Infrastructure Projects API not enabled. If you are part of the alpha, contact support@bigcommerce.com to enable it.',
                  status: 403,
                  statusText: response.statusText,
                });
              }

              if (!response.ok) {
                throw new HttpApiError({
                  message: `Failed to fetch projects: ${response.statusText}`,
                  status: response.status,
                  statusText: response.statusText,
                });
              }

              const res: unknown = await response.json();
              const { data } = fetchProjectsSchema.parse(res);

              return data;
            },
            catch: (error) => {
              if (error instanceof HttpApiError) return error;

              return new HttpApiError({
                message: error instanceof Error ? error.message : String(error),
              });
            },
          });
        }),

      createProject: (name, storeHash, accessToken, apiHost) =>
        Effect.gen(function* () {
          const sessionId = yield* telemetry.sessionId();

          return yield* Effect.tryPromise({
            try: async () => {
              const response = await fetch(
                `https://${apiHost}/stores/${storeHash}/v3/infrastructure/projects`,
                {
                  method: 'POST',
                  headers: {
                    'X-Auth-Token': accessToken,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-Correlation-Id': sessionId,
                  },
                  body: JSON.stringify({ name }),
                },
              );

              if (response.status === 502) {
                throw new HttpApiError({
                  message:
                    'Failed to create project, is the name already in use?',
                  status: 502,
                  statusText: response.statusText,
                });
              }

              if (response.status === 403) {
                throw new HttpApiError({
                  message:
                    'Infrastructure Projects API not enabled. If you are part of the alpha, contact support@bigcommerce.com to enable it.',
                  status: 403,
                  statusText: response.statusText,
                });
              }

              if (!response.ok) {
                throw new HttpApiError({
                  message: `Failed to create project: ${response.statusText}`,
                  status: response.status,
                  statusText: response.statusText,
                });
              }

              const res: unknown = await response.json();
              const { data } = createProjectSchema.parse(res);

              return data;
            },
            catch: (error) => {
              if (error instanceof HttpApiError) return error;

              return new HttpApiError({
                message: error instanceof Error ? error.message : String(error),
              });
            },
          });
        }),

      resolveCredentials: (options) =>
        Effect.gen(function* () {
          const config = yield* ProjectConfig;

          const storeHash =
            options.storeHash ?? (yield* config.get('storeHash'));
          const accessToken =
            options.accessToken ?? (yield* config.get('accessToken'));

          if (!storeHash || !accessToken) {
            return yield* new MissingCredentialsError({
              message: 'Missing credentials',
            });
          }

          return { storeHash, accessToken };
        }),

      fetchStoreProfile: (storeHash, accessToken, apiHost) =>
        Effect.tryPromise({
          try: async () => {
            const response = await fetch(
              `https://${apiHost}/stores/${storeHash}/v3/settings/store/profile`,
              {
                method: 'GET',
                headers: {
                  'X-Auth-Token': accessToken,
                  Accept: 'application/json',
                },
              },
            );

            if (!response.ok) {
              throw new HttpApiError({
                message: `${response.status} ${response.statusText}`,
                status: response.status,
                statusText: response.statusText,
              });
            }

            const res: unknown = await response.json();
            const result = StoreProfileSchema.safeParse(res);

            if (!result.success) {
              throw new HttpApiError({
                message: 'Unexpected response from store profile API',
              });
            }

            return result.data.data;
          },
          catch: (error) => {
            if (error instanceof HttpApiError) return error;

            return new HttpApiError({
              message: error instanceof Error ? error.message : String(error),
            });
          },
        }),
    };
  }),
);
