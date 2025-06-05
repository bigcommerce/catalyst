import { z } from 'zod';

import { testEnv } from '~/tests/environment';

import { TestApiClientResponseError } from './errors';

class ApiClientResponse extends Promise<Response> {
  async parse<Out, In = Out>(
    schema: z.ZodType<Out, z.ZodTypeDef, In>,
  ): Promise<Out | Awaited<this>> {
    const response = await this;

    return schema.parse(response);
  }
}

function httpRequest(path: string, config: RequestInit): ApiClientResponse {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return new ApiClientResponse(async (resolve, reject) => {
    try {
      if (!testEnv.BIGCOMMERCE_ACCESS_TOKEN) {
        throw new Error('BIGCOMMERCE_ACCESS_TOKEN is not set');
      }

      if (!testEnv.BIGCOMMERCE_STORE_HASH) {
        throw new Error('BIGCOMMERCE_STORE_HASH is not set');
      }

      const {
        BIGCOMMERCE_ACCESS_TOKEN: accessToken,
        BIGCOMMERCE_STORE_HASH: storeHash,
        BIGCOMMERCE_ADMIN_API_HOST: host,
      } = testEnv;

      const { method, headers = {}, body } = config;

      const request = new Request(`https://${host}/stores/${storeHash}${path}`, {
        method,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Auth-Token': accessToken,
          ...Object.fromEntries(new Headers(headers).entries()),
        },
        body,
      });

      const response = await fetch(request);

      if (!response.ok) {
        reject(await TestApiClientResponseError.create(request, response));

        return;
      }

      resolve(response);
    } catch (err) {
      reject(err);
    }
  });
}

export const httpClient = {
  get: (path: string) => httpRequest(path, { method: 'GET' }),
  post: (path: string, requestInit?: RequestInit) =>
    httpRequest(path, { ...requestInit, method: 'POST', body: JSON.stringify(requestInit?.body) }),
  put: (path: string, body?: BodyInit) => httpRequest(path, { method: 'PUT', body }),
  delete: (path: string) => httpRequest(path, { method: 'DELETE' }),
};
