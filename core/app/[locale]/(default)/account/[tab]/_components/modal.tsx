import { X } from 'lucide-react';
import { Dispatch, MouseEventHandler, PropsWithChildren, SetStateAction } from 'react';

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
  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger aria-controls="modal-content" asChild>
        {trigger}
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogContent className="w-full sm:w-8/12 md:w-6/12 lg:w-5/12" id="modal-content">
          <div className="flex items-start justify-between gap-4 p-6">
            <DialogTitle className="text-xl lg:text-2xl">{title}</DialogTitle>
            <DialogCancel asChild>
              <Button className="ms-auto w-min p-0" type="button" variant="subtle">
                <X>
                  <title>{abortText}</title>
                </X>
              </Button>
            </DialogCancel>
          </div>
          {Boolean(descriptionText) && <DialogDescription>{descriptionText}</DialogDescription>}
          <div className="flex flex-col gap-2 p-6 lg:flex-row">
            {children}
            <div className="flex flex-col lg:flex-row">
              {actionHandler && (
                <DialogAction asChild>
                  <Button className="w-full lg:w-fit" onClick={actionHandler} variant="primary">
                    {confirmationText}
                  </Button>
                </DialogAction>
              )}
              {showCancelButton && (
                <DialogCancel asChild>
                  <Button className="mt-2 w-full lg:ms-2 lg:mt-0 lg:w-fit" variant="subtle">
                    {abortText}
                  </Button>
                </DialogCancel>
              )}
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
