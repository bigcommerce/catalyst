import { useFormatter } from 'next-intl';

import { FragmentOf, graphql } from '~/client/graphql';
import { BcImage } from '~/components/bc-image';

import { ItemQuantity } from './item-quantity';
import { RemoveItem } from './remove-item';

const PhysicalItemFragment = graphql(`
  fragment PhysicalItemFragment on CartPhysicalItem {
    name
    brand
    sku
    image {
      url: urlTemplate(lossy: true)
    }
    entityId
    quantity
    productEntityId
    variantEntityId
    extendedListPrice {
      currencyCode
      value
    }
    extendedSalePrice {
      currencyCode
      value
    }
    originalPrice {
      currencyCode
      value
    }
    listPrice {
      currencyCode
      value
    }
    selectedOptions {
      __typename
      entityId
      name
      ... on CartSelectedMultipleChoiceOption {
        value
        valueEntityId
      }
      ... on CartSelectedCheckboxOption {
        value
        valueEntityId
      }
      ... on CartSelectedNumberFieldOption {
        number
      }
      ... on CartSelectedMultiLineTextFieldOption {
        text
      }
      ... on CartSelectedTextFieldOption {
        text
      }
      ... on CartSelectedDateFieldOption {
        date {
          utc
        }
      }
    }
  }
`);

const DigitalItemFragment = graphql(`
  fragment DigitalItemFragment on CartDigitalItem {
    name
    brand
    sku
    image {
      url: urlTemplate(lossy: true)
    }
    entityId
    quantity
    productEntityId
    variantEntityId
    extendedListPrice {
      currencyCode
      value
    }
    extendedSalePrice {
      currencyCode
      value
    }
    originalPrice {
      currencyCode
      value
    }
    listPrice {
      currencyCode
      value
    }
    selectedOptions {
      __typename
      entityId
      name
      ... on CartSelectedMultipleChoiceOption {
        value
        valueEntityId
      }
      ... on CartSelectedCheckboxOption {
        value
        valueEntityId
      }
      ... on CartSelectedNumberFieldOption {
        number
      }
      ... on CartSelectedMultiLineTextFieldOption {
        text
      }
      ... on CartSelectedTextFieldOption {
        text
      }
      ... on CartSelectedDateFieldOption {
        date {
          utc
        }
      }
    }
  }
`);

export const CartItemFragment = graphql(
  `
    fragment CartItemFragment on CartLineItems {
      physicalItems {
        ...PhysicalItemFragment
      }
      digitalItems {
        ...DigitalItemFragment
      }
    }
  `,
  [PhysicalItemFragment, DigitalItemFragment],
);

type FragmentResult = FragmentOf<typeof CartItemFragment>;
type PhysicalItem = FragmentResult['physicalItems'][number];
type DigitalItem = FragmentResult['digitalItems'][number];

export type Product = PhysicalItem | DigitalItem;

interface Props {
  product: Product;
  currencyCode: string;
}

export const CartItem = ({ currencyCode, product }: Props) => {
  const format = useFormatter();

  return (
    <li>
      <div className="flex gap-4 border-t border-t-gray-200 py-4 md:flex-row">
        <div className="w-24 flex-none md:w-[144px]">
          {product.image?.url ? (
            <BcImage alt={product.name} height={144} src={product.image.url} width={144} />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}
        </div>

        <div className="flex-1">
          <p className="text-base text-gray-500">{product.brand}</p>
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="flex flex-1 flex-col gap-2">
              <p className="text-xl font-bold md:text-2xl">{product.name}</p>

              {product.selectedOptions.length > 0 && (
                <div>
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

              <div className="hidden md:block">
                <RemoveItem currency={currencyCode} product={product} />
              </div>
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              <div>
                {product.originalPrice.value &&
                product.originalPrice.value !== product.listPrice.value ? (
                  <p className="text-lg font-bold line-through">
                    {format.number(product.originalPrice.value * product.quantity, {
                      style: 'currency',
                      currency: currencyCode,
                    })}
                  </p>
                ) : null}
                <p className="text-lg font-bold">
                  {format.number(product.extendedSalePrice.value, {
                    style: 'currency',
                    currency: currencyCode,
                  })}
                </p>
              </div>

              <ItemQuantity product={product} />
            </div>
          </div>

          <div className="mt-4 md:hidden">
            <RemoveItem currency={currencyCode} product={product} />
          </div>
        </div>
      </div>
    </li>
  );
};
