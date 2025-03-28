import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql } from '~/client/graphql';

const CustomerQuery = graphql(`
  query Customer {
    customer {
      email
      firstName
      lastName
      entityId
      customerGroupId
      storeCredit {
        value
      }
      addresses {
        edges {
          node {
            address1
            address2
            city
            company
            countryCode
            entityId
            firstName
            lastName
            phone
            postalCode
            stateOrProvince
            formFields {
              name
              entityId
            }
          }
        }
      }
    }
  }
`);

export const getCustomer = async () => {
  const customerAccessToken = await getSessionCustomerAccessToken();

  try {
    return await client.fetch({
      document: CustomerQuery,
      fetchOptions: { cache: 'no-store' },
      customerAccessToken,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    throw error;
  }
};
