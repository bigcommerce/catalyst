import { useFormatter } from 'next-intl';
import Link from 'next/link';
import React from 'react'
import { ItemQuantity } from '~/app/[locale]/(default)/cart/_components/item-quantity';
import { RemoveItem } from '~/app/[locale]/(default)/cart/_components/remove-item';
import { BcImage } from '~/components/bc-image';
import ProductPriceAdjuster from '../ProductPriceAdjuster';



function moveToTheEnd(arr: any, word: string) {
  arr?.map((elem: any, index: number) => {
    if (elem?.name?.toLowerCase() === word?.toLowerCase()) {
      arr?.splice(index, 1);
      arr?.push(elem);
    }
  });
  return arr;
}
export default function CartProductComponent({ currencyCode, product, deleteIcon, cartId,priceAdjustData }: Props) {
  const changeTheProtectedPosition = moveToTheEnd(
    product?.selectedOptions,
    'Protect Your Purchase',
  );
  const format = useFormatter();
    let oldPrice = product?.originalPrice?.value;
    let salePrice = product?.extendedSalePrice?.value;
    let discountedPrice: any = Number(100 - (salePrice * 100) / oldPrice)?.toFixed(2);
    let discountPriceText: string = '';
    if (discountedPrice > 0) {
      discountPriceText = discountedPrice + '% Off';
    }
    
  return (
    <div className="">
      <div className="mb-5 flex flex-col gap-4 p-4 py-4 md:flex-row">
        <div className="cart-main-img mx-auto w-full flex-none border border-gray-300 md:mx-0 md:w-[144px]">
          {product?.image?.url ? (
            <BcImage
              alt={product?.name}
              height={144}
              src={product?.image.url}
              width={144}
              className="h-full min-h-[9em] w-full object-contain"
            />
          ) : (
            <div className="min-h-[300px] min-w-[300px]" />
          )}
        </div>

        <div className="flex-1">
          <p className="hidden text-base text-gray-500">{product?.brand}</p>
          <div className="grid gap-1 lg:grid-cols-[40%_20%_40%]">
            <div className="">
              <p className="text-left text-[1rem] font-normal leading-[2rem] tracking-[0.009375rem] text-[#353535]">
                {product?.name}
              </p>
              {changeTheProtectedPosition?.length == 0 && (
                <div className="modifier-options flex min-w-full max-w-[600px] flex-wrap gap-2 sm:min-w-[300px]">
                  <div className="cart-options flex flex-wrap gap-2">
                    <p className="text-left text-[0.875rem] font-bold uppercase leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                      SKU: {product?.sku}
                    </p>
                  </div>
                </div>
              )}
              {changeTheProtectedPosition?.length > 0 && (
                <div className="modifier-options flex min-w-full max-w-[600px] flex-wrap gap-2 sm:min-w-[300px]">
                  <div className="cart-options flex flex-wrap gap-2">
                    <p className="text-left text-[0.875rem] font-bold uppercase leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                      SKU: {product?.sku}
                      {changeTheProtectedPosition?.length > 0 && (
                        <span className="text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                          {' '}
                          |
                        </span>
                      )}
                    </p>
                    {changeTheProtectedPosition?.map((selectedOption: any, index: number) => {
                      let pipeLineData = '';
                      if (index < changeTheProtectedPosition.length - 2) {
                        pipeLineData = '|';
                      }
                      switch (selectedOption.__typename) {
                        case 'CartSelectedMultipleChoiceOption':
                          return (
                            <div key={selectedOption.entityId} className="flex items-center">
                              <span className="text-left text-[0.875rem] font-bold leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                                {selectedOption?.name}:
                              </span>
                              <span className="ml-1.5 mr-1.5 text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#7F7F7F]">
                                {selectedOption?.value}
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
                                {selectedOption?.name}:
                              </span>
                              <span className="ml-1.5 mr-1.5 text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#7F7F7F]">
                                {selectedOption?.value}
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
                              <span className="font-semibold">{selectedOption?.name}:</span>
                              <span>{selectedOption?.number}</span>
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
                              <span className="font-semibold">{selectedOption?.name}:</span>
                              <span>{selectedOption?.text}</span>
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
                            <div key={selectedOption?.entityId} className="flex items-center">
                              <span className="font-semibold">{selectedOption?.name}:</span>
                              <span>{format.dateTime(new Date(selectedOption?.date.utc))}</span>
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
            <div className="">
              <div className="cart-deleteIcon relative flex flex-col gap-0 text-right md:items-end md:gap-2">
                <RemoveItem currency={currencyCode} product={product} deleteIcon={deleteIcon} />
                <div className="mb-[20px] md:mb-0">
                  {/* <div className="flex items-center gap-[3px] text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#353535]">
                    {product?.originalPrice?.value &&
                    product?.originalPrice?.value !== product?.listPrice?.value ? (
                      <p className="line-through">
                        ----{' '}
                        {format.number(product?.originalPrice?.value * product?.quantity, {
                          style: 'currency',
                          currency: currencyCode,
                        })}
                      </p>
                    ) : null}
                    <p className="text-[12px] font-normal leading-[18px] tracking-[0.4px] text-[#5C5C5C]">
                      {discountPriceText}
                    </p>
                  </div> */}
                  <p className="text-left md:text-right">
                    {
                    format.number(product?.listPrice?.value, {
                      style: 'currency',
                      currency: currencyCode,
                    })
                    }
                  </p>
                </div>
                <ItemQuantity product={product} />
              </div>
            </div>
            <div className="overflow-x-hidden pl-[10px]">
              <ProductPriceAdjuster
                 parentSku={priceAdjustData?.parent_sku}
                  sku={priceAdjustData?.sku}
                  oem_sku={priceAdjustData?.oem_sku}
                  productPrice={Number(product?.listPrice?.value)}
                  initialCost={Number(priceAdjustData.cost)}
                  initialFloor={Number(priceAdjustData?.floor_percentage)}
                  initialMarkup={Number(product?.listPrice?.value)}
                  productId={product?.productEntityId}
                  cartId={cartId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
