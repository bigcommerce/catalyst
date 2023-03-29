import React, { useEffect, useState } from 'react';

import { getBrowserClient } from '../../graphql/browser';

import { createCartMutation } from './createCartMutation';
import { getCartQuery, getCartQueryWithId } from './getCartQuery';

const setCookie = (name: string, value: string, days: number) => {
  let expires = '';

  if (days) {
    const date = new Date();

    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  document.cookie = `${name}=${value || ''}${expires}; path=/`;
};
const getCookie = (name: string) => {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];

    while (c.charAt(0) == ' ') {
      c = c.substring(1, c.length);
    }

    if (c.indexOf(nameEQ) == 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }

  return null;
};
const eraseCookie = (name: string) => {
  document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;`;
};

const Cart = () => {
  const [cart, setCart] = useState(null);

  useEffect(() => {
    const getCartWithId = async (entityId: string) => {
      const client = getBrowserClient();

      const res = await client.query({
        query: getCartQueryWithId,
        variables: { entityId },
      });

      const data: unknown = await res.json();

      console.log('--------------------');
      console.log(data, 'data in getCartWithId');
      console.log('--------------------');
    };

    const getCart = async () => {
      const client = getBrowserClient();

      const res = await client.query({
        query: getCartQuery,
      });

      const data: unknown = await res.json();

      console.log('--------------------');
      console.log(data, 'data in getCart');
      console.log('--------------------');
    };

    const createCart = async () => {
      const client = getBrowserClient();

      const res = await client.mutate({
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

    // void getCart();
    // void getCartWithId();
    // void createCart();

    const cartId = getCookie('cart_id');

    console.log(cartId, 'cartId');

    if (cartId) {
      setCart(cart);
    }
  }, []);

  useEffect(() => {
    console.log(cart, 'cart');
  }, [cart]);

  return <div>Cart</div>;
};

export { Cart };
