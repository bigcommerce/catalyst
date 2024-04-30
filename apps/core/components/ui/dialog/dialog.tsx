import * as DialogPrimitive from '@radix-ui/react-alert-dialog';
import { ComponentPropsWithoutRef, ElementRef, forwardRef } from 'react';

import { cn } from '~/lib/utils';

const Dialog = DialogPrimitive.Root;

const DialogTrigger = forwardRef<
  ElementRef<typeof DialogPrimitive.Trigger>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Trigger className={cn(className)} ref={ref} {...props} />
));

DialogTrigger.displayName = DialogPrimitive.Trigger.displayName;

const DialogPortal = forwardRef<
  ElementRef<'div'>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Portal>
>(({ ...props }, ref) => (
  <div ref={ref}>
    <DialogPrimitive.Portal {...props} />
  </div>
));

DialogPortal.displayName = DialogPrimitive.Portal.displayName;

const DialogOverlay = forwardRef<
  ElementRef<typeof DialogPrimitive.Overlay>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    className={cn('data-[state=open]:animate-overlayShow fixed inset-0 bg-black/[.2]', className)}
    ref={ref}
    {...props}
  />
));

DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = forwardRef<
  ElementRef<typeof DialogPrimitive.Content>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Content
    className={cn(
      'data-[state=open]:animate-contentShow fixed left-[50%] top-[50%] w-full translate-x-[-50%] translate-y-[-50%] bg-white shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none md:w-3/4 lg:w-3/5',
      className,
    )}
    ref={ref}
    {...props}
  />
));

DialogContent.displayName = DialogPrimitive.Content.displayName;

const DialogTitle = forwardRef<
  ElementRef<typeof DialogPrimitive.Title>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    className={cn('w-5/6 grow font-semibold', className)}
    ref={ref}
    {...props}
  />
));

DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = forwardRef<
  ElementRef<typeof DialogPrimitive.Description>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description className={cn(className)} ref={ref} {...props} />
));

DialogDescription.displayName = DialogPrimitive.Description.displayName;

const DialogCancel = forwardRef<
  ElementRef<typeof DialogPrimitive.Cancel>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Cancel className={cn(className)} ref={ref} {...props} />
));

DialogCancel.displayName = DialogPrimitive.Cancel.displayName;

const DialogAction = forwardRef<
  ElementRef<typeof DialogPrimitive.Action>,
  ComponentPropsWithoutRef<typeof DialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Action className={cn(className)} ref={ref} {...props} />
));

DialogAction.displayName = DialogPrimitive.Action.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogCancel,
  DialogAction,
};
