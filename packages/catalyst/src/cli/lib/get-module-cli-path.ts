/* eslint-disable no-underscore-dangle */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export function getModuleCliPath() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  return join(__dirname, '..');
}
