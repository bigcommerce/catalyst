import { Effect, Layer } from 'effect';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { server } from '../../../../tests/mocks/node';
import { HttpApiError, MissingCredentialsError } from '../errors';
import { ProjectConfig } from '../../providers/services/ProjectConfig';
import { Telemetry } from '../../providers/services/Telemetry';

import { ProjectService, ProjectServiceLive } from './ProjectService';

const TestTelemetry = Layer.succeed(Telemetry, {
  track: () => Effect.void,
  identify: () => Effect.void,
  isEnabled: () => Effect.succeed(false),
  setEnabled: () => Effect.void,
  sessionId: () => Effect.succeed('test-session-id'),
  commandName: () => Effect.succeed('test'),
  setCommandName: () => Effect.void,
  durationMs: () => Effect.succeed(0),
  closeAndFlush: () => Effect.void,
});

const makeTestProjectConfig = (store: Map<string, unknown> = new Map()) =>
  Layer.succeed(ProjectConfig, {
    get: (key) => Effect.sync(() => store.get(key) as never),
    set: (key, value) =>
      Effect.sync(() => {
        store.set(key, value);
      }),
    delete: (key) =>
      Effect.sync(() => {
        store.delete(key);
      }),
    getConfig: () => {
      throw new Error('Not available in test');
    },
  });

const TestLayer = ProjectServiceLive.pipe(Layer.provide(TestTelemetry));

describe('ProjectService', () => {
  describe('fetchProjects', () => {
    test('returns list of projects', async () => {
      const program = Effect.gen(function* () {
        const project = yield* ProjectService;

        return yield* project.fetchProjects('store-hash', 'token', 'api.bigcommerce.com');
      });

      const result = await Effect.runPromise(program.pipe(Effect.provide(TestLayer)));

      expect(result).toEqual([
        { uuid: 'a23f5785-fd99-4a94-9fb3-945551623923', name: 'Project One' },
        { uuid: 'b23f5785-fd99-4a94-9fb3-945551623924', name: 'Project Two' },
      ]);
    });

    test('returns HttpApiError on 403', async () => {
      server.use(
        http.get(
          'https://api.bigcommerce.com/stores/:storeHash/v3/infrastructure/projects',
          () => new HttpResponse(null, { status: 403, statusText: 'Forbidden' }),
        ),
      );

      const program = Effect.gen(function* () {
        const project = yield* ProjectService;

        return yield* project.fetchProjects('store-hash', 'token', 'api.bigcommerce.com');
      });

      const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(TestLayer)));

      expect(exit._tag).toBe('Failure');
    });

    test('returns HttpApiError on other error', async () => {
      server.use(
        http.get(
          'https://api.bigcommerce.com/stores/:storeHash/v3/infrastructure/projects',
          () => new HttpResponse(null, { status: 500, statusText: 'Internal Server Error' }),
        ),
      );

      const program = Effect.gen(function* () {
        const project = yield* ProjectService;

        return yield* project.fetchProjects('store-hash', 'token', 'api.bigcommerce.com');
      });

      const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(TestLayer)));

      expect(exit._tag).toBe('Failure');
    });
  });

  describe('createProject', () => {
    test('creates a project successfully', async () => {
      const program = Effect.gen(function* () {
        const project = yield* ProjectService;

        return yield* project.createProject(
          'New Project',
          'store-hash',
          'token',
          'api.bigcommerce.com',
        );
      });

      const result = await Effect.runPromise(program.pipe(Effect.provide(TestLayer)));

      expect(result.name).toBe('New Project');
      expect(result.uuid).toBe('c23f5785-fd99-4a94-9fb3-945551623925');
    });

    test('returns HttpApiError on 502', async () => {
      server.use(
        http.post(
          'https://api.bigcommerce.com/stores/:storeHash/v3/infrastructure/projects',
          () => new HttpResponse(null, { status: 502, statusText: 'Bad Gateway' }),
        ),
      );

      const program = Effect.gen(function* () {
        const project = yield* ProjectService;

        return yield* project.createProject(
          'Duplicate',
          'store-hash',
          'token',
          'api.bigcommerce.com',
        );
      });

      const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(TestLayer)));

      expect(exit._tag).toBe('Failure');
    });

    test('returns HttpApiError on 403', async () => {
      server.use(
        http.post(
          'https://api.bigcommerce.com/stores/:storeHash/v3/infrastructure/projects',
          () => new HttpResponse(null, { status: 403, statusText: 'Forbidden' }),
        ),
      );

      const program = Effect.gen(function* () {
        const project = yield* ProjectService;

        return yield* project.createProject(
          'Test',
          'store-hash',
          'token',
          'api.bigcommerce.com',
        );
      });

      const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(TestLayer)));

      expect(exit._tag).toBe('Failure');
    });
  });

  describe('resolveCredentials', () => {
    test('returns credentials from options', async () => {
      const program = Effect.gen(function* () {
        const project = yield* ProjectService;

        return yield* project.resolveCredentials({
          storeHash: 'opt-hash',
          accessToken: 'opt-token',
        });
      });

      const layer = Layer.merge(TestLayer, makeTestProjectConfig());
      const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));

      expect(result).toEqual({ storeHash: 'opt-hash', accessToken: 'opt-token' });
    });

    test('falls back to config', async () => {
      const store = new Map<string, unknown>([
        ['storeHash', 'cfg-hash'],
        ['accessToken', 'cfg-token'],
      ]);

      const program = Effect.gen(function* () {
        const project = yield* ProjectService;

        return yield* project.resolveCredentials({});
      });

      const layer = Layer.merge(TestLayer, makeTestProjectConfig(store));
      const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));

      expect(result).toEqual({ storeHash: 'cfg-hash', accessToken: 'cfg-token' });
    });

    test('returns MissingCredentialsError when no credentials', async () => {
      const program = Effect.gen(function* () {
        const project = yield* ProjectService;

        return yield* project.resolveCredentials({});
      });

      const layer = Layer.merge(TestLayer, makeTestProjectConfig());
      const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(layer)));

      expect(exit._tag).toBe('Failure');
    });

    test('MissingCredentialsError can be caught by tag', async () => {
      const program = Effect.gen(function* () {
        const project = yield* ProjectService;

        return yield* project.resolveCredentials({});
      }).pipe(
        Effect.catchTag('MissingCredentialsError', (e) =>
          Effect.succeed(`caught: ${e.message}`),
        ),
      );

      const layer = Layer.merge(TestLayer, makeTestProjectConfig());
      const result = await Effect.runPromise(program.pipe(Effect.provide(layer)));

      expect(result).toBe('caught: Missing credentials');
    });
  });

  describe('fetchStoreProfile', () => {
    test('returns store profile', async () => {
      const program = Effect.gen(function* () {
        const project = yield* ProjectService;

        return yield* project.fetchStoreProfile(
          'store-hash',
          'token',
          'api.bigcommerce.com',
        );
      });

      const result = await Effect.runPromise(program.pipe(Effect.provide(TestLayer)));

      expect(result).toEqual({ store_name: 'Test Store' });
    });

    test('returns HttpApiError on failure', async () => {
      server.use(
        http.get(
          'https://api.bigcommerce.com/stores/:storeHash/v3/settings/store/profile',
          () => new HttpResponse(null, { status: 401, statusText: 'Unauthorized' }),
        ),
      );

      const program = Effect.gen(function* () {
        const project = yield* ProjectService;

        return yield* project.fetchStoreProfile(
          'store-hash',
          'token',
          'api.bigcommerce.com',
        );
      });

      const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(TestLayer)));

      expect(exit._tag).toBe('Failure');
    });

    test('returns HttpApiError on malformed response', async () => {
      server.use(
        http.get(
          'https://api.bigcommerce.com/stores/:storeHash/v3/settings/store/profile',
          () => HttpResponse.json({ invalid: 'data' }),
        ),
      );

      const program = Effect.gen(function* () {
        const project = yield* ProjectService;

        return yield* project.fetchStoreProfile(
          'store-hash',
          'token',
          'api.bigcommerce.com',
        );
      });

      const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(TestLayer)));

      expect(exit._tag).toBe('Failure');
    });
  });
});
