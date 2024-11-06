import { useFormatter } from 'next-intl';
import Link from 'next/link';

import { FragmentOf, graphql } from '~/client/graphql';
import { BcImage } from '~/components/bc-image';

import { ItemQuantity } from './item-quantity';
import { RemoveItem } from './remove-item';

const PhysicalItemFragment = graphql(`
  fragment PhysicalItemFragment on CartPhysicalItem {
    name
    brand
    sku
    url
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
    url
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
  deleteIcon: string;
}
function moveToTheEnd(arr: any, word: string) {
  arr?.map((elem: any, index: number) => {
    if (elem?.name?.toLowerCase() === word?.toLowerCase()) {
      arr?.splice(index, 1);
      arr?.push(elem);
    }
  });
  return arr;
}
export const CartItem = ({ currencyCode, product, deleteIcon }: Props) => {
  const changeTheProtectedPosition = moveToTheEnd(
    product?.selectedOptions,
    'Protect Your Purchase',
  );
  const format = useFormatter();

  return (
    <li>
      <div className="mb-5 flex flex-col gap-4 border border-gray-200 p-4 py-4 md:flex-row">
        <div className="mx-auto w-full flex-none border border-gray-300 md:mx-0 md:w-[144px] cart-main-img">
          {product.image?.url ? (
            <BcImage
              alt={product.name}
              height={144}
              src={product.image.url}
              width={144}
              className="h-full w-full object-contain min-h-[9em]" // Added class to fill space
            />
          ) : (
            <div className="min-h-[300px] min-w-[300px] bg-gray-200" />
          )}
        </div>

        <div className="flex-1">
          <p className="text-base text-gray-500 hidden">{product.brand}</p>
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="flex flex-1 flex-col gap-2">
              <Link href={product.url}>
                <p className="text-left text-[1rem] font-normal leading-[2rem] tracking-[0.009375rem] text-[#353535]">
                  {product.name}
                </p>
              </Link>
              {changeTheProtectedPosition?.length == 0 && (
                <div className="modifier-options flex min-w-full max-w-[600px] flex-wrap gap-2 sm:min-w-[300px]">
                  <div className="flex flex-wrap gap-2 cart-options">
                    <p className="text-left text-[0.875rem] font-bold uppercase leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                      SKU: {product.sku}
                    </p>
                  </div>
                </div>
              )}
              {changeTheProtectedPosition?.length > 0 && (
                <div className="modifier-options flex min-w-full max-w-[600px] flex-wrap gap-2 sm:min-w-[300px]">
                  <div className="flex flex-wrap gap-2 cart-options">
                    <p className="text-left text-[0.875rem] font-bold uppercase leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                      SKU: {product.sku}
                      {changeTheProtectedPosition.length > 0 && (
                        <span className="text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                          {' '}
                          |
                        </span>
                      )}
                    </p>
                    {changeTheProtectedPosition.map((selectedOption: any, index: number) => {
                      let pipeLineData = '';
                      if (index < changeTheProtectedPosition.length - 2) {
                        pipeLineData = '|';
                      }
                      switch (selectedOption.__typename) {
                        case 'CartSelectedMultipleChoiceOption':
                          return (
                            <div key={selectedOption.entityId} className="flex items-center">
                              <span className="text-left text-[0.875rem] font-bold leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                                {selectedOption.name}:
                              </span>
                              <span className="ml-1.5 mr-1.5 text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#7F7F7F]">
                                {selectedOption.value}
                              </span>

                              {pipeLineData && (
                                <span className="text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                                  {' '}
                                  {pipeLineData}
                                </span>
                              )}
                            </div>
                          );
                        case 'CartSelectedCheckboxOption':
                          return (
                            <div key={selectedOption.entityId} className="flex items-center">
                              <span className="text-left text-[0.875rem] font-bold leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                                {selectedOption.name}:
                              </span>
                              <span className="ml-1.5 mr-1.5 text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#7F7F7F]">
                                {selectedOption.value}
                              </span>

                              {pipeLineData && (
                                <span className="text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                                  {' '}
                                  {pipeLineData}
                                </span>
                              )}
                            </div>
                          );

                        case 'CartSelectedNumberFieldOption':
                          return (
                            <div key={selectedOption.entityId} className="flex items-center">
                              <span className="font-semibold">{selectedOption.name}:</span>
                              <span>{selectedOption.number}</span>
                              {pipeLineData && (
                                <span className="text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                                  {' '}
                                  {pipeLineData}
                                </span>
                              )}
                            </div>
                          );

                        case 'CartSelectedMultiLineTextFieldOption':
                        case 'CartSelectedTextFieldOption':
                          return (
                            <div key={selectedOption.entityId} className="flex items-center">
                              <span className="font-semibold">{selectedOption.name}:</span>
                              <span>{selectedOption.text}</span>
                              {pipeLineData && (
                                <span className="text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                                  {' '}
                                  {pipeLineData}
                                </span>
                              )}
                            </div>
                          );

                        case 'CartSelectedDateFieldOption':
                          return (
                            <div key={selectedOption.entityId} className="flex items-center">
                              <span className="font-semibold">{selectedOption.name}:</span>
                              <span>{format.dateTime(new Date(selectedOption.date.utc))}</span>
                              {pipeLineData && (
                                <span className="text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                                  {' '}
                                  {pipeLineData}
                                </span>
                              )}
                            </div>
                          );

                        default:
                          return null;
                      }
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 md:items-end">
              {/* Mobile layout for dollar amount and item quantity/remove button in separate rows */}
              <div className="block md:hidden">
                {/* Dollar amount row */}
                <p className="mb-4 text-left text-lg font-bold">
                  {format.number(product.extendedSalePrice.value, {
                    style: 'currency',
                    currency: currencyCode,
                  })}
                </p>
                {/* Item quantity and remove button in separate columns */}
                <div className="flex items-center justify-between delete-icon-top-position">
                  {/* Item quantity aligned left */}
                  <div className="text-left">
                    <ItemQuantity product={product} />
                  </div>
                  {/* Remove button aligned right */}
                  <div className="text-right">
                    <RemoveItem currency={currencyCode} product={product} deleteIcon={deleteIcon} />
                  </div>
                </div>
              </div>
              {/* Desktop layout (unchanged) */}
              <div className="cart-deleteIcon hidden flex-col gap-2 md:flex md:items-end">
                <RemoveItem currency={currencyCode} product={product} deleteIcon={deleteIcon} />
                <div>
                  {product.originalPrice.value &&
                  changeTheProtectedPosition?.length === 0 &&
                  product.originalPrice.value !== product.listPrice.value ? (
                    <p className="mb-1 text-lg font-bold line-through">
                      {format.number(product.originalPrice.value * product.quantity, {
                        style: 'currency',
                        currency: currencyCode,
                      })}
                    </p>
                  ) : null}
                  <p className="pb-2 mt-2 text-right text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#353535]">
                    {format.number(product.extendedSalePrice.value, {
                      style: 'currency',
                      currency: currencyCode,
                    })}
                  </p>
                </div>
                <ItemQuantity product={product} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};