'use client';
import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';
import { BcImage } from '~/components/bc-image';

import { emptyCarts } from '../_actions/empty-cart';

interface Props {
  cartId: string;
  icon: string;
  deleteIcon: string;
}
export const RemoveCart = ({ cartId, icon, deleteIcon }: Props) => {
  const t = useTranslations('Cart');
  const [diabledButton, setDisabledButton] = useState(false);

  async function clearCartItems() {
    if (cartId) {
      setDisabledButton(true);
      const { status } = await emptyCarts({
        cartEntityId: cartId,
      });

      if (status === 'error') {
        toast.error(t('errorMessage'), {
          icon: <AlertCircle className="text-error-secondary" />,
        });

        return;
      }
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <div className="flex space-x-2 cursor-pointer">
          <BcImage
            alt="Remove"
            width={20}
            height={20}
            className="w-[20px] h-[20px]"
            src={icon}
          />
          <div>Empty Cart</div>
        </div>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
            Are you sure want to clear the cart?
          </Dialog.Title>
          <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
            <span className="mt-[25px] justify-end">
              <button onClick={() => clearCartItems()} disabled={diabledButton} className="bg-green4 text-green11 hover:bg-green5 focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-none">
                Yes
              </button>
            </span>
            <span className="mt-[25px] justify-end">
              <Dialog.Close asChild>
                <button className="bg-green4 text-green11 hover:bg-green5 focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-none">
                  No
                </button>
              </Dialog.Close>
            </span>
          </Dialog.Description>
          <Dialog.Close asChild>
            <button
              className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
              aria-label="Close"
            >
            </button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <button
              className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
              aria-label="Close"
            >
              <BcImage
                alt="Close Icon"
                width={24}
                height={24}
                className="w-full h-full"
                src={deleteIcon}
              />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
