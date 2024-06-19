'use client';

import * as DialogPrimitive from '@radix-ui/react-alert-dialog';
import { X } from 'lucide-react';
import { Dispatch, MouseEventHandler, PropsWithChildren, SetStateAction, useId } from 'react';

import { Button } from '~/components/ui/button';

interface Props extends PropsWithChildren {
  actionHandler?: MouseEventHandler<HTMLButtonElement>;
  title: string;
  trigger: React.ReactNode;
  descriptionText?: string;
  confirmationText?: string;
  abortText?: string;
  open?: boolean;
  setOpen?: Dispatch<SetStateAction<boolean>>;
  showCancelButton?: boolean;
}

export const Modal = ({
  abortText = 'Cancel',
  actionHandler,
  confirmationText = 'OK',
  descriptionText,
  open,
  setOpen,
  showCancelButton = true,
  title,
  trigger,
  children,
}: Props) => {
  const id = useId();

  return (
    <DialogPrimitive.Root onOpenChange={setOpen} open={open}>
      <DialogPrimitive.Trigger aria-controls={id} asChild>
        {trigger}
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-black/[.2]" />
        <DialogPrimitive.Content
          className="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] w-full translate-x-[-50%] translate-y-[-50%] bg-white shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none sm:w-8/12 md:w-3/4 md:w-6/12 lg:w-3/5 lg:w-5/12"
          id={id}
        >
          <div className="flex items-start justify-between gap-4 p-6">
            <DialogPrimitive.Title className="w-5/6 grow text-xl font-semibold lg:text-2xl">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Cancel asChild>
              <Button className="ms-auto w-min p-0" type="button" variant="subtle">
                <X>
                  <title>{abortText}</title>
                </X>
              </Button>
            </DialogPrimitive.Cancel>
          </div>
          {Boolean(descriptionText) && (
            <DialogPrimitive.Description>{descriptionText}</DialogPrimitive.Description>
          )}
          <div className="flex flex-col gap-2 p-6 lg:flex-row">
            {children}
            {actionHandler && (
              <DialogPrimitive.Action asChild>
                <Button className="w-full lg:w-fit" onClick={actionHandler} variant="primary">
                  {confirmationText}
                </Button>
              </DialogPrimitive.Action>
            )}
            {showCancelButton && (
              <DialogPrimitive.Cancel asChild>
                <Button className="w-full lg:w-fit" variant="subtle">
                  {abortText}
                </Button>
              </DialogPrimitive.Cancel>
            )}
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
