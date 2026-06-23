import { mkdirSync } from 'fs';
import { Readable } from 'stream';
import { pipeline } from 'stream/promises';
import type { ReadableStream as NodeReadableStream } from 'stream/web';
import { x } from 'tar';

import { consola } from './logger';

const SUBDIR = 'core';
const MAX_ATTEMPTS = 3;

const codeloadUrl = (repository: string, ref: string) =>
  `https://codeload.github.com/${repository}/tar.gz/${encodeURIComponent(ref)}`;

const wait = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

// Download the repo tarball from GitHub's codeload endpoint and stream-extract
// ONLY the `core/` subdirectory into `projectDir`, so merchants receive a clean
// standalone project instead of the whole monorepo. Mirrors create-next-app:
// fetch -> stream.pipeline -> tar.x({ strip, filter }).
//
// The archive's top-level directory is dynamic (e.g.
// `catalyst--bigcommerce-catalyst-core-1.6.2` for a tag, `catalyst-canary` for a
// branch), so we never hardcode it — `filter` keeps entries whose first path
// segment after the top dir is `core/`, and `strip: 2` drops `<top>/core` so the
// contents land at the project root.
const downloadAndExtract = async (repository: string, ref: string, projectDir: string) => {
  const url = codeloadUrl(repository, ref);
  const response = await fetch(url);

  if (!response.ok || !response.body) {
    throw new Error(`Failed to download ${url} (HTTP ${response.status})`);
  }

  await pipeline(
    // Node's global fetch types `body` as the DOM ReadableStream; it is the same
    // object Readable.fromWeb expects at runtime.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    Readable.fromWeb(response.body as NodeReadableStream<Uint8Array>),
    x({
      cwd: projectDir,
      strip: 2,
      filter: (path) => path.split('/')[1] === SUBDIR,
    }),
  );
};

// Retries the download up to MAX_ATTEMPTS with linear backoff, following
// create-next-app's pattern. Recursive rather than looped to keep each await off
// the hot loop path (and satisfy lint).
const attemptDownload = async (
  repository: string,
  ref: string,
  projectDir: string,
  attempt = 1,
): Promise<void> => {
  try {
    await downloadAndExtract(repository, ref, projectDir);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';

    if (attempt >= MAX_ATTEMPTS) {
      throw new Error(`Failed to download Catalyst after ${MAX_ATTEMPTS} attempts: ${message}`);
    }

    consola.warn(`Download attempt ${attempt} failed (${message}). Retrying...`);
    await wait(attempt * 1000);

    return attemptDownload(repository, ref, projectDir, attempt + 1);
  }
};

export const extractCatalyst = async ({
  repository,
  ref,
  projectDir,
}: {
  repository: string;
  ref: string;
  projectDir: string;
}) => {
  consola.info(`Downloading ${repository}#${ref}...`);

  mkdirSync(projectDir, { recursive: true });

  await attemptDownload(repository, ref, projectDir);
};
