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
    throw new Error(errors.map((error) => error.message).join(', '));
  }

  return { data };
}
