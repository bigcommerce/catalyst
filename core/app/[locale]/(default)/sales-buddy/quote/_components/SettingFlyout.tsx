import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import closeIcon from '~/public/add-to-cart/flyoutCloseIcon.svg';
import { BcImage } from '~/components/bc-image';
import { GripVertical, X } from 'lucide-react';

interface DialogQuoteProps {
  children: React.ReactNode;
  settingDatas?: string[];
}

const SettingFlyout: React.FC<DialogQuoteProps> = ({ settingDatas, children }) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[-webkit-fill-available] min-w-[300px] max-w-[600px] -translate-x-1/2 -translate-y-1/2 transform rounded-lg p-6">
          <Dialog.Title className="hidden"></Dialog.Title>
          <div className="flex flex-col gap-[20px] rounded-[6px] bg-white px-[30px] py-[20px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] ![pointer-events:unset]">
            <div>
              <div className="py-[16px] text-[18px] font-bold">Edit Columns</div>
              <div className="flex flex-col divide-y-[1px] divide-[#ededed] border-y border-y-[#ededed]">
                {settingDatas?.map((settingData, index) => (
                  <div
                    key={index}
                    className="flex flex-row items-center justify-start gap-[25px] py-3"
                  >
                    <div>
                      <GripVertical />
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        className="h-[20px] w-[20px] outline-none"
                        name=""
                        id=""
                      />
                    </div>
                    <div>{settingData}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-row items-center justify-end gap-[15px] self-end pt-3 [&_button]:h-[35px] [&_button]:min-w-[50px] [&_button]:rounded-[5px] [&_button]:border [&_button]:border-[rgb(60,100,244)] [&_button]:px-[20px]">
                <Dialog.Close asChild>
                  <button className="bg-transparent text-[14px] font-semibold text-[rgb(60,100,244)] hover:bg-[rgb(60,100,244)] hover:text-white">
                    Cancel
                  </button>
                </Dialog.Close>
                <Dialog.Close asChild>
                  <button className="bg-[rgb(60,100,244)] text-[14px] font-semibold text-white hover:bg-transparent hover:text-[rgb(60,100,244)]">
                    Save
                  </button>
                </Dialog.Close>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SettingFlyout;
