import { Trash } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { getCart } from '~/client/queries/get-cart';
import { ExistingResultType } from '~/client/util';
import { BcImage } from '~/components/bc-image';

import { removeProduct } from '../_actions/remove-products';

import { CartItemCounter } from './cart-item-counter';

type Product =
  | ExistingResultType<typeof getCart>['lineItems']['physicalItems'][number]
  | ExistingResultType<typeof getCart>['lineItems']['digitalItems'][number];

export const CartItem = async ({ product }: { product: Product }) => {
  const t = await getTranslations('Cart');

  const extractCartlineItemsData = ({
    entityId,
    productEntityId,
    quantity,
    variantEntityId,
    selectedOptions,
  }: Product) => ({
    lineItemEntityId: entityId,
    productEntityId,
    quantity,
    variantEntityId,
    selectedOptions,
  });

  return (
    <li>
      <div className="flex items-center gap-6 border-t border-t-gray-200 py-4">
        <div>
          <BcImage alt={product.name} height={104} src={product.imageUrl ?? ''} width={104} />
        </div>

        <div className="flex-1">
          <p className="text-base text-gray-500">{product.brand}</p>
          <p className="text-xl font-bold lg:text-2xl">{product.name}</p>

          {product.selectedOptions.length > 0 && (
            <div className="mt-2">
              {product.selectedOptions.map((selectedOption) => {
                switch (selectedOption.__typename) {
                  case 'CartSelectedMultipleChoiceOption':
                    return (
                      <div key={selectedOption.entityId}>
                        <span>{selectedOption.name}:</span>{' '}
                        <span className="font-semibold">{selectedOption.value}</span>
                      </div>
                    );

                  case 'CartSelectedCheckboxOption':
                    return (
                      <div key={selectedOption.entityId}>
                        <span>{selectedOption.name}:</span>{' '}
                        <span className="font-semibold">{selectedOption.value}</span>
                      </div>
                    );

                  case 'CartSelectedNumberFieldOption':
                    return (
                      <div key={selectedOption.entityId}>
                        <span>{selectedOption.name}:</span>{' '}
                        <span className="font-semibold">{selectedOption.number}</span>
                      </div>
                    );

                  case 'CartSelectedMultiLineTextFieldOption':
                    return (
                      <div key={selectedOption.entityId}>
                        <span>{selectedOption.name}:</span>{' '}
                        <span className="font-semibold">{selectedOption.text}</span>
                      </div>
                    );

                  case 'CartSelectedTextFieldOption':
                    return (
                      <div key={selectedOption.entityId}>
                        <span>{selectedOption.name}:</span>{' '}
                        <span className="font-semibold">{selectedOption.text}</span>
                      </div>
                    );

                  case 'CartSelectedDateFieldOption':
                    return (
                      <div key={selectedOption.entityId}>
                        <span>{selectedOption.name}:</span>{' '}
                        <span className="font-semibold">
                          {Intl.DateTimeFormat().format(new Date(selectedOption.date.utc))}
                        </span>
                      </div>
                    );
                }

                return null;
              })}
            </div>
          )}
        </div>

        <CartItemCounter itemData={extractCartlineItemsData(product)} />

        <div>
          <p className="inline-flex w-24 justify-center text-lg font-bold">
            ${product.extendedSalePrice.value}
          </p>
        </div>

        <form action={removeProduct}>
          <input name="lineItemEntityId" type="hidden" value={product.entityId} />
          <button aria-label={t('removeFromCart')} type="submit">
            <Trash aria-hidden="true" />
          </button>
        </form>
      </div>
    </li>
  );
};
