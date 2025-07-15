import { Style, TextInput } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import { MakeswiftGraphQLQuery } from './client';

runtime.registerComponent(MakeswiftGraphQLQuery, {
  type: 'graphql-query',
  label: 'GraphQL Query',
  props: {
    className: Style(),
    storeHash: TextInput({
      label: 'Store Hash',
      defaultValue: '',
      placeholder: 'Enter your BigCommerce store hash',
    }),
    token: TextInput({
      label: 'Storefront API Token',
      defaultValue: '',
      placeholder: 'Enter your storefront API token',
    }),
    query: TextInput({
      label: 'GraphQL Query',
      defaultValue: `query {
  site {
    products(first: 5) {
      edges {
        node {
          entityId
          name
          prices {
            price {
              value
              currencyCode
            }
          }
        }
      }
    }
  }
}`,
      multiline: true,
      placeholder: 'Enter your GraphQL query',
    }),
    variables: TextInput({
      label: 'Variables (JSON)',
      defaultValue: '{}',
      multiline: true,
      placeholder: 'Enter variables as JSON object',
    }),
  },
});
