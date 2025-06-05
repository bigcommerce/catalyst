import { z } from 'zod';

import { testEnv } from '~/tests/environment';

import {
  TestApiClientBodyParseError,
  TestApiClientResponseError,
  TestApiClientSchemaError,
} from './errors';

type JsonPrimitive = string | number | boolean | null | undefined;
type JsonValue = JsonPrimitive | JsonValue[] | JsonObject;
type JsonArray = JsonValue[];

interface JsonObject {
  [key: string]: JsonValue;
}

type RequestBody = string | JsonObject | JsonArray;

interface RequestConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: RequestBody;
}

interface ApiClientResponse {
  then: (
    onFulfilled: (value: unknown) => Promise<unknown>,
    onRejected?: (reason: unknown) => Promise<unknown>,
  ) => Promise<unknown>;
  parse: <Out, In = Out>(schema: z.ZodType<Out, z.ZodTypeDef, In>) => Promise<Out>;
}

function clientResponse({
  path,
  method,
  request,
}: {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  request: Promise<Response>;
}): ApiClientResponse {
  const handleResponse = async (res: Response): Promise<unknown> => {
    const { status, statusText } = res;

    // Parse as text first since body can only be consumed once.
    const responseText = await res.text();

    if (!res.ok) {
      throw new TestApiClientResponseError(path, method, status, statusText, responseText);
    }

    const contentType = res.headers.get('content-type') ?? '';

    if (
      ['application/json', 'application/problem+json'].includes(contentType) &&
      responseText.length > 0
    ) {
      try {
        return JSON.parse(responseText);
      } catch {
        throw new TestApiClientBodyParseError(path, method, responseText);
      }
    }

    return responseText.length > 0 ? responseText : undefined;
  };

  const response = request.then((res) => handleResponse(res));

  return {
    then: (
      onFulfilled: (value: unknown) => Promise<unknown>,
      onRejected?: (reason: unknown) => Promise<unknown>,
    ) => response.then(onFulfilled, onRejected),
    parse: async <Out, In = Out>(schema: z.ZodType<Out, z.ZodTypeDef, In>): Promise<Out> => {
      try {
        return schema.parse(await response);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new TestApiClientSchemaError(path, method, error);
        }

        throw error;
      }
    },
  };
}

function httpRequest(path: string, config: RequestConfig): ApiClientResponse {
  if (!testEnv.BIGCOMMERCE_ACCESS_TOKEN) {
    throw new Error('BIGCOMMERCE_ACCESS_TOKEN is not set');
  }

  if (!testEnv.BIGCOMMERCE_STORE_HASH) {
    throw new Error('BIGCOMMERCE_STORE_HASH is not set');
  }

  const accessToken = testEnv.BIGCOMMERCE_ACCESS_TOKEN;
  const storeHash = testEnv.BIGCOMMERCE_STORE_HASH;
  const apiUrl = `https://${testEnv.BIGCOMMERCE_ADMIN_API_HOST}/stores/${storeHash}`;
  const { method, headers, body: bodyInput } = config;
  const body = typeof bodyInput === 'string' ? bodyInput : JSON.stringify(bodyInput);
  const req = fetch(`${apiUrl}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Auth-Token': accessToken,
      ...headers,
    },
    body,
  });

  return clientResponse({ path, method, request: req });
}

export const httpClient = {
  get: (path: string) => httpRequest(path, { method: 'GET' }),
  post: (path: string, body?: RequestBody) => httpRequest(path, { method: 'POST', body }),
  put: (path: string, body?: RequestBody) => httpRequest(path, { method: 'PUT', body }),
  delete: (path: string) => httpRequest(path, { method: 'DELETE' }),
};
