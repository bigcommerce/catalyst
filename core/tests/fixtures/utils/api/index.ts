/* eslint-disable valid-jsdoc */
import { TestInfo } from '@playwright/test';
import { z } from 'zod';

import { testEnv } from '~/tests/environment';

import { TestApiClientError } from './errors';

type JsonPrimitive = string | number | boolean | null | undefined;
type JsonValue = JsonPrimitive | JsonValue[] | JsonObject;
type JsonArray = JsonValue[];

interface JsonObject {
  [key: string]: JsonValue;
}

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type RequestBody = string | JsonObject | JsonArray;

interface RequestConfig {
  method: RequestMethod;
  headers?: Record<string, string>;
  body?: RequestBody;
}

interface TestApiClientResponse {
  then: (
    onFulfilled: (value: unknown) => Promise<unknown>,
    onRejected?: (reason: unknown) => Promise<unknown>,
  ) => Promise<unknown>;
  parse: <T>(schema: z.ZodSchema<T>) => Promise<T>;
}

function clientResponse({
  path,
  method,
  request,
}: {
  path: string;
  method: RequestMethod;
  request: Promise<Response>;
}): TestApiClientResponse {
  const handleResponse = async (res: Response): Promise<unknown> => {
    const { status, statusText } = res;

    // Parse as text first since body can only be consumed once.
    const responseText = await res.text();

    if (!res.ok) {
      throw new TestApiClientError({ path, method, message: { status, statusText, responseText } });
    }

    const contentType = res.headers.get('content-type') ?? '';

    if (
      ['application/json', 'application/problem+json'].includes(contentType) &&
      responseText.length > 0
    ) {
      try {
        return JSON.parse(responseText);
      } catch {
        throw new TestApiClientError({
          path,
          method,
          message: `Failed to parse response as JSON: ${responseText}`,
        });
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
    parse: async <T>(schema: z.ZodSchema<T>): Promise<T> => {
      try {
        return schema.parse(await response);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new TestApiClientError({
            path,
            method,
            message: `Failed to parse response as zod schema\n${error.message}`,
          });
        }

        throw error;
      }
    },
  };
}

export class TestApiClient {
  private readonly accessToken: string;
  private readonly storeHash: string;
  private readonly apiUrl: string;

  constructor(private readonly testInfo: TestInfo) {
    if (!testEnv.BIGCOMMERCE_ACCESS_TOKEN) {
      throw new Error('BIGCOMMERCE_ACCESS_TOKEN is not set');
    }

    if (!testEnv.BIGCOMMERCE_STORE_HASH) {
      throw new Error('BIGCOMMERCE_STORE_HASH is not set');
    }

    this.accessToken = testEnv.BIGCOMMERCE_ACCESS_TOKEN;
    this.storeHash = testEnv.BIGCOMMERCE_STORE_HASH;
    this.apiUrl = `https://${testEnv.BIGCOMMERCE_ADMIN_API_HOST}/stores/${this.storeHash}`;
  }

  /**
   * Makes a GET request to the BigCommerce API. Returns either an unknown promise, or can be parsed with a zod schema. \
   * *NOTE:* API should only be used within a test fixture to ensure data safety.
   */
  get(path: string): TestApiClientResponse {
    return this.request(path, { method: 'GET' });
  }

  /**
   * Makes a POST request to the BigCommerce API. Returns either an unknown promise, or can be parsed with a zod schema. \
   * *NOTE:* API should only be used within a test fixture to ensure data safety.
   */
  post(path: string, body?: RequestBody): TestApiClientResponse {
    return this.request(path, { method: 'POST', body });
  }

  /**
   * Makes a PUT request to the BigCommerce API. Returns either an unknown promise, or can be parsed with a zod schema. \
   * *NOTE:* API should only be used within a test fixture to ensure data safety.
   */
  put(path: string, body?: RequestBody): TestApiClientResponse {
    return this.request(path, { method: 'PUT', body });
  }

  /**
   * Makes a DELETE request to the BigCommerce API. Returns either an unknown promise, or can be parsed with a zod schema. \
   * *NOTE:* API should only be used within a test fixture to ensure data safety.
   */
  delete(path: string): TestApiClientResponse {
    return this.request(path, { method: 'DELETE' });
  }

  private request(path: string, config: RequestConfig): TestApiClientResponse {
    this.testInfo.skip(
      ['POST', 'PUT', 'DELETE'].includes(config.method) && testEnv.TESTS_READ_ONLY,
      'Tests are running in read-only mode, so the request can not be made.',
    );

    const { method, headers, body: bodyInput } = config;
    const body = typeof bodyInput === 'string' ? bodyInput : JSON.stringify(bodyInput);
    const req = fetch(`${this.apiUrl}${path}`, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Auth-Token': this.accessToken,
        ...headers,
      },
      body,
    });

    return clientResponse({ path, method, request: req });
  }
}
