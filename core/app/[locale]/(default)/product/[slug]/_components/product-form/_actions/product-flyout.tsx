'use client';

import { useFormatter } from 'next-intl';
import { FragmentOf } from 'gql.tada';
import * as Dialog from '@radix-ui/react-dialog';
import { useEffect } from 'react';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { ProductItemFragment } from '~/client/fragments/product-item';
import { Link } from '~/components/link';
import { BcImage } from '~/components/bc-image';
import { useCommonContext } from '~/components/common-context/common-provider';
import { useProductContext } from '~/components/common-context/product-provider';
import { GetProductMetaFields } from '~/components/management-apis';


interface Props {
    data: FragmentOf<typeof ProductItemFragment>;
  }

export const ProductFlyout = ({ data: product, deleteIcon}: { data:Props["data"], deleteIcon: string}) => {
  const format = useFormatter();
  const productFlyout = useCommonContext();
  let productData = productFlyout.productData;
  let open = productFlyout.open;
  let setOpen = productFlyout.handlePopup;
  if(product?.variants) {
    let variantData: any = removeEdgesAndNodes(product?.variants);
    let variantProduct: any = variantData?.find((item: any) => item?.sku == product?.sku);
    let productMetaFields: any = [];
    useEffect(() => {
      const getProductMetaData = async () => {
        return await GetProductMetaFields(variantProduct?.entityId, 'accessories');
      }
      if(variantProduct) {
        productMetaFields = getProductMetaData();
      } else {
        let productMetaData = useProductContext();
        productMetaFields = productMetaData?.getMetaFields;
      }
      console.log('========productMetaFields=======', productMetaFields);
    }, []);
  }
  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
          <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
            <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
              Added to Cart!
            </Dialog.Title>
            <Dialog.Description></Dialog.Description>
            <Dialog.Content className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
              <span className="mt-[25px] justify-end">
                <BcImage 
                  alt={productData?.name}
                  width={150}
                  height={150}
                  unoptimized={true}
                  className=""
                  src={productData?.imageUrl}
                />
              </span>
              <span className="mt-[25px] justify-end">
                {productData?.name}
              </span>
              <div className="modifier-options flex min-w-full max-w-[600px] flex-wrap gap-2 sm:min-w-[300px]">
                <div className="flex flex-wrap gap-2 cart-options">
                  <div className="text-left text-[0.875rem] font-bold uppercase leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                    SKU: {product?.sku}
                  </div>
                </div>
              </div>
              {productData?.selectedOptions?.map((selectedOption: any, index: number) => {
                  let pipeLineData = '';
                  if (index < productData?.selectedOptions?.length - 2) {
                    pipeLineData = ',';
                  }
                  return(<div key={selectedOption.entityId} className="flex items-center">
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
                  </div>)
                }
              )}
              <div>
                Qty: {productData?.quantity}
              </div>
              <div className="flex flex-col gap-4 mb-8 p-4 py-4 md:flex-row">
                {productData?.originalPrice?.value &&
                productData?.selectedOptions?.length === 0 &&
                productData?.originalPrice?.value !== productData?.listPrice?.value ? (
                  <div className="mb-1 text-lg font-bold line-through">
                    {format.number(productData?.originalPrice?.value * productData?.quantity, {
                      style: 'currency',
                      currency: productData?.originalPrice?.currencyCode,
                    })}
                  </div>
                ) : null}
                {productData?.extendedSalePrice?.value ? (
                <div className="pb-2 mt-2 text-right text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#353535]">
                  {format.number(productData?.extendedSalePrice?.value, {
                    style: 'currency',
                    currency: productData?.extendedSalePrice?.currencyCode,
                  })}
                </div>): null}
              </div>
              <div className="flex flex-col gap-4 mb-8 border border-gray-200 p-4 py-4 md:flex-row">
                  <span>You May Also Need</span>
                  <div className="">
                    
                  </div>
              </div>
            </Dialog.Content>
            <Dialog.Close asChild>
              <button aria-modal
                className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                aria-label="Close"
              >
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button aria-modal
                className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                aria-label="Close"
              >
                <BcImage
                  alt="Close Icon"
                  width={24}
                  height={24}
                  unoptimized={true}
                  className="w-full h-full"
                  src={deleteIcon}
                />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};