import * as Dialog from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import React, { ReactNode } from 'react';

interface Props {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  trigger: ReactNode;
  content: ReactNode;
}

export const Modal = function Modal({ isOpen, setOpen, trigger, content }: Props) {
  return (
    <Dialog.Root onOpenChange={setOpen} open={isOpen}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-30 flex items-center justify-center bg-foreground/50 @container">
          <Dialog.Content
            className={clsx(
              'mx-3 my-10 max-h-[90%] max-w-3xl overflow-y-auto rounded-xl bg-background px-3 pb-5 pt-5 @sm:px-6 @sm:pb-10 @sm:pt-8 @5xl:px-20 @5xl:pb-12 @5xl:pt-10',
              'transition ease-out',
              'data-[state=closed]:duration-200 data-[state=open]:duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out',
              'data-[state=closed]:slide-out-to-bottom-16 data-[state=open]:slide-in-from-bottom-16',
            )}
          >
            {content}
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
