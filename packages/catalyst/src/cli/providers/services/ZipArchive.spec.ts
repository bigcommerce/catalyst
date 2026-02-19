import { Effect, Layer } from 'effect';
import { mkdtemp, rm, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, beforeAll, describe, expect, test, vi } from 'vitest';

import { ZipError } from '../../core/errors';
import { consola } from '../../lib/logger';

import { ZipArchive, ZipArchiveLive } from './ZipArchive';

let tmpDir: string;

beforeAll(async () => {
  consola.mockTypes(() => vi.fn());
  tmpDir = await mkdtemp(join(tmpdir(), 'zip-test-'));
});

afterAll(async () => {
  await rm(tmpDir, { recursive: true, force: true });
});

describe('ZipArchive service', () => {
  test('creates a zip from a directory', async () => {
    const srcDir = join(tmpDir, 'src');
    const outputPath = join(tmpDir, 'output.zip');

    await mkdir(srcDir, { recursive: true });
    await writeFile(join(srcDir, 'test.txt'), 'hello');

    const program = Effect.gen(function* () {
      const zip = yield* ZipArchive;

      yield* zip.createFromDirectory(srcDir, outputPath);
    });

    await Effect.runPromise(program.pipe(Effect.provide(ZipArchiveLive)));

    expect(existsSync(outputPath)).toBe(true);
  });

  test('uses custom prefix', async () => {
    const srcDir = join(tmpDir, 'src2');
    const outputPath = join(tmpDir, 'output2.zip');

    await mkdir(srcDir, { recursive: true });
    await writeFile(join(srcDir, 'file.txt'), 'content');

    const program = Effect.gen(function* () {
      const zip = yield* ZipArchive;

      yield* zip.createFromDirectory(srcDir, outputPath, 'custom');
    });

    await Effect.runPromise(program.pipe(Effect.provide(ZipArchiveLive)));

    expect(existsSync(outputPath)).toBe(true);
  });
});

describe('ZipArchive test layer', () => {
  test('can use a test implementation', async () => {
    const calls: Array<{ srcDir: string; outputPath: string }> = [];

    const TestZipArchive = Layer.succeed(ZipArchive, {
      createFromDirectory: (srcDir, outputPath) => {
        calls.push({ srcDir, outputPath });

        return Effect.void;
      },
    });

    const program = Effect.gen(function* () {
      const zip = yield* ZipArchive;

      yield* zip.createFromDirectory('/src', '/out.zip');
    });

    await Effect.runPromise(program.pipe(Effect.provide(TestZipArchive)));

    expect(calls).toEqual([{ srcDir: '/src', outputPath: '/out.zip' }]);
  });

  test('test layer can simulate errors', async () => {
    const TestZipArchive = Layer.succeed(ZipArchive, {
      createFromDirectory: () => Effect.fail(new ZipError({ message: 'simulated' })),
    });

    const program = Effect.gen(function* () {
      const zip = yield* ZipArchive;

      yield* zip.createFromDirectory('/src', '/out.zip');
    });

    const exit = await Effect.runPromiseExit(program.pipe(Effect.provide(TestZipArchive)));

    expect(exit._tag).toBe('Failure');
  });
});
