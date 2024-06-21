import { graphql, HttpResponse } from 'msw';

let channel = '';

if (process.env.BIGCOMMERCE_CHANNEL_ID && process.env.BIGCOMMERCE_CHANNEL_ID !== '1') {
  channel = `-${process.env.BIGCOMMERCE_CHANNEL_ID}`;
}

graphql.link(
  `https://store-${process.env.BIGCOMMERCE_STORE_HASH ?? ''}${channel}.${process.env.BIGCOMMERCE_GRAPHQL_API_DOMAIN ?? 'mybigcommerce.com'}/graphql`,
);

export const handlers = [
  graphql.mutation('registerCustomer', ({ query, variables }) => {
    const { input, reCaptchaV2 } = variables;

    console.log('Intercepted a "registerCustomer" mutation:', { query, input });

    return HttpResponse.json({
      data: {
        customer: {
          registerCustomer: {
            customer: {
              firstName: input.firstName,
              lastName: input.lastName,
            },
            errors: [],
          },
        },
      },
    });
  }),
];
