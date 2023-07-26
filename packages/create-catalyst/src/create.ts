// TODO: fix eslint errors
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable import/no-named-as-default-member */

import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import fsExtra from 'fs-extra';
import { downloadTemplate } from 'giget';
import path from 'path';

import { checkNodeVersion } from './utils/checkNodeVersion';
import { getPackageManager } from './utils/getPackageManager';

export const create = async (name: string, { example }: { example: string }) => {
  checkNodeVersion();

  const pkgMgr = getPackageManager();

  console.log(`\nCreating Catalyst Storefront: ${name}\n`);

  // TODO: with makeswift

  let dir = '';

  switch (example) {
    case undefined: {
      const result = await downloadTemplate('github:bigcommerce/catalyst/apps/core', {
        dir: `./${name}`,
      });

      dir = result.dir;
      break;
    }

    case 'makeswift': {
      const result = await downloadTemplate('github:bigcommerce/catalyst/apps/with-makeswift', {
        dir: `./${name}`,
      });

      dir = result.dir;
      break;
    }

    default: {
      throw new Error('invalid option passed to --example');
    }
  }

  const pkgJsonFilePath = path.join(dir, 'package.json');
  const pkgJson = fsExtra.readJsonSync(pkgJsonFilePath) as {
    [key: string]: unknown;
    name: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };

  pkgJson.name = name;

  // #region remove in prod
  const reversionedDependencies: { [key: string]: string } = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const [pkg, version] of Object.entries(pkgJson.dependencies)) {
    reversionedDependencies[pkg] = version;

    if (pkg.includes('@bigcommerce')) {
      const newVersion = '*';

      reversionedDependencies[pkg] = newVersion;
    }
  }

  pkgJson.dependencies = reversionedDependencies;

  const reversionedDevDependencies: { [key: string]: string } = {};

  // eslint-disable-next-line no-restricted-syntax
  for (const [pkg, version] of Object.entries(pkgJson.devDependencies)) {
    reversionedDevDependencies[pkg] = version;

    if (pkg.includes('@bigcommerce')) {
      const newVersion = '*';

      reversionedDevDependencies[pkg] = newVersion;
    }

    // TODO: yarn can't handle double zeroes? e.g., ^18.13.00
    if (pkg.includes('@types/node')) {
      reversionedDevDependencies[pkg] = '^18.13.0';
    }
  }

  pkgJson.devDependencies = reversionedDevDependencies;
  // #endregion remove in prod

  fsExtra.writeJsonSync(pkgJsonFilePath, pkgJson, {
    spaces: 2,
  });

  // #region remove in prod
  if (pkgMgr === 'yarn') {
    writeFileSync(
      path.join(dir, '.yarnrc.yml'),
      [`npmScopes:`, `  bigcommerce:`, `    npmRegistryServer: "http://localhost:4873"`].join('\n'),
    );
  }

  if (pkgMgr === 'npm' || pkgMgr === 'pnpm') {
    writeFileSync(path.join(dir, '.npmrc'), '@bigcommerce:registry=http://localhost:4873/\n');
  }
  // #endregion remove in prod

  execSync('cp .env.example .env.local', { cwd: dir, stdio: 'inherit' });

  console.log(`Installing dependencies with ${pkgMgr}:\n`);

  if (pkgMgr === 'npm') {
    execSync('npm install --legacy-peer-deps', { cwd: dir, stdio: 'inherit' });
  }

  if (pkgMgr === 'pnpm') {
    execSync('pnpm install', { cwd: dir, stdio: 'inherit' });
  }

  if (pkgMgr === 'yarn') {
    // TODO: this hangs after console.log below, unsure why
    execSync('yarn install', { cwd: dir, stdio: 'inherit' });
  }

  console.log(`\nSuccess! Created ${name} and installed dependencies.`);
  console.log('\nNext steps:');
  console.log(`\ncd ./${name}`);
  console.log('Modify .env.local');
  console.log(`${pkgMgr} run dev\n`);
};
