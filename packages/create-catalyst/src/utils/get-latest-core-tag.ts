import * as z from 'zod';

export const getLatestCoreTag = async () => {
  const latestReleasesUrl = 'https://api.github.com/repos/bigcommerce/catalyst/releases';

  const response = await fetch(latestReleasesUrl);

  const releases = z.array(z.object({ tag_name: z.string() })).parse(await response.json());

  const latestCoreRelease = releases.find((release) =>
    release.tag_name.startsWith('@bigcommerce/catalyst-core'),
  );

  if (!latestCoreRelease) {
    throw new Error('Could not find the latest Catalyst release');
  }

  return latestCoreRelease.tag_name;
};
