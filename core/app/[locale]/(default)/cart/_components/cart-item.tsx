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
  product: any;
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
  let oldPrice = product?.originalPrice?.value;
  let salePrice = product?.extendedSalePrice?.value;
  let discountedPrice: number = Number(Number(100 - (salePrice * 100) / oldPrice)?.toFixed(2));
  let discountPriceText: string = '';
  if (discountedPrice > 0) {
    discountPriceText = discountedPrice?.toPrecision(4) + '% Off';
  }
  return (
    <li className="border border-gray-200">
      <div className="mb-5 flex flex-col gap-4 p-4 py-4 md:flex-row">
        <div className="mb-5 flex flex-col gap-4 p-4 py-4 md:flex-row">
          <div className="cart-main-img mx-auto w-full flex-none border border-gray-300 md:mx-0 md:w-[144px]">
            {product.image?.url ? (
              <BcImage
                alt={product.name}
                height={144}
                src={product.image.url}
                width={144}
                className="h-full min-h-[9em] w-full object-contain" // Added class to fill space
              />
            ) : (
              <div className="min-h-[300px] min-w-[300px] bg-gray-200" />
            )}
          </div>

          <div className="flex-1">
            <p className="hidden text-base text-gray-500">{product.brand}</p>
            <div className="flex flex-col gap-2 md:flex-row">
              <div className="flex flex-1 flex-col gap-2">
                <Link href={product.url}>
                  <p className="text-left text-[1rem] font-normal leading-[2rem] tracking-[0.009375rem] text-[#353535]">
                    {product.name}
                  </p>
                </Link>
                {changeTheProtectedPosition?.length == 0 && (
                  <div className="modifier-options flex min-w-full max-w-[600px] flex-wrap gap-2 sm:min-w-[300px]">
                    <div className="cart-options flex flex-wrap gap-2">
                      <p className="text-left text-[0.875rem] font-bold uppercase leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                        SKU: {product.sku}
                      </p>
                    </div>
                  </div>
                )}
                {changeTheProtectedPosition?.length > 0 && (
                  <div className="modifier-options flex min-w-full max-w-[600px] flex-wrap gap-2 sm:min-w-[300px]">
                    <div className="cart-options flex flex-wrap gap-2">
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
                
                {/* Desktop layout (unchanged) */}
                <div className="cart-deleteIcon flex-col gap-2 flex md:items-end">
                  <RemoveItem currency={currencyCode} product={product} deleteIcon={deleteIcon} />
                  <div>
                    {product.originalPrice.value &&
                    product.originalPrice.value !== product.listPrice.value ? (
                      <p className="mb-1 text-lg font-bold line-through">
                        {format.number(product.originalPrice.value * product.quantity, {
                          style: 'currency',
                          currency: currencyCode,
                        })}
                      </p>
                    ) : null}
                    {discountPriceText}
                    <p className="mt-2 pb-2 text-right text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#353535]">
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
      </div>
      <div>
        {product?.accessories &&
          product?.accessories?.map((item: any, index: number) => (
            <div
              className="m-5 flex gap-4 bg-[#F3F4F5] p-[15px_20px] cart-accessories"
              key={`${index}-${item?.entityId}`}
            >
              <div className='w-full flex flex-col md:flex-row items-center'>
                <div className='flex flex-row items-center p-0 g-[17px] flex-shrink-[100] w-full md:w-[90%] '>
                  <BcImage 
                    alt={item.name}
                    height={75}
                    src={item?.image?.url}
                    width={75}
                    className='w-[75px] h-[75px] mr-[20px]'
                  />
                  <div className='flex flex-col items-start p-0'>
                    <div>{item.name}</div>
                    <div className='flex items-center gap-[20px]'>
                      {item.originalPrice.value &&
                      item.originalPrice.value !== item.listPrice.value ? (
                        <p className="font-normal text-[14px] leading-[24px] flex items-center tracking-[0.25px] line-through text-[#353535]">
                          {format.number(item.originalPrice.value * item.quantity, {
                            style: 'currency',
                            currency: currencyCode,
                          })}
                        </p>
                      ) : null}
                      <p className="text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#353535]">
                        {format.number(item.extendedSalePrice.value, {
                          style: 'currency',
                          currency: currencyCode,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="cart-deleteIcon flex flex-row items-center p-0 gap-[20px] md:justify-start justify-between w-full md:w-auto mt-[5px] md:mt-0">
                  <div className='font-normal text-[12px] leading-[18px] flex items-center text-right tracking-[0.4px] text-[#353535]'>QTY: {item.prodQuantity}</div>
                  <RemoveItem currency={currencyCode} product={item} deleteIcon={deleteIcon} />
                </div>
              </div>
            </div>
          ))}
      </div>
    </li>
  );
};
