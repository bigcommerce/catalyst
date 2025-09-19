import { GraphQL } from './types';

export function getLoginMutations(graphql: GraphQL) {
  const LoginMutation = graphql(`
    mutation LoginMutation($email: String!, $password: String!, $cartEntityId: String) {
      login(email: $email, password: $password, guestCartEntityId: $cartEntityId) {
        customerAccessToken {
          value
          expiresAt
        }
        customer {
          entityId
          firstName
          lastName
          email
          phone
          customerGroupId
          customerGroupName
          company
          taxExemptCategory
          attributeCount
        }
        cart {
          entityId
        }
      }
    }
  `);

  const LoginWithTokenMutation = graphql(`
    mutation LoginWithCustomerLoginJwtMutation($jwt: String!, $cartEntityId: String) {
      loginWithCustomerLoginJwt(jwt: $jwt, guestCartEntityId: $cartEntityId) {
        customerAccessToken {
          value
          expiresAt
        }
        customer {
          entityId
          firstName
          lastName
          email
          phone
          customerGroupId
          customerGroupName
          company
          taxExemptCategory
          attributeCount
        }
        cart {
          entityId
        }
      }
    }
  `);

  const LogoutMutation = graphql(`
    mutation LogoutMutation($cartEntityId: String) {
      logout(cartEntityId: $cartEntityId) {
        result
        cartUnassignResult {
          cart {
            entityId
          }
        }
      }
    }
  `);

  return {
    LoginMutation,
    LoginWithTokenMutation,
    LogoutMutation,
  };
}
