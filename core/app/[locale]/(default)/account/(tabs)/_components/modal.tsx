'use client';

import * as DialogPrimitive from '@radix-ui/react-alert-dialog';
import { Trash2, X } from 'lucide-react';
import { MouseEventHandler, PropsWithChildren, useId } from 'react';

import { Button } from '~/components/ui/button';

interface Props extends PropsWithChildren {
  actionHandler?: MouseEventHandler<HTMLButtonElement>;
  title: string;
  descriptionText?: string;
  confirmationText?: string;
  abortText?: string;
}

export const Modal = ({
  abortText,
  actionHandler,
  confirmationText = 'OK',
  descriptionText,
  title,
  children,
}: Props) => {
  const id = useId();
  const cancelText = abortText || 'Cancel';
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger aria-controls={id} asChild>
        {children}
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-overlayShow fixed inset-0 bg-black/[.2]" />

        <DialogPrimitive.Content
          className="data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] w-full translate-x-[-50%] translate-y-[-50%] bg-white shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none sm:w-11/12 md:w-8/12 lg:w-6/12 xl:w-5/12"
          id={id}
        >
        <div className="flex justify-center gap-2 p-4">

            <DialogPrimitive.Title className="w-5/6 grow text-center font-semibold">
              {title}
            </DialogPrimitive.Title>
            <DialogPrimitive.Cancel asChild>
              <Button className="ms-auto w-min p-2" type="button" variant="subtle">
                <X>
                  <title>{cancelText}</title>
                </X>
              </Button>
            </DialogPrimitive.Cancel>
          </div>

          {Boolean(descriptionText) && (
            <DialogPrimitive.Description>{descriptionText}</DialogPrimitive.Description>
          )}

          <div className="flex flex-col items-center justify-center gap-2 p-4 lg:flex-row lg:gap-4">
            <DialogPrimitive.Action asChild>
              <Button className="w-full px-2.5 lg:w-auto bg-[#008BB7] " onClick={actionHandler} variant="primary">
                <Trash2 size={16} className="mr-[5px]" />
                {confirmationText}
              </Button>
            </DialogPrimitive.Action>

            <DialogPrimitive.Cancel asChild>
              <Button className="w-full px-2.5 lg:w-auto" variant="subtle">
                {cancelText}
              </Button>
            </DialogPrimitive.Cancel>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
