import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';

import { server } from '../../../tests/mocks/node';

import { createProject } from './project';

const API = { storeHash: 'store', accessToken: 'token', apiHost: 'api.example.com' };
const CREATE_PROJECT_URL = 'https://:apiHost/stores/:storeHash/v3/infrastructure/projects';

const NOT_ENABLED_MESSAGE =
  'Infrastructure Projects API not enabled. If you are part of the beta, contact support@bigcommerce.com to enable it.';

describe('createProject', () => {
  // The API returns 403 when the store lacks the scope and 404 when the
  // Infrastructure Projects feature flag is off. Both mean "not enabled for this
  // store", so both surface the same actionable "join the beta" guidance rather
  // than a cryptic `Failed to create project: Not Found`.
  it.each([403, 404])(
    'surfaces the not-enabled guidance when the API responds %i',
    async (status) => {
      server.use(
        http.post(
          CREATE_PROJECT_URL,
          () => new HttpResponse(null, { status, statusText: 'Not Found' }),
        ),
      );

      await expect(
        createProject('my-project', API.storeHash, API.accessToken, API.apiHost),
      ).rejects.toThrow(NOT_ENABLED_MESSAGE);
    },
  );
});
