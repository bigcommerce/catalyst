import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { graphql, ResultOf } from '~/client/graphql';

export const GetCustomerGroup = graphql(`
  query CustomerGroup {
    customer {
      customerGroupId
    }
  }
`);

export type GetCustomerGroupResponse = ResultOf<typeof GetCustomerGroup>;

export async function getCustomerGroupId() {
  const customerAccessToken = await getSessionCustomerAccessToken();

  const { data, errors } = await client.fetch({
    document: GetCustomerGroup,
    customerAccessToken,
  });

  if (errors) {
    // eslint-disable-next-line no-console
    console.error(
      'Failed to fetch customer group:',
      errors.map((error) => error.message).join(', '),
    );
    throw new Error('Failed to fetch customer group.');
  }

  return { data };
}
