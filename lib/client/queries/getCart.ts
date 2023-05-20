import { client } from '../client';

export const getCart = async (entityId: string) => {
  const response = await client.query({
    site: {
      cart: {
        __args: {
          entityId,
        },
        lineItems: {
          totalQuantity: true,
          physicalItems: {
            name: true,
            imageUrl: true,
            entityId: true,
            listPrice: {
              currencyCode: true,
              value: true,
            },
          },
        },
      },
    },
  });

  return response.site.cart;
};
