import { outputFileSync, readJsonSync, writeJsonSync } from 'fs-extra/esm';
import set from 'lodash.set';
import { join } from 'path';
import * as z from 'zod';

export const patchYarn = ({ projectDir }: { projectDir: string }) => {
  const userAgent = process.env.npm_config_user_agent || '';
  const usingYarnBerry = userAgent.includes('yarn/2') || userAgent.includes('yarn/3');

  if (!usingYarnBerry) {
    return;
  }

  const yarnrcYml = 'nodeLinker: node-modules\n';

  outputFileSync(join(projectDir, '.yarnrc.yml'), yarnrcYml);

  const packageJson = z
    .object({})
    .passthrough()
    .parse(readJsonSync(join(projectDir, 'package.json')));

  set(packageJson, 'devDependencies.eslint-plugin-prettier', '');

  writeJsonSync(join(projectDir, 'package.json'), packageJson, { spaces: 2 });
};
