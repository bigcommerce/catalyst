import { Effect } from 'effect';
import { beforeAll, describe, expect, test, vi } from 'vitest';

import { consola } from './lib/logger';

import { LiveLayer } from './layers';
import { AuthService } from './core/services/AuthService';
import { BuildService } from './core/services/BuildService';
import { DeployService } from './core/services/DeployService';
import { ProjectService } from './core/services/ProjectService';
import { Logger } from './presentation/services/Logger';
import { Spinner } from './presentation/services/Spinner';
import { BrowserOpen } from './providers/services/BrowserOpen';
import { ProcessRunner } from './providers/services/ProcessRunner';
import { ProjectConfig } from './providers/services/ProjectConfig';
import { Telemetry } from './providers/services/Telemetry';
import { ZipArchive } from './providers/services/ZipArchive';

vi.mock('open', () => ({
  default: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('yocto-spinner', () => {
  const spinnerInstance = {
    start: vi.fn().mockReturnThis(),
    success: vi.fn().mockReturnThis(),
    error: vi.fn().mockReturnThis(),
    text: '',
  };

  return {
    default: vi.fn(() => spinnerInstance),
  };
});

beforeAll(() => {
  consola.mockTypes(() => vi.fn());
});

describe('LiveLayer', () => {
  test('provides all provider services', async () => {
    const program = Effect.gen(function* () {
      const config = yield* ProjectConfig;
      const runner = yield* ProcessRunner;
      const zip = yield* ZipArchive;
      const browser = yield* BrowserOpen;
      const telemetry = yield* Telemetry;

      return [config, runner, zip, browser, telemetry].every((s) => s !== null);
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(LiveLayer)));

    expect(result).toBe(true);
  });

  test('provides all presentation services', async () => {
    const program = Effect.gen(function* () {
      const logger = yield* Logger;
      const spinner = yield* Spinner;

      return [logger, spinner].every((s) => s !== null);
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(LiveLayer)));

    expect(result).toBe(true);
  });

  test('provides all core services', async () => {
    const program = Effect.gen(function* () {
      const auth = yield* AuthService;
      const build = yield* BuildService;
      const deploy = yield* DeployService;
      const project = yield* ProjectService;

      return [auth, build, deploy, project].every((s) => s !== null);
    });

    const result = await Effect.runPromise(program.pipe(Effect.provide(LiveLayer)));

    expect(result).toBe(true);
  });
});
