import React, { useContext } from 'react';

import { CartContext } from './cartContext';

const Cart = () => {
  console.log('Cart');

  const {
    cart: { totalQuantity, cartItems },
  } = useContext(CartContext);

  console.log(cartItems, 'cartItems in Cart');

  return (
    <div>
      <div>Cart Total - {totalQuantity}</div>
      <div>
        <ul>
          {cartItems.map(({ entityId, name, quantity }) => {
            return (
              <li key={entityId}>
                {name} - {quantity}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export { Cart };
