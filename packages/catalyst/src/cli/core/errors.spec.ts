import { Effect } from 'effect';
import { describe, expect, test } from 'vitest';

import {
  AuthError,
  BrowserOpenError,
  BuildError,
  BundleError,
  DeploymentError,
  HttpApiError,
  MissingCredentialsError,
  ProcessRunnerError,
  ValidationError,
  ZipError,
} from './errors';

describe('tagged errors', () => {
  test('MissingCredentialsError has correct tag and message', () => {
    const error = new MissingCredentialsError({ message: 'no creds' });

    expect(error._tag).toBe('MissingCredentialsError');
    expect(error.message).toBe('no creds');
  });

  test('HttpApiError has correct tag and optional fields', () => {
    const error = new HttpApiError({ message: 'not found', status: 404, statusText: 'Not Found' });

    expect(error._tag).toBe('HttpApiError');
    expect(error.message).toBe('not found');
    expect(error.status).toBe(404);
    expect(error.statusText).toBe('Not Found');
  });

  test('HttpApiError works without optional fields', () => {
    const error = new HttpApiError({ message: 'fail' });

    expect(error.status).toBeUndefined();
    expect(error.statusText).toBeUndefined();
  });

  test('DeploymentError has correct tag and optional code', () => {
    const error = new DeploymentError({ message: 'deploy failed', code: 50 });

    expect(error._tag).toBe('DeploymentError');
    expect(error.message).toBe('deploy failed');
    expect(error.code).toBe(50);
  });

  test('BundleError has correct tag', () => {
    const error = new BundleError({ message: 'zip error' });

    expect(error._tag).toBe('BundleError');
    expect(error.message).toBe('zip error');
  });

  test('BuildError has correct tag', () => {
    const error = new BuildError({ message: 'build broke' });

    expect(error._tag).toBe('BuildError');
  });

  test('AuthError has correct tag', () => {
    const error = new AuthError({ message: 'auth failed' });

    expect(error._tag).toBe('AuthError');
  });

  test('ValidationError has correct tag', () => {
    const error = new ValidationError({ message: 'invalid input' });

    expect(error._tag).toBe('ValidationError');
  });

  test('ProcessRunnerError has correct tag and optional exitCode', () => {
    const error = new ProcessRunnerError({ message: 'exited', exitCode: 1 });

    expect(error._tag).toBe('ProcessRunnerError');
    expect(error.exitCode).toBe(1);
  });

  test('BrowserOpenError has correct tag', () => {
    const error = new BrowserOpenError({ message: 'cannot open' });

    expect(error._tag).toBe('BrowserOpenError');
  });

  test('ZipError has correct tag', () => {
    const error = new ZipError({ message: 'corrupt archive' });

    expect(error._tag).toBe('ZipError');
  });

  test('errors are yieldable in Effect.gen', async () => {
    const program = Effect.gen(function* () {
      return yield* new MissingCredentialsError({ message: 'test' });
    });

    const exit = await Effect.runPromiseExit(program);

    expect(exit._tag).toBe('Failure');
  });

  test('errors can be caught by tag', async () => {
    const program = Effect.gen(function* () {
      return yield* new HttpApiError({ message: 'not found', status: 404 });
    }).pipe(
      Effect.catchTag('HttpApiError', (e) => Effect.succeed(`caught: ${e.status}`)),
    );

    const result = await Effect.runPromise(program);

    expect(result).toBe('caught: 404');
  });
});
