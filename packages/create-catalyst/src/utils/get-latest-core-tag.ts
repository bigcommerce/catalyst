import * as z from 'zod';

export const getLatestCoreTag = async () => {
  const rawPackageJsonUrl =
    'https://raw.githubusercontent.com/bigcommerce/catalyst/main/core/package.json';

  const response = await fetch(rawPackageJsonUrl);

  try {
    const { version } = z.object({ version: z.string() }).parse(await response.json());

    return `@bigcommerce/catalyst-core@${version}`;
  } catch {
    throw new Error('Unable to determine the latest valid Catalyst release');
  }
};
