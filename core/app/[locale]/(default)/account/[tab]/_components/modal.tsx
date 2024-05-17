'use client';

import { X } from 'lucide-react';
import { MouseEventHandler, PropsWithChildren } from 'react';

import { Button } from '~/components/ui/button';
import {
  Dialog,
  DialogAction,
  DialogCancel,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
} from '~/components/ui/dialog';

interface Props extends PropsWithChildren {
  actionHandler?: MouseEventHandler<HTMLButtonElement>;
  title: string;
  descriptionText?: string;
  confirmationText?: string;
  abortText?: string;
}

export const Modal = ({
  abortText = 'Cancel',
  actionHandler,
  confirmationText = 'OK',
  descriptionText,
  title,
  children,
}: Props) => {
  return (
    <Dialog>
      <DialogTrigger aria-controls="modal-content" asChild>
        {children}
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="w-full sm:w-8/12 md:w-6/12 lg:w-5/12" id="modal-content">
          <div className="flex justify-between gap-4 p-6">
            <DialogTitle>{title}</DialogTitle>
            <DialogCancel asChild>
              <Button className="ms-auto w-min p-2" type="button" variant="subtle">
                <X>
                  <title>{abortText}</title>
                </X>
              </Button>
            </DialogCancel>
          </div>
          {Boolean(descriptionText) && <DialogDescription>{descriptionText}</DialogDescription>}
          <div className="flex flex-col gap-2 p-6 lg:flex-row">
            <DialogAction asChild>
              <Button className="w-full lg:w-fit" onClick={actionHandler} variant="primary">
                {confirmationText}
              </Button>
            </DialogAction>
            <DialogCancel asChild>
              <Button className="w-full lg:w-fit" variant="subtle">
                {abortText}
              </Button>
            </DialogCancel>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
