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
import { Minus, Plus } from 'lucide-react';


interface Props {
  data: FragmentOf<typeof ProductItemFragment>;
}

export const ProductFlyout = ({
  data: product,
  deleteIcon,
  closeIcon
}: {
  data: Props['data'];
  deleteIcon: string;
  closeIcon: string;
}) => {
  const format = useFormatter();
  const productFlyout = useCommonContext();
  let productData = productFlyout.productData;
  let open = productFlyout.open;
  let setOpen = productFlyout.handlePopup;
  if (product?.variants) {
    let variantData: any = removeEdgesAndNodes(product?.variants);
    let variantProduct: any = variantData?.find((item: any) => item?.sku == product?.sku);
    let productMetaFields: any = [];
    useEffect(() => {
      const getProductMetaData = async () => {
        return await GetProductMetaFields(variantProduct?.entityId, 'accessories');
      };
      if (variantProduct) {
        productMetaFields = getProductMetaData();
      } else {
        let productMetaData = useProductContext();
        productMetaFields = productMetaData?.getMetaFields;
      }
      console.log('========productMetaFields=======', productMetaFields);
    }, []);
  }
  function t(arg0: string): import('react').ReactNode {
    throw new Error('Function not implemented.');
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
          <Dialog.Content className="popup-container-parent data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] z-[10000] flex max-h-[85vh] w-[90vw] max-w-[610px] translate-x-[-50%] translate-y-[-50%] flex-col gap-[20px] overflow-auto rounded-[6px] bg-white px-[40px] py-[20px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
            <div className="flex flex-col items-center justify-center gap-[20px]">
              <Dialog.Close asChild>
                <button
                  aria-modal
                  className="text-violet11 inline-flex h-full w-full appearance-none items-center justify-center rounded-full"
                  aria-label="Close"
                >
                  <BcImage
                    alt="Close Icon"
                    width={24}
                    height={24}
                    unoptimized={true}
                    className="h-[25px] w-[25px]"
                    src={closeIcon}
                  />
                </button>
              </Dialog.Close>
              <div className="gap-1.25 flex w-full flex-row items-center justify-center bg-[#EAF4EC] px-2.5">
                <Dialog.Title className="text-mauve12 m-0 text-[20px] font-medium tracking-[0.15px] text-[#167E3F]">
                  Added to Cart!
                </Dialog.Title>
              </div>
            </div>
            {/* <Dialog.Description></Dialog.Description> */}
            <Dialog.Content className="popup-box1 flex flex-row gap-[30px]">
              <div className="popup-box1-div1 relative flex h-[160px] w-[140px] border border-[#cccbcb]">
                <BcImage
                  alt={productData?.name}
                  width={140}
                  height={140}
                  unoptimized={true}
                  className="popup-box1-div-img absolute h-full w-full object-contain"
                  src={productData?.imageUrl}
                />
              </div>
              <div className="popup-box1-div2 flex max-w-[360px] flex-shrink-[50] flex-col gap-[1px]">
                <p className="text-[14px] font-normal tracking-[0.25px] text-[#353535]">
                  {productData?.name}
                </p>
                <p className="popup-box1-div2-sku text-[12px] leading-[1.5rem] tracking-[0.015625rem] text-[#5C5C5C]">
                  SKU: {product?.sku}
                </p>
                {productData?.selectedOptions?.map((selectedOption: any, index: number) => {
                  let pipeLineData = '';
                  if (index < productData?.selectedOptions?.length - 2) {
                    pipeLineData = ',';
                  }
                  return (
                    <div key={selectedOption.entityId} className="flex items-center">
                      <span className="text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.4px] text-[#5C5C5C]">
                        {selectedOption.name}:
                      </span>
                      <span className="text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.4px] text-[#5C5C5C]">
                        {selectedOption.value}
                      </span>
                      {pipeLineData && (
                        <span className="text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.4px] text-[#5C5C5C]">
                          {' '}
                          {pipeLineData}
                        </span>
                      )}
                    </div>
                  );
                })}
                <div className="md:flex-row">
                  {productData?.originalPrice?.value &&
                  productData?.selectedOptions?.length === 0 &&
                  productData?.originalPrice?.value !== productData?.listPrice?.value ? (
                    <div className="">
                      {format.number(productData?.originalPrice?.value * productData?.quantity, {
                        style: 'currency',
                        currency: productData?.originalPrice?.currencyCode,
                      })}
                    </div>
                  ) : null}
                  {productData?.extendedSalePrice?.value ? (
                    <div className="text-right text-[14px] font-normal leading-[1.5rem] tracking-[0.25px] text-[#353535]">
                      {format.number(productData?.extendedSalePrice?.value, {
                        style: 'currency',
                        currency: productData?.extendedSalePrice?.currencyCode,
                      })}
                    </div>
                  ) : null}
                </div>
                <div className="text-[14px] font-normal tracking-[0.25px] text-[#353535]">
                  <div className='flex items-center justify-center gap-[10px] h-[44px] max-w-[105px] border border-[#d6d6d6] rounded-[20px]'>
                    <div className=''>
                    <Minus className=" h-[1rem] w-[1rem] text-[#7F7F7F]"></Minus></div>
                    <input
                      name="quantity"
                      type="number"
                      className="w-[40%] border text-center"
                      min="1"
                    />
                    <div className=''><Plus className="h-[1rem] w-[1rem] text-[#7F7F7F] "></Plus></div>
                  </div>
                </div>
              </div>
            </Dialog.Content>
            <hr className="" />
            <div className="flex flex-col gap-4 md:flex-row pop-up-text">
              <div className=" text-[20px] font-medium tracking-[0.15px] text-black">
                You May Also Need
              </div>
            </div>
            <Dialog.Close asChild>
              <button
                aria-modal
                className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute right-[10px] top-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full "
                aria-label="Close"
              ></button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
