import { client } from '..';
import { graphql } from '../generated';

export const LOGIN_MUTATION = /* GraphQL */ `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      customer {
        entityId
      }
    }
  }
`;

export const login = async (email: string, password: string) => {
  const mutation = graphql(LOGIN_MUTATION);

  const response = await client.fetch({
    document: mutation,
    variables: { email, password },
  });

  return response.data.login.customer;
};
