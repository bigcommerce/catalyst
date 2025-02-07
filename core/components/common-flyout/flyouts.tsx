

import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react"; // For close icon, you can use any icon library
import { BcImage } from "../bc-image";
import { Loader2 as Spinner } from 'lucide-react';
import closeIcon from '~/public/add-to-cart/flyoutCloseIcon.svg';

type FlyoutProps = {
  triggerLabel: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean; // Optional prop to control the open state
  onOpenChange?: (open: boolean) => void; // Callback when the state changes
};

const CommonFlyout: React.FC<FlyoutProps> = ({ triggerLabel, children,isOpen,onOpenChange }) => {
  return (
    <>
      <Dialog.Root open={isOpen} onOpenChange={onOpenChange}> 
        <Dialog.Portal>
        {/* <Dialog.Trigger asChild>
        <p className="pt-2 text-left text-[0.875rem] font-normal leading-[1.5rem] tracking-[0.015625rem] text-[#002A37] underline underline-offset-4">
          {triggerLabel}
        </p>
      </Dialog.Trigger> */}
          <Dialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
          <Dialog.Content className="popup-container-parent data-[state=open]:animate-contentShow left-[50%] sm:left-[unset] fixed right-[unset] sm:right-[0] top-[50%] z-[100] flex h-[101vh] w-[90vw] max-w-[610px] [transform:translate(-50%,-50%)] sm:translate-y-[-50%] animate-mobSlideInFromLeft sm:animate-slideInFromLeft flex-col gap-[20px] overflow-auto rounded-[6px] bg-white px-[40px] py-[20px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
            {/* <div
              className={`flyout-loading ${isLoading ? 'flex' : 'hidden'} fixed left-0 top-0 z-50 h-full w-full items-center justify-center`}
            > */}
              {/* <Spinner className="animate-spin rounded-[50%] bg-[#8b8d8f] text-white shadow-[0_10px_38px_2000px_#0e121659,_0_10px_20px_2000px_#0e121633]" />
            </div> */}
            <div className={`flex flex-col `}>
              <div className="flex flex-col items-center justify-center gap-[20px]">
                <Dialog.Close asChild>
                  <button
                    aria-modal
                    className="text-violet11 inline-flex h-full w-full appearance-none items-center justify-center rounded-full"
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
                {/* <div className="gap-1.25 flex w-full flex-row items-center justify-center bg-[#EAF4EC] px-2.5">
                  <Dialog.Title className="text-mauve12 m-0 text-[20px] font-medium tracking-[0.15px] text-[#167E3F]">
                    {from == 'pdp' ? 'Added to Cart!' : 'Add Accessories' }
                  </Dialog.Title>
                </div> */}
              </div>
              <Dialog.Description></Dialog.Description>
              <Dialog.Content className="!pointer-events-auto" >
                <div >
              {children}
              </div>
              </Dialog.Content>
            
              
             
              <Dialog.Close asChild>
                <button
                  aria-modal
                  className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute right-[10px] top-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full"
                  aria-label="Close"
                ></button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default CommonFlyout;