'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import { X } from 'lucide-react';
import React from 'react';

import { Button } from '../button';

interface Props {
  title: React.ReactNode;
  children: React.ReactNode;
}

function Content({ title, children }: Props) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-30 bg-foreground/50 @container">
        <Dialog.Content
          className={clsx(
            'fixed inset-y-0 right-0 flex w-96 max-w-full flex-col bg-background transition duration-500 [animation-timing-function:cubic-bezier(0.25,1,0,1)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right',
          )}
          forceMount
        >
          <div className="flex items-center justify-between gap-2 bg-background px-6 pb-4 pt-4 @md:px-8 @md:pt-7">
            <Dialog.Title asChild>
              <div className="text-2xl font-medium @lg:text-3xl">{title}</div>
            </Dialog.Title>
            <Dialog.Close asChild>
              <Button className="translate-x-3" shape="circle" size="small" variant="tertiary">
                <X size={20} strokeWidth={1} />
              </Button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-6 pb-6 @md:px-8 @md:pb-8">{children}</div>
        </Dialog.Content>
      </Dialog.Overlay>
    </Dialog.Portal>
  );
}

const Root = Dialog.Root;
const Trigger = Dialog.Trigger;

export { Root, Trigger, Content };
