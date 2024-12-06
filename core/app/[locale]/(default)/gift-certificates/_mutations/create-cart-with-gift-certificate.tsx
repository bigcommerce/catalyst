import { getSessionCustomerId } from '~/auth';
import { client } from '~/client';
import { graphql, VariablesOf } from '~/client/graphql';

const CreateCartMutation = graphql(`
  mutation CreateCartMutation($createCartInput: CreateCartInput!) {
    cart {
      createCart(input: $createCartInput) {
        cart {
          entityId
        }
      }
    }
  }
`);

type Variables = VariablesOf<typeof CreateCartMutation>;
type CreateCartInput = Variables['createCartInput'];
type GiftCertificates = CreateCartInput['giftCertificates'];

export const createCartWithGiftCertificate = async (giftCertificates: GiftCertificates) => {
  const customerId = await getSessionCustomerId();

  const response = await client.fetch({
    document: CreateCartMutation,
    variables: {
      createCartInput: {
        giftCertificates,
      },
    },
    customerId,
    fetchOptions: { cache: 'no-store' },
  });

  return response.data.cart.createCart?.cart;
};
