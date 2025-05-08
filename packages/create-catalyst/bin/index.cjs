#!/usr/bin/env node

const semver = require('semver');

/**
 * Discourage use of odd-numbered versions of Node.js
 * @see https://nodejs.org/en/about/previous-releases#nodejs-releases
 */
const catalystRequiredNodeVersions = ['^20', '^22'];
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
