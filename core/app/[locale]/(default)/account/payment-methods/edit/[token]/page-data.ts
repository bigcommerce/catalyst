import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const EditStoredPaymentInstrumentQuery = graphql(`
  query EditStoredPaymentInstrumentQuery($first: Int!) {
    customer {
      storedPaymentInstruments(first: $first) {
        edges {
          node {
            token
            details {
              __typename
              ... on StoredCard {
                last4
                billingAddress {
                  firstName
                  lastName
                  email
                  company
                  address1
                  address2
                  city
                  stateOrProvince
                  stateOrProvinceCode
                  postalCode
                  countryCode
                  phone
                }
              }
            }
          }
        }
      }
    }
  }
`);

const MAX_PAGE_SIZE = 50;

export async function getStoredPaymentInstrument(token: string) {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data } = await client.fetch({
    document: EditStoredPaymentInstrumentQuery,
    variables: { first: MAX_PAGE_SIZE },
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  return (data.customer?.storedPaymentInstruments.edges ?? [])
    .map(({ node }) => node)
    .find((instrument) => instrument.token === token);
}
