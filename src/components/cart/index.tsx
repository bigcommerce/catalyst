import React, { useEffect } from 'react';

import { clientClient } from '../../client/client';

import { createCartMutation } from './createCartMutation';
import { getCartQuery, getCartQueryWithId } from './getCartQuery';

const Cart = () => {
  useEffect(() => {
    const getCartWithId = async () => {
      const res = await clientClient.query({
        query: getCartQueryWithId,
        variables: { entityId: '804a1b53-9189-4e72-93a6-0f2fb32581a5' },
      });

      const data: unknown = await res.json();

      console.log('--------------------');
      console.log(data, 'data in getCartWithId');
      console.log('--------------------');
    };

    const getCart = async () => {
      const res = await clientClient.query({
        query: getCartQuery,
      });

      const data: unknown = await res.json();

      console.log('--------------------');
      console.log(data, 'data in getCart');
      console.log('--------------------');
    };

    const createCart = async () => {
      const res = await clientClient.mutate({
        mutation: createCartMutation,
        variables: {
          createCartInput: {
            lineItems: [
              {
                quantity: 1,
                productEntityId: 111,
              },
            ],
          },
        },
      });
      const data: unknown = await res.json();

      console.log('--------------------');
      console.log(data, 'data in createCart');
      console.log('--------------------');
    };

    void getCart();
    void getCartWithId();
    void createCart();
  }, []);

  return <div>Cart</div>;
};

export { Cart };
