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
    cart: { amount, cartItems, totalQuantity },
    deleteCartLineItem,
  } = useContext(CartContext);

  return (
    <div>
      <span className="relative inline-block">
        <Badge
          className={`${Badge.default.className} absolute left-3/4 top-0 transform -translate-y-full`}
          label={`Your cart has ${totalQuantity} items`}
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
        <div className="absolute right-0 top-100% shadow-lg bg-[#fff] z-10 mt-6 p-6 sm:w-full md:w-9/12 lg:w-1/2 lg:w-[500px]">
          <div>
            {totalQuantity ? (
              <>
                <h2 className="font-bold text-3xl mb-6">Your Cart</h2>
                <ul>
                  {cartItems.map(
                    ({
                      brand,
                      entityId,
                      extendedListPrice,
                      imageUrl,
                      name,
                      quantity,
                      selectedOptions,
                      url,
                    }) => (
                      <li
                        className="flex justify-between border-t-2 border-[#CFD8DC] p-3"
                        key={entityId}
                      >
                        <Link className="flex" href={new URL(url).pathname}>
                          <Image alt={name} height={100} src={imageUrl} width={100} />
                          <span className="flex flex-col ml-3">
                            <span className="text-[#546E7A]">{brand}</span>
                            <span className="font-bold">{name}</span>
                            {selectedOptions.length
                              ? selectedOptions.map(({ name, value }, i) => {
                                  return (
                                    <span key={i}>
                                      {name}: {value}
                                      {i + 1 < selectedOptions.length && ', '}
                                    </span>
                                  );
                                })
                              : null}
                            <span>Quantity: {quantity}</span>
                            <span className="font-bold">
                              {extendedListPrice.value} {extendedListPrice.currencyCode}
                            </span>
                          </span>
                        </Link>
                        <Button
                          className={Button.iconOnly.className}
                          onClick={() => deleteCartLineItem(entityId)}
                        >
                          <BinIcon className="fill-[#000] stroke-[#000]" />
                        </Button>
                      </li>
                    ),
                  )}
                </ul>
                <div className="p-3 flex justify-between border-t-2 border-[#CFD8DC] uppercase font-bold">
                  <span>Grand Total:</span>
                  <span>
                    {amount.value} {amount.currencyCode}
                  </span>
                </div>
              </>
            ) : (
              !totalQuantity && (
                <p className="p-3 font-semibold size-xl text-center">Your cart is empty</p>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { Cart };
