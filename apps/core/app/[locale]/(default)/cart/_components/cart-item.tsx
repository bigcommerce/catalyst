import { NextIntlClientProvider } from 'next-intl';
import { getFormatter, getMessages } from 'next-intl/server';

import { getCart } from '~/client/queries/get-cart';
import { ExistingResultType } from '~/client/util';
import { BcImage } from '~/components/bc-image';

import { ItemQuantity } from './item-quantity';
import { RemoveItem } from './remove-item';

export type Product =
  | ExistingResultType<typeof getCart>['lineItems']['physicalItems'][number]
  | ExistingResultType<typeof getCart>['lineItems']['digitalItems'][number];

export const CartItem = async ({
  currencyCode,
  product,
  locale,
}: {
  currencyCode: string;
  product: Product;
  locale: string;
}) => {
  const messages = await getMessages({ locale });
  const format = await getFormatter({ locale });

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
                          {format.dateTime(new Date(selectedOption.date.utc))}
                        </span>
                      </div>
                    );
                }

                return null;
              })}
            </div>
          )}
        </div>

        <NextIntlClientProvider locale={locale} messages={{ Cart: messages.Cart ?? {} }}>
          <ItemQuantity product={product} />
        </NextIntlClientProvider>

        <div>
          <p className="inline-flex w-24 justify-center text-lg font-bold">
            {format.number(product.extendedSalePrice.value, {
              style: 'currency',
              currency: currencyCode,
            })}
          </p>
        </div>

        <NextIntlClientProvider locale={locale} messages={{ Cart: messages.Cart ?? {} }}>
          <RemoveItem lineItemEntityId={product.entityId} />
        </NextIntlClientProvider>
      </div>
    </li>
  );
};
