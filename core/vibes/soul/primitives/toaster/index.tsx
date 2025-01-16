'use client';

import { ReactNode } from 'react';
import { Toaster as Sonner, toast as SonnerToast } from 'sonner';

import { Alert } from '@/vibes/soul/primitives/alert';

type ToasterProps = React.ComponentProps<typeof Sonner>;

interface ToastOptions {
  action?: {
    label: string;
    onClick: () => void;
  };
  description?: string;
  position?: ToasterProps['position'];
  dismissLabel?: string;
}

export const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'group focus-visible:ring-0 right-0',
        },
      }}
      {...props}
    />
  );
};

export const toast = {
  success: (message: ReactNode, options?: ToastOptions) => {
    const position = options?.position;

    const toastId = SonnerToast(
      <Alert
        message={message}
        onDismiss={() => SonnerToast.dismiss(toastId)}
        variant="success"
        {...options}
      />,
      { position },
    );
  },
  error: (message: ReactNode, options?: ToastOptions) => {
    const position = options?.position;

    const toastId = SonnerToast(
      <Alert
        message={message}
        onDismiss={() => SonnerToast.dismiss(toastId)}
        variant="error"
        {...options}
      />,
      { position },
    );
  },
  warning: (message: ReactNode, options?: ToastOptions) => {
    const position = options?.position;

    const toastId = SonnerToast(
      <Alert
        message={message}
        onDismiss={() => SonnerToast.dismiss(toastId)}
        variant="warning"
        {...options}
      />,
      { position },
    );
  },
  info: (message: ReactNode, options?: ToastOptions) => {
    const position = options?.position;

    const toastId = SonnerToast(
      <Alert
        message={message}
        onDismiss={() => SonnerToast.dismiss(toastId)}
        variant="info"
        {...options}
      />,
      { position },
    );
  },
};
