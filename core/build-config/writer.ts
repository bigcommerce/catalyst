/* eslint-disable no-console */
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

import { buildConfigSchema } from './schema';

const destinationPath = dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = join(destinationPath, 'build-config.json');

// This fn is only intended to be used in the build process (next.config.ts)
export async function writeBuildConfig(data: unknown) {
  try {
    buildConfigSchema.parse(data);

    await writeFile(CONFIG_FILE, JSON.stringify(data), 'utf8');
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Data validation failed:', error.errors);
    } else {
      console.error('Error writing build-config.json:', error);
    }

    throw error;
  }
}
