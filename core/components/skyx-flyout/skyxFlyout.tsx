import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { BcImage } from '../bc-image';
import { Loader2 as Spinner } from 'lucide-react';
import closeIcon from '~/public/add-to-cart/flyoutCloseIcon.svg';
import exclamatryIcon from '~/public/pdp-icons/exclamatryIcon.svg';

type skyxFlyoutProps = {

  triggerName:string; 
};

const SkyxFlyout = ({  
  triggerName

}: skyxFlyoutProps) => {

  return (
    <>
      <Dialog.Root >
        <Dialog.Trigger asChild>
          <button className="bg-white text-[#008bb7] ml-2">{triggerName}</button>
      </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
          <Dialog.Content className="popup-container-parent data-[state=open]:animate-contentShow fixed left-[50%] right-[unset] top-[50%] z-[100] flex h-[100vh] w-[90vw] max-w-[610px] animate-mobSlideInFromLeft flex-col gap-[20px] overflow-auto rounded-[6px] bg-white px-[40px] py-[20px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] [transform:translate(-50%,-50%)] focus:outline-none sm:left-[unset] sm:right-[0] sm:translate-y-[-50%] sm:animate-slideInFromLeft xl:w-[calc(36%-0.5em)] xl:max-w-[unset]">
            {/* <div
              className={`flyout-loading ${isLoading ? 'flex' : 'hidden'} fixed left-0 top-0 z-50 h-full w-full items-center justify-center`}
            > */}
            {/* <Spinner className="animate-spin rounded-[50%] bg-[#8b8d8f] text-white shadow-[0_10px_38px_2000px_#0e121659,_0_10px_20px_2000px_#0e121633]" />
            </div> */}
            <div className={`flex flex-col gap-[20px] [&>p]:hidden`}>
              <div className="flex flex-col items-center justify-end gap-[20px]">
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
              </div>
              <Dialog.Description></Dialog.Description>
              <Dialog.Content className="!pointer-events-auto">
              <div className="flex flex-col gap-[15px]">
                  <div className="text-[20px] font-normal">Product Options</div>
                  <div className="flex flex-col gap-[30px]">
                    <div className="flex flex-col gap-[20px] rounded-md bg-[#f2f4f5] p-4">
                      <div className="w-full rounded-md bg-white py-2 text-center text-[16px] font-bold text-[#353535]">
                        Hardwire installation
                      </div>
                      <div className="font-normal text-[#353535] text-[14x]">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero, perspiciatis.
                      </div>
                      <div className="flex flex-col gap-[15px]">
                        <div className="text-[16px] font-medium text-[#353535]">
                          Purchase Includes
                        </div>
                        <div className="flex flex-row items-center gap-2 bg-white p-5">
                          <div>
                            <BcImage
                              src={exclamatryIcon}
                              width={150}
                              height={150}
                              unoptimized={true}
                            />
                          </div>
                          <div>
                            <div className="text-[12px]">Quorem Lightning</div>
                            <div className="font-normal text-[#353535] text-[14x]">
                              Product title Lorem ipsum dolor sit amet ipsum dolor sit amet.
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-[20px] rounded-md bg-[#f2f4f5] p-4">
                      <div className="w-full rounded-md bg-white py-2 text-center text-[16px] font-bold text-[#353535]">
                        with Skyplug
                      </div>
                      <div className="flex flex-col gap-[15px]">
                        <div className="font-normal text-[#353535] text-[14x]">
                          Lorem ipsum dolor sit amet consectetur adipisicing elit. Vero,
                          perspiciatis.
                        </div>
                        <ul className='list-disc list-inside px-1'>
                          <li>Lorem, ipsum dolor.</li>
                          <li>Lorem, ipsum dolor.</li>
                          <li>Lorem, ipsum dolor.</li>
                          <li>Lorem, ipsum dolor.</li>
                        </ul>
                      </div>
                      <div className="flex flex-col gap-[15px]">
                        <div className="text-[16px] font-medium text-[#353535]">
                          Purchase Includes
                        </div>
                        <div className="flex flex-col gap-[15px]">
                          <div className="flex flex-row items-center gap-2 bg-white p-5">
                            <div>
                              <BcImage
                                src={exclamatryIcon}
                                width={150}
                                height={150}
                                unoptimized={true}
                              />
                            </div>
                            <div>
                              <div className="text-[12px]">Quorem Lightning</div>
                              <div className="font-normal text-[#353535] text-[14x]">
                                Product title Lorem ipsum dolor sit amet ipsum dolor sit amet.
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-row items-center gap-2 bg-white p-5">
                            <div>
                              <BcImage
                                src={exclamatryIcon}
                                width={150}
                                height={150}
                                unoptimized={true}
                              />
                            </div>
                            <div>
                              <div className="text-[12px]">Quorem Lightning</div>
                              <div className="font-normal text-[#353535] text-[14x]">
                                Product title Lorem ipsum dolor sit amet ipsum dolor sit amet.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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

export default SkyxFlyout;
