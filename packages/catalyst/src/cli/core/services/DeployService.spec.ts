import { Effect, Layer } from 'effect';
import { http, HttpResponse } from 'msw';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { server } from '../../../../tests/mocks/node';
import { BundleError, DeploymentError, HttpApiError } from '../errors';
import { ZipArchive } from '../../providers/services/ZipArchive';
import { Telemetry } from '../../providers/services/Telemetry';
import { consola } from '../../lib/logger';

import { DeployService, DeployServiceLive, STEPS } from './DeployService';

const TestTelemetry = Layer.succeed(Telemetry, {
  track: () => Effect.void,
  identify: () => Effect.void,
  isEnabled: () => Effect.succeed(false),
  setEnabled: () => Effect.void,
  sessionId: () => Effect.succeed('test-session-id'),
  commandName: () => Effect.succeed('deploy'),
  setCommandName: () => Effect.void,
  durationMs: () => Effect.succeed(0),
  closeAndFlush: () => Effect.void,
});

const TestZipArchive = Layer.succeed(ZipArchive, {
  createFromDirectory: () => Effect.void,
});

const TestProviders = Layer.merge(TestTelemetry, TestZipArchive);
const TestLayer = DeployServiceLive.pipe(Layer.provide(TestProviders));

beforeAll(() => {
  consola.mockTypes(() => vi.fn());
});

describe('DeployService', () => {
  describe('generateBundle', () => {
    test('fails with BundleError when dist directory does not exist', async () => {
      const program = Effect.gen(function* () {
        const deploy = yield* DeployService;

        return yield* deploy.generateBundle();
      });

      const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(TestLayer)));

      expect(exit._tag).toBe('Failure');
    });
  });

  describe('generateUploadSignature', () => {
    test('returns upload signature', async () => {
      const program = Effect.gen(function* () {
        const deploy = yield* DeployService;

        return yield* deploy.generateUploadSignature(
          'store-hash',
          'token',
          'api.bigcommerce.com',
        );
      });

      const result = await Effect.runPromise(program.pipe(Effect.provide(TestLayer)));

      expect(result).toEqual({
        upload_url: 'https://mock-upload-url.com',
        upload_uuid: '0e93ce5f-6f91-4236-87ec-ca79627f31ba',
      });
    });

    test('returns HttpApiError on failure', async () => {
      server.use(
        http.post(
          'https://api.bigcommerce.com/stores/:storeHash/v3/infrastructure/deployments/uploads',
          () => new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' }),
        ),
      );

      const program = Effect.gen(function* () {
        const deploy = yield* DeployService;

        return yield* deploy.generateUploadSignature(
          'store-hash',
          'token',
          'api.bigcommerce.com',
        );
      });

      const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(TestLayer)));

      expect(exit._tag).toBe('Failure');
    });
  });

  describe('createDeployment', () => {
    test('creates deployment successfully', async () => {
      const program = Effect.gen(function* () {
        const deploy = yield* DeployService;

        return yield* deploy.createDeployment({
          projectUuid: 'test-uuid',
          uploadUuid: 'upload-uuid',
          storeHash: 'store-hash',
          accessToken: 'token',
          apiHost: 'api.bigcommerce.com',
        });
      });

      const result = await Effect.runPromise(program.pipe(Effect.provide(TestLayer)));

      expect(result.deployment_uuid).toBe('5b29c3c0-5f68-44fe-99e5-06492babf7be');
    });

    test('returns HttpApiError on failure', async () => {
      server.use(
        http.post(
          'https://api.bigcommerce.com/stores/:storeHash/v3/infrastructure/deployments',
          () => new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' }),
        ),
      );

      const program = Effect.gen(function* () {
        const deploy = yield* DeployService;

        return yield* deploy.createDeployment({
          projectUuid: 'test-uuid',
          uploadUuid: 'upload-uuid',
          storeHash: 'store-hash',
          accessToken: 'token',
          apiHost: 'api.bigcommerce.com',
        });
      });

      const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(TestLayer)));

      expect(exit._tag).toBe('Failure');
    });
  });

  describe('streamDeploymentStatus', () => {
    test('streams events and returns deployment result', async () => {
      const events: string[] = [];

      const program = Effect.gen(function* () {
        const deploy = yield* DeployService;

        return yield* deploy.streamDeploymentStatus({
          deploymentUuid: '5b29c3c0-5f68-44fe-99e5-06492babf7be',
          storeHash: 'store-hash',
          accessToken: 'token',
          apiHost: 'api.bigcommerce.com',
          onStatusEvent: (event) => events.push(event.step),
        });
      });

      const result = await Effect.runPromise(program.pipe(Effect.provide(TestLayer)));

      expect(result.deploymentUrl).toBe('https://example.com');
      expect(result.status).toBe('completed');
      expect(events.length).toBeGreaterThan(0);
    });

    test('returns DeploymentError on stream failure', async () => {
      server.use(
        http.get(
          'https://api.bigcommerce.com/stores/:storeHash/v3/infrastructure/deployments/:id/events',
          () => new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' }),
        ),
      );

      const program = Effect.gen(function* () {
        const deploy = yield* DeployService;

        return yield* deploy.streamDeploymentStatus({
          deploymentUuid: 'test-uuid',
          storeHash: 'store-hash',
          accessToken: 'token',
          apiHost: 'api.bigcommerce.com',
        });
      });

      const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(TestLayer)));

      expect(exit._tag).toBe('Failure');
    });

    test('returns DeploymentError when deployment has error code', async () => {
      const encoder = new TextEncoder();

      server.use(
        http.get(
          'https://api.bigcommerce.com/stores/:storeHash/v3/infrastructure/deployments/:id/events',
          () => {
            const stream = new ReadableStream({
              start(controller) {
                controller.enqueue(
                  encoder.encode(
                    `data: {"deployment_status":"failed","deployment_uuid":"test-uuid","event":null,"deployment_url":null,"error":{"code":50}}`,
                  ),
                );
                controller.close();
              },
            });

            return new HttpResponse(stream, {
              status: 200,
              headers: { 'Content-Type': 'text/event-stream' },
            });
          },
        ),
      );

      const program = Effect.gen(function* () {
        const deploy = yield* DeployService;

        return yield* deploy.streamDeploymentStatus({
          deploymentUuid: 'test-uuid',
          storeHash: 'store-hash',
          accessToken: 'token',
          apiHost: 'api.bigcommerce.com',
        });
      });

      const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(TestLayer)));

      expect(exit._tag).toBe('Failure');
    });
  });

  describe('STEPS', () => {
    test('maps step names to labels', () => {
      expect(STEPS.initializing).toBe('Initializing...');
      expect(STEPS.downloading).toBe('Downloading...');
      expect(STEPS.unzipping).toBe('Unzipping...');
      expect(STEPS.processing).toBe('Processing...');
      expect(STEPS.deploying).toBe('Deploying...');
      expect(STEPS.finalizing).toBe('Finalizing...');
      expect(STEPS.complete).toBe('Complete');
    });
  });
});

describe('DeployService test layer', () => {
  test('can use a test implementation', async () => {
    const TestDeployService = Layer.succeed(DeployService, {
      generateBundle: () => Effect.succeed('/path/to/bundle.zip'),
      generateUploadSignature: () =>
        Effect.succeed({ upload_url: 'https://test.com', upload_uuid: 'uuid' }),
      uploadBundle: () => Effect.void,
      createDeployment: () => Effect.succeed({ deployment_uuid: 'dep-uuid' }),
      streamDeploymentStatus: () =>
        Effect.succeed({ deploymentUrl: 'https://deployed.com', status: 'completed' }),
    });

    const program = Effect.gen(function* () {
      const deploy = yield* DeployService;
      const bundle = yield* deploy.generateBundle();
      const sig = yield* deploy.generateUploadSignature('h', 't', 'a');

      yield* deploy.uploadBundle(sig.upload_url);

      const { deployment_uuid } = yield* deploy.createDeployment({
        projectUuid: 'p',
        uploadUuid: sig.upload_uuid,
        storeHash: 'h',
        accessToken: 't',
        apiHost: 'a',
      });

      return yield* deploy.streamDeploymentStatus({
        deploymentUuid: deployment_uuid,
        storeHash: 'h',
        accessToken: 't',
        apiHost: 'a',
      });
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(TestDeployService)));

    expect(result.deploymentUrl).toBe('https://deployed.com');
  });
});
