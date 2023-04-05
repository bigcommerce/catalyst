import Image from 'next/image';
import React, { useContext, useState } from 'react';

import { Badge } from '../../../reactant/components/Badge';
import { Button } from '../../../reactant/components/Button';
import { Link } from '../../../reactant/components/Link';
import { BinIcon } from '../../../reactant/icons/Bin';
import { CartIcon } from '../../../reactant/icons/Cart';

import { CartContext } from './cartContext';

const Cart = () => {
  const [open, setOpen] = useState(false);

  const {
    cart: { totalQuantity, cartItems },
    deleteCartItem,
  } = useContext(CartContext);

  return (
    <div>
      <span className="relative inline-block">
        <Badge
          className={`${Badge.default.className} absolute left-3/4 top-0 transform -translate-y-full`}
        >
          {totalQuantity}
        </Badge>
        <Button
          className={Button.iconOnly.className}
          onClick={() => setOpen((prevOpen) => !prevOpen)}
        >
          <CartIcon className="fill-[#000] stroke-[#000]" />
        </Button>
      </span>
      {open && (
        <div className="absolute right-0 top-100% shadow-lg bg-[#fff] z-10 mt-3 p3">
          <ul className="p-3">
            {cartItems.map(
              ({ brand, entityId, extendedListPrice, imageUrl, name, quantity, url }) => (
                <li className="flex justify-between" key={entityId}>
                  <Link className="flex" href={new URL(url).pathname}>
                    <Image alt={name} height={100} src={imageUrl} width={100} />
                    <span className="flex flex-col ml-3">
                      <span>{brand}</span>
                      {name} - {quantity}
                      <span>
                        {extendedListPrice.value} {extendedListPrice.currencyCode}
                      </span>
                    </span>
                  </Link>
                  <Button
                    className={Button.iconOnly.className}
                    onClick={() => deleteCartItem(entityId)}
                  >
                    <BinIcon className="fill-[#000] stroke-[#000]" />
                  </Button>
                </li>
              ),
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export { Cart };
