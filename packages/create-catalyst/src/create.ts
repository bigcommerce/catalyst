import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import fsExtra from 'fs-extra';
import { downloadTemplate } from 'giget';
import path from 'path';

import { checkNodeVersion } from './utils/checkNodeVersion';
import { getPackageManager } from './utils/getPackageManager';

export const create = async (name: string) => {
  checkNodeVersion();

  const pkgMgr = getPackageManager();

  console.log();
  console.log(`Creating Catalyst Storefront: ${name} with ${pkgMgr}`);
  console.log();

  const { dir } = await downloadTemplate('github:bigcommerce/catalyst/apps/core', {
    dir: `./${name}`,
  });

  const pkgJsonFilePath = path.join(dir, 'package.json');
  const pkgJson = fsExtra.readJsonSync(pkgJsonFilePath) as {
    [key: string]: unknown;
    name: string;
    dependencies: Record<string, string>;
    devDependencies: Record<string, string>;
  };

  pkgJson.name = name;

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
  }

  pkgJson.devDependencies = reversionedDevDependencies;

  fsExtra.writeJsonSync(pkgJsonFilePath, pkgJson, {
    spaces: 2,
  });

  writeFileSync(path.join(dir, '.npmrc'), '@bigcommerce:registry=http://localhost:4873/\n');

  execSync('cp .env.example .env.local', { cwd: dir, stdio: 'inherit' });

  console.log('Installing dependencies:');
  console.log();

  execSync('npm install --legacy-peer-deps', { cwd: dir, stdio: 'inherit' });

  console.log();
  console.log(`Success! Created ${name} and installed dependencies.`);
  console.log();
  console.log('Next steps:');
  console.log();
  console.log(`cd ./${name}`);
  console.log('Modify .env.local');
  console.log(`${pkgMgr} run dev`);
  console.log();
};
