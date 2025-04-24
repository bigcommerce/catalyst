import { print } from 'graphql';
import { graphql as gql, HttpResponse } from 'msw';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, test } from 'vitest';

import { graphql } from '~/client/graphql';
import { server } from '~/msw.server';

import { POST } from './route';

// Mock the API requests
beforeEach(() => {
  server.use(
    gql.query('PaymentWalletWithInitializationDataQuery', () => {
      return HttpResponse.json({ data: { site: { paymentWalletWithInitializationData: null } } });
    }),
    gql.mutation('CreatePaymentWalletIntentMutation', () => {
      return HttpResponse.json({
        data: {
          payment: {
            paymentWallet: {
              createPaymentWalletIntent: {
                paymentWalletIntentData: {
                  __typename: 'PayPalCommercePaymentWalletIntentData',
                  orderId: '123',
                  approvalUrl: 'https://example.com/approval',
                  initializationEntityId: '456',
                },
                errors: [],
              },
            },
          },
        },
      });
    }),
  );
});

describe('query validation', () => {
  test('route handler with valid query', async () => {
    const query = graphql(`
      query PaymentWalletWithInitializationDataQuery(
        $paymentWalletEntityId: String!
        $cartEntityId: String
      ) {
        site {
          paymentWalletWithInitializationData(
            filter: { paymentWalletEntityId: $paymentWalletEntityId, cartEntityId: $cartEntityId }
          ) {
            initializationData
          }
        }
      }
    `);

    const request = new NextRequest('http://localhost:3000/api/wallets/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query: print(query),
        variables: JSON.stringify({
          paymentWalletEntityId: '123',
          cartEntityId: '456',
        }),
      }),
    });

    const response = await POST(request);
    const data: unknown = await response.json();

    expect(data).toMatchObject({ site: { paymentWalletWithInitializationData: null } });
  });

  test('route handler with invalid query name', async () => {
    const query = graphql(`
      query FooBar($paymentWalletEntityId: String!, $cartEntityId: String) {
        site {
          paymentWalletWithInitializationData(
            filter: { paymentWalletEntityId: $paymentWalletEntityId, cartEntityId: $cartEntityId }
          ) {
            initializationData
          }
        }
      }
    `);

    const request = new NextRequest('http://localhost:3000/api/wallets/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query: print(query),
        variables: JSON.stringify({
          paymentWalletEntityId: '123',
          cartEntityId: '456',
        }),
      }),
    });

    const response = await POST(request);
    const text = await response.text();

    expect(response.status).toBe(403);
    expect(text).toBe('Operation not allowed');
  });

  test('route handler with invalid query data', async () => {
    const query = graphql(`
      query PaymentWalletWithInitializationDataQuery {
        site {
          settings {
            storeName
          }
        }
      }
    `);

    const request = new NextRequest('http://localhost:3000/api/wallets/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query: print(query),
      }),
    });

    const response = await POST(request);
    const text = await response.text();

    expect(response.status).toBe(400);
    expect(text).toBe('Query is invalid');
  });
});

describe('mutation validation', () => {
  test('route handler with valid mutation', async () => {
    const mutation = graphql(`
      mutation CreatePaymentWalletIntentMutation(
        $paymentWalletEntityId: String!
        $cartEntityId: String!
      ) {
        payment {
          paymentWallet {
            createPaymentWalletIntent(
              input: { paymentWalletEntityId: $paymentWalletEntityId, cartEntityId: $cartEntityId }
            ) {
              paymentWalletIntentData {
                __typename
                ... on PayPalCommercePaymentWalletIntentData {
                  orderId
                  approvalUrl
                  initializationEntityId
                }
              }
              errors {
                __typename
                ... on CreatePaymentWalletIntentGenericError {
                  message
                }
                ... on Error {
                  message
                }
              }
            }
          }
        }
      }
    `);

    const request = new NextRequest('http://localhost:3000/api/wallets/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query: print(mutation),
        variables: JSON.stringify({
          paymentWalletEntityId: '123',
          cartEntityId: '456',
        }),
      }),
    });

    const response = await POST(request);
    const data: unknown = await response.json();

    expect(data).toMatchObject({
      payment: {
        paymentWallet: {
          createPaymentWalletIntent: {
            errors: [],
            paymentWalletIntentData: {
              __typename: 'PayPalCommercePaymentWalletIntentData',
              approvalUrl: 'https://example.com/approval',
              initializationEntityId: '456',
              orderId: '123',
            },
          },
        },
      },
    });
  });

  test('route handler with invalid mutation name', async () => {
    const mutation = graphql(`
      mutation FooBar($paymentWalletEntityId: String!, $cartEntityId: String!) {
        payment {
          paymentWallet {
            createPaymentWalletIntent(
              input: { paymentWalletEntityId: $paymentWalletEntityId, cartEntityId: $cartEntityId }
            ) {
              paymentWalletIntentData {
                __typename
                ... on PayPalCommercePaymentWalletIntentData {
                  orderId
                  approvalUrl
                  initializationEntityId
                }
              }
              errors {
                __typename
                ... on CreatePaymentWalletIntentGenericError {
                  message
                }
                ... on Error {
                  message
                }
              }
            }
          }
        }
      }
    `);

    const request = new NextRequest('http://localhost:3000/api/wallets/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query: print(mutation),
        variables: JSON.stringify({
          paymentWalletEntityId: '123',
          cartEntityId: '456',
        }),
      }),
    });

    const response = await POST(request);
    const text = await response.text();

    expect(response.status).toBe(403);
    expect(text).toBe('Operation not allowed');
  });

  test('route handler with invalid mutation data', async () => {
    const query = graphql(`
      mutation CreatePaymentWalletIntentMutation {
        logout {
          result
        }
      }
    `);

    const request = new NextRequest('http://localhost:3000/api/wallets/graphql', {
      method: 'POST',
      body: JSON.stringify({
        query: print(query),
      }),
    });

    const response = await POST(request);
    const text = await response.text();

    expect(response.status).toBe(400);
    expect(text).toBe('Query is invalid');
  });
});

test('route handler with invalid operation', async () => {
  const request = new NextRequest('http://localhost:3000/api/wallets/graphql', {
    method: 'POST',
    body: JSON.stringify({
      query: 'fragment Foo on Bar { baz }',
    }),
  });

  const response = await POST(request);
  const text = await response.text();

  expect(response.status).toBe(400);
  expect(text).toBe('No operation found');
});
