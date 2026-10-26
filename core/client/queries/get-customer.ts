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

  if (!customerAccessToken) {
    return { data: { customer: null } satisfies GetCustomerGroupResponse };
  }

  const { data, errors } = await client.fetch({
    document: GetCustomerGroup,
    customerAccessToken,
    fetchOptions: { cache: 'no-store' },
  });

  if (errors) {
    throw new Error(errors.map((error) => error.message).join(', '));
  }

  return { data };
}
