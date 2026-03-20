#!/usr/bin/env node

const semver = require('semver');
const { CATALYST_REQUIRED_NODE_VERSIONS } = require('./supported-node-versions.cjs');

const catalystRequiredNodeVersions = CATALYST_REQUIRED_NODE_VERSIONS;
const userNodeVersion = process.version;

if (!catalystRequiredNodeVersions.some((version) => semver.satisfies(userNodeVersion, version))) {
  const prettyRequiredNodeVersions = catalystRequiredNodeVersions
    .map((version) => semver.coerce(version).major)
    .join(', ');

  console.error(`\n\x1b[31mYou are using Node.js ${userNodeVersion}.`);
  console.error(
    `You must use one of the following Node.js versions: ${prettyRequiredNodeVersions}\x1b[0m\n`,
  );
  process.exit(1);
}

// eslint-disable-next-line import/dynamic-import-chunkname, import/extensions
import('../dist/index.js').catch((err) => {
  console.error(err);
  process.exit(1);
});
