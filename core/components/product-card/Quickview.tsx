// QuickView.tsx
'use client';

import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { Details } from '~/app/[locale]/(default)/product/[slug]/_components/details';
import { Gallery } from '~/app/[locale]/(default)/product/[slug]/_components/gallery';
import { Warranty } from '~/app/[locale]/(default)/product/[slug]/_components/warranty';
import { Description } from '~/app/[locale]/(default)/product/[slug]/_components/description';
import { getProductBySku } from '~/app/[locale]/(default)/product/[slug]/page-data';

interface QuickViewProps {
  product: any;
}

const getProductData = async (product: any) => {
  const productData: any = await getProductBySku({
    sku: product?.sku,
  });
  return productData;

}

const QuickView = ({ product }: QuickViewProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [productInfo, setProductInfo] = useState(product);

  const openQuickView = async () => {
    setIsOpen(true);
    let productData = await getProductData(product);
    setProductInfo(productData);
  };

  return (
    <>
      <button
        onClick={() => openQuickView()}
        className="z-10 quick-view-btn flex w-full items-center justify-center gap-2 rounded-[4px] border border-[#ca9618] bg-[#ca9618] p-0 text-[13px] font-[700] text-[#ffffff] shadow-sm transition-all duration-300 hover:bg-[#fff] hover:text-[#ca9618]"
      >
        <div className="flex items-center justify-center gap-[5px]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pl-[3px]"
          >
            <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0a4.5 4.5 0 1 1-.01-8.99A4.5 4.5 0 0 1 14 10.5c0 2.49-2.01 4.5-4.5 4.5z" />
          </svg>
          <span>QUICK VIEW</span>
        </div>
      </button>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
          <Dialog.Title className="w-5/6 grow font-semibold"></Dialog.Title>
          <Dialog.Content className="fixed left-[50%] top-[50%]  max-h-[90vh] w-[90vw] max-w-4xl translate-x-[-50%] translate-y-[-50%] overflow-y-auto rounded-lg bg-white shadow-lg quickview">
            <div className="p-8">
              <Dialog.Close className="absolute right-4 top-4  rounded-full p-2 hover:bg-gray-100">
                <X className="h-6 w-6" />
                <span className="sr-only">Close</span>
              </Dialog.Close>
              <Dialog.Description></Dialog.Description>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                <div className="a1 mb-12 mt-4 lg:grid lg:grid-cols-2 lg:gap-8">
                  <Gallery product={productInfo} />
                  <Details product={productInfo} />
                </div>
                <div className="lg:col-span-2" id="tabsection1">
                  <Description product={productInfo} />
                  <Warranty product={productInfo} />
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default QuickView;
