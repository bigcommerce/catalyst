import { http } from 'msw';
import { setupServer } from 'msw/node';

import { getLatestCoreTag } from './get-latest-core-tag';

const handlers = [
  http.get(
    'https://raw.githubusercontent.com/bigcommerce/catalyst/main/apps/core/package.json',
    () => {
      return new Response('{ "name": "@bigcommerce/catalyst-core", "version": "0.1.0" }');
    },
  ),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('getLatestCoreTag', () => {
  it('should return the latest core tag', async () => {
    const latestTag = await getLatestCoreTag();

    expect(latestTag).toBe('@bigcommerce/catalyst-core@0.1.0');
  });

  it('should throw an error if the latest core tag is not found', async () => {
    server.use(
      http.get(
        'https://raw.githubusercontent.com/bigcommerce/catalyst/main/apps/core/package.json',
        () => {
          return new Response('{ "name": "@bigcommerce/catalyst-core" }');
        },
      ),
    );

    await expect(getLatestCoreTag()).rejects.toThrow(
      'Unable to determine the latest valid Catalyst release',
    );
  });
});
