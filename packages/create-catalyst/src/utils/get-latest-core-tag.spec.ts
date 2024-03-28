import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { getLatestCoreTag } from './get-latest-core-tag';

const handlers = [
  http.get('https://api.github.com/repos/bigcommerce/catalyst/releases', () => {
    return HttpResponse.json([
      {
        tag_name: '@bigcommerce/catalyst-core@1.0.1',
      },
      {
        tag_name: '@bigcommerce/catalyst-core@1.0.0',
      },
    ]);
  }),
];

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe('getLatestCoreTag', () => {
  it('should return the latest core tag', async () => {
    const latestTag = await getLatestCoreTag();

    expect(latestTag).toBe('@bigcommerce/catalyst-core@1.0.1');
  });

  it('should throw an error if the latest core tag is not found', async () => {
    server.use(
      http.get('https://api.github.com/repos/bigcommerce/catalyst/releases', () => {
        return HttpResponse.json([]);
      }),
    );

    await expect(getLatestCoreTag()).rejects.toThrow('Could not find the latest Catalyst release');
  });
});
