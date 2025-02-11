import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import closeIcon from '~/public/add-to-cart/flyoutCloseIcon.svg';
import { BcImage } from '~/components/bc-image';

interface DialogQuoteProps {
  children: React.ReactNode;
}

const AddDialog: React.FC<DialogQuoteProps> = ({ children }) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger className="">{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[55vw] min-w-[300px] -translate-x-1/2 -translate-y-1/2 transform rounded-lg p-6">
          <div className="flex flex-col gap-[20px] rounded-[6px] bg-white px-[30px] py-[20px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] ![pointer-events:unset]">
            <Dialog.Close asChild>
              <button
                aria-modal
                className="text-violet11 inline-flex h-full w-full appearance-none items-center justify-end rounded-full"
                aria-label="Close"
              >
                <BcImage
                  alt="Close Icon"
                  width={14}
                  height={14}
                  unoptimized={true}
                  className=""
                  src={closeIcon}
                />
              </button>
            </Dialog.Close>
            <div className="flex flex-col gap-[20px] text-[14px]">
              <div className="text-center text-[20px] font-bold">Add Product</div>
              <div className="grid grid-cols-[20%_74%] gap-[20px_3px] px-5 items-center">
                <div className='font-bold'>Product Name</div>
                <div className="flex justify-center">
                  <input
                    className="w-[80%] bg-neutral-200 p-[10px_5px] outline-none"
                    type="text"
                    placeholder="Product Name"
                  />
                </div>
                <div className='font-bold'>Product SKU</div>
                <div className="flex justify-center">
                  <input
                    className="w-[80%] bg-neutral-200 p-[10px_5px] outline-none"
                    type="text"
                    placeholder="Product SKU"
                  />
                </div>
                <div className='font-bold'>Product Brand</div>
                <div className="flex justify-center">
                  <select name="" id="" className='w-[80%] bg-neutral-200 p-[10px_5px] outline-none'>
                    <option value="">Brand 1</option>
                    <option value="Brand 2">Brand 2</option>
                    <option value="Brand 3">Brand 3</option>
                  </select>
                </div>
              </div>
              <div className='flex justify-center mt-[10px]'>
                <button className="flex cursor-pointer items-center justify-center rounded-[20px] border border-brand-600 bg-brand-600 p-[5px_25px] text-[13px] text-white hover:bg-white hover:text-brand-600">
                  Add Product
                </button>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AddDialog;
