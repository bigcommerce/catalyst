#!/usr/bin/env node

const semver = require('semver');

const catalystRequiredNodeVersion = '^20';
const userNodeVersion = process.version;

if (!semver.satisfies(userNodeVersion, catalystRequiredNodeVersion)) {
  console.error(`\n\x1b[31mYou are using Node.js ${userNodeVersion}.`);
  console.error(`Catalyst requires Node.js version ${catalystRequiredNodeVersion}.\x1b[0m\n`);
  process.exit(1);
}

// eslint-disable-next-line import/dynamic-import-chunkname, import/extensions
import('../dist/index.js').catch((err) => {
  console.error(err);
  process.exit(1);
});
