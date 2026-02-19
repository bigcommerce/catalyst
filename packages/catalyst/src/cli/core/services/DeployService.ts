import { Context, Effect, Layer } from 'effect';
import { access, readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { z } from 'zod';

import {
  BundleError,
  DeploymentError,
  HttpApiError,
} from '../errors';
import { ZipArchive } from '../../providers/services/ZipArchive';
import { Telemetry } from '../../providers/services/Telemetry';
import { getDeploymentErrorMessage } from '../../lib/deployment-errors';

const UploadSignatureSchema = z.object({
  data: z.object({
    upload_url: z.url(),
    upload_uuid: z.string(),
  }),
});

const CreateDeploymentSchema = z.object({
  data: z.object({
    deployment_uuid: z.uuid(),
  }),
});

const stepsEnum = z.enum([
  'initializing',
  'downloading',
  'unzipping',
  'processing',
  'deploying',
  'finalizing',
  'complete',
]);

const DeploymentStatusSchema = z.object({
  deployment_uuid: z.uuid(),
  deployment_status: z.enum(['queued', 'in_progress', 'failed', 'completed']),
  event: z
    .object({
      step: stepsEnum,
      progress: z.number(),
    })
    .nullable(),
  deployment_url: z.string().nullable(),
  error: z
    .object({
      code: z.number(),
    })
    .optional(),
});

export const STEPS: Record<z.infer<typeof stepsEnum>, string> = {
  initializing: 'Initializing...',
  downloading: 'Downloading...',
  unzipping: 'Unzipping...',
  processing: 'Processing...',
  deploying: 'Deploying...',
  finalizing: 'Finalizing...',
  complete: 'Complete',
};

export interface UploadSignatureResult {
  readonly upload_url: string;
  readonly upload_uuid: string;
}

export interface CreateDeploymentOpts {
  readonly projectUuid: string;
  readonly uploadUuid: string;
  readonly storeHash: string;
  readonly accessToken: string;
  readonly apiHost: string;
  readonly environmentVariables?: Array<{
    type: 'secret' | 'plain_text';
    key: string;
    value: string;
  }>;
}

export interface DeploymentStatusEvent {
  readonly step: string;
  readonly stepLabel: string;
}

export interface DeploymentResult {
  readonly deploymentUrl: string | undefined;
  readonly status: string;
}

export class DeployService extends Context.Tag('@catalyst/DeployService')<
  DeployService,
  {
    readonly generateBundle: () => Effect.Effect<string, BundleError>;
    readonly generateUploadSignature: (
      storeHash: string,
      accessToken: string,
      apiHost: string,
    ) => Effect.Effect<UploadSignatureResult, HttpApiError>;
    readonly uploadBundle: (uploadUrl: string) => Effect.Effect<void, HttpApiError>;
    readonly createDeployment: (
      opts: CreateDeploymentOpts,
    ) => Effect.Effect<{ deployment_uuid: string }, HttpApiError>;
    readonly streamDeploymentStatus: (opts: {
      deploymentUuid: string;
      storeHash: string;
      accessToken: string;
      apiHost: string;
      onStatusEvent?: (event: DeploymentStatusEvent) => void;
    }) => Effect.Effect<DeploymentResult, DeploymentError>;
  }
>() {}

export const DeployServiceLive = Layer.effect(
  DeployService,
  Effect.gen(function* () {
    const zipArchive = yield* ZipArchive;
    const telemetry = yield* Telemetry;

    return {
      generateBundle: () =>
        Effect.gen(function* () {
          const bigcommerceDir = join(process.cwd(), '.bigcommerce');
          const distDir = join(bigcommerceDir, 'dist');

          yield* Effect.tryPromise({
            try: () => access(distDir),
            catch: () =>
              new BundleError({
                message: `Dist directory not found: ${distDir}`,
              }),
          });

          const buildDirContents = yield* Effect.tryPromise({
            try: () => readdir(distDir),
            catch: (error) =>
              new BundleError({
                message: `Failed to read dist directory: ${error instanceof Error ? error.message : String(error)}`,
              }),
          });

          if (buildDirContents.length === 0) {
            return yield* new BundleError({
              message: `Dist directory is empty: ${distDir}`,
            });
          }

          const outputZip = join(bigcommerceDir, 'bundle.zip');

          yield* zipArchive.createFromDirectory(distDir, outputZip, 'output').pipe(
            Effect.mapError(
              (e) => new BundleError({ message: `Failed to create zip: ${e.message}` }),
            ),
          );

          return outputZip;
        }),

      generateUploadSignature: (storeHash, accessToken, apiHost) =>
        Effect.gen(function* () {
          const sessionId = yield* telemetry.sessionId();

          return yield* Effect.tryPromise({
            try: async () => {
              const response = await fetch(
                `https://${apiHost}/stores/${storeHash}/v3/infrastructure/deployments/uploads`,
                {
                  method: 'POST',
                  headers: {
                    'X-Auth-Token': accessToken,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Correlation-Id': sessionId,
                  },
                  body: JSON.stringify({}),
                },
              );

              if (!response.ok) {
                throw new HttpApiError({
                  message: `Failed to fetch upload signature: ${response.status} ${response.statusText}`,
                  status: response.status,
                  statusText: response.statusText,
                });
              }

              const res: unknown = await response.json();
              const { data } = UploadSignatureSchema.parse(res);

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

      uploadBundle: (uploadUrl) =>
        Effect.tryPromise({
          try: async () => {
            const zipPath = join(process.cwd(), '.bigcommerce', 'bundle.zip');
            const fileBuffer = await readFile(zipPath);

            const response = await fetch(uploadUrl, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/zip' },
              body: fileBuffer,
            });

            if (!response.ok) {
              throw new HttpApiError({
                message: `Failed to upload bundle: ${response.status} ${response.statusText}`,
                status: response.status,
                statusText: response.statusText,
              });
            }
          },
          catch: (error) => {
            if (error instanceof HttpApiError) return error;

            return new HttpApiError({
              message: error instanceof Error ? error.message : String(error),
            });
          },
        }),

      createDeployment: (opts) =>
        Effect.gen(function* () {
          const sessionId = yield* telemetry.sessionId();

          return yield* Effect.tryPromise({
            try: async () => {
              const response = await fetch(
                `https://${opts.apiHost}/stores/${opts.storeHash}/v3/infrastructure/deployments`,
                {
                  method: 'POST',
                  headers: {
                    'X-Auth-Token': opts.accessToken,
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-Correlation-Id': sessionId,
                  },
                  body: JSON.stringify({
                    project_uuid: opts.projectUuid,
                    upload_uuid: opts.uploadUuid,
                    environment_variables: opts.environmentVariables,
                  }),
                },
              );

              if (!response.ok) {
                throw new HttpApiError({
                  message: `Failed to create deployment: ${response.status} ${response.statusText}`,
                  status: response.status,
                  statusText: response.statusText,
                });
              }

              const res: unknown = await response.json();
              const { data } = CreateDeploymentSchema.parse(res);

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

      streamDeploymentStatus: (opts) =>
        Effect.gen(function* () {
          const sessionId = yield* telemetry.sessionId();

          return yield* Effect.tryPromise({
            try: async () => {
              const response = await fetch(
                `https://${opts.apiHost}/stores/${opts.storeHash}/v3/infrastructure/deployments/${opts.deploymentUuid}/events`,
                {
                  method: 'GET',
                  headers: {
                    'X-Auth-Token': opts.accessToken,
                    Accept: 'text/event-stream',
                    Connection: 'keep-alive',
                    'X-Correlation-Id': sessionId,
                  },
                },
              );

              if (!response.ok) {
                throw new DeploymentError({
                  message: `Failed to open event stream: ${response.status} ${response.statusText}`,
                });
              }

              const reader = response.body?.getReader();

              if (!reader) {
                throw new DeploymentError({
                  message: 'Failed to read event stream.',
                });
              }

              const decoder = new TextDecoder();
              let done = false;
              let deploymentUrl: string | undefined;
              let lastStatus = 'queued';

              while (!done) {
                const { value, done: streamDone } = await reader.read();

                if (value) {
                  const chunk = decoder.decode(value, { stream: true }).trim();
                  const split = chunk
                    .split('\n\n')
                    .map((s) => s.replace('data:', '').trim())
                    .filter(Boolean);

                  for (const event of split) {
                    let json: unknown;

                    try {
                      json = JSON.parse(event);
                    } catch {
                      continue;
                    }

                    const data = DeploymentStatusSchema.parse(json);

                    if (data.error) {
                      throw new DeploymentError({
                        message: `Deployment failed (error code ${data.error.code}): ${getDeploymentErrorMessage(data.error.code)}`,
                        code: data.error.code,
                      });
                    }

                    lastStatus = data.deployment_status;

                    if (data.event) {
                      opts.onStatusEvent?.({
                        step: data.event.step,
                        stepLabel: STEPS[data.event.step],
                      });
                    }

                    if (data.deployment_url) {
                      deploymentUrl = data.deployment_url;
                    }
                  }
                }

                done = streamDone;
              }

              return { deploymentUrl, status: lastStatus };
            },
            catch: (error) => {
              if (error instanceof DeploymentError) return error;

              return new DeploymentError({
                message: error instanceof Error ? error.message : String(error),
              });
            },
          });
        }),
    };
  }),
);
