'use client';
import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Details } from '~/app/[locale]/(default)/product/[slug]/_components/details';

import { Warranty } from '~/app/[locale]/(default)/product/[slug]/_components/warranty';
import { Description } from '~/app/[locale]/(default)/product/[slug]/_components/description';
import { getMultipleChoiceOptions, getProductBySku } from '../graphql-apis';
import { QuickViewGallery } from './Quickviewgallery';
import { client } from '~/client';
import { calculateProductPrice } from '../common-functions';
import { CustomerGroupServer } from '~/belami/components/customergroup/customergroup';

const QuickView = ({ product }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [productInfo, setProductInfo] = useState(product);
  const [priceUpdatedProduct, setPriceUpdatedProduct] = useState([]);

  const [swatchOptions, setSwatchOptions] = useState<any>([]);
  let productData: any;
  let swatchOpt: any;
  const openQuickView = async () => {
    productData = await getProductBySku({
      sku: product?.sku,
    });
    const categories = productData?.categories;
    const customerGroupDetails = await CustomerGroupServer();
    const discountRules = customerGroupDetails?.discount_rules;

    const categoryIds = categories?.edges?.map(
      (edge: { node: { entityId: any } }) => edge.node.entityId,) || [];
    
    const updatedProduct = await calculateProductPrice(productData, "pdp", discountRules, categoryIds);

    setPriceUpdatedProduct(updatedProduct[0]);
    const entityId = productData?.entityId;

    swatchOpt = await getMultipleChoiceOptions(entityId);
    setSwatchOptions(swatchOpt);
    setProductInfo(productData);
    setIsOpen(true);
  };

  return (
    <>
      <button
        type="button"
        className="flex h-10 w-full cursor-pointer items-center justify-center space-x-2 rounded border border-[#B4DDE9] px-4 uppercase"
        onClick={() => openQuickView()}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 17 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M13 12H12.565L11.9575 11.3925C12.625 10.5 13 9.375 13 8.25C13 5.3475 10.6525 3 7.75 3C6.625 3 5.5 3.375 4.5925 4.05C2.275 5.79 1.8025 9.0825 3.5425 11.4C5.2825 13.7175 8.575 14.19 10.8925 12.45L11.5 13.0575V13.5L15.25 17.25L16.75 15.75L13 12ZM7.75 12C5.68 12 4 10.32 4 8.25C4 6.18 5.68 4.5 7.75 4.5C9.82 4.5 11.5 6.18 11.5 8.25C11.5 10.32 9.82 12 7.75 12ZM1.75 4.5L0.25 6V0.75H5.5L4 2.25H1.75V4.5ZM15.25 0.75V6L13.75 4.5V2.25H11.5L10 0.75H15.25ZM4 14.25L5.5 15.75H0.25V10.5L1.75 12V14.25H4Z"
            fill="#353535"
          />
        </svg>
        <span className="text-[14px] font-[500] leading-[32px] tracking-[1.25px] text-[#002A37]">
          Quick View
        </span>
      </button>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="quickview fixed left-[50%] top-[50%] z-50 h-[101vh] max-h-[101vh] w-[90vw] max-w-4xl translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-lg bg-white shadow-lg">
            <div className="p-8">
              <Dialog.Close className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100">
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Dialog.Close>

              {isOpen && (
                <div className="grid grid-cols-1 gap-8">
                  <div className="a1 mb-12 mt-4 lg:grid lg:grid-cols-2 lg:gap-8">
                    <QuickViewGallery
                      product={productInfo}
                      className="w-full"
                      images={
                        productInfo?.images?.edges?.map((edge) => ({
                          src: edge.node.url,
                          altText: edge.node.altText,
                          isDefault: edge.node.isDefault,
                        })) || []
                      }
                      videos={[]}
                    />
                    <Details
                      product={productInfo}
                      swatchOptions={swatchOptions}
                      triggerLabel1={undefined}
                      children1={undefined}
                      triggerLabel2={undefined}
                      children2={undefined}
                      triggerLabel3={undefined}
                      children3={undefined}
                      triggerLabel4={undefined}
                      children4={undefined}
                      triggerLabel5={undefined}
                      children5={undefined}
                      priceMaxRules={undefined}
                      getAllCommonSettinngsValues={undefined}
                      isFromQuickView ={true}
                      priceUpdatedProduct={priceUpdatedProduct}
                    />
                  </div>
                  <div className="lg:col-span-2" id="tabsection1">
                    <Warranty product={productInfo} />
                  </div>
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default QuickView;
