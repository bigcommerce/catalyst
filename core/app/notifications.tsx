'use client';

import { useEffect, useRef } from 'react';
import { Toaster } from 'react-hot-toast';

import { toast } from '@/vibes/soul/primitives/toaster';
import { type ServerToastData } from '~/lib/server-toast';

export const Notifications = () => {
  // TODO: Remove this component after product comparisons are migrated to VIBES
  return (
    <Toaster
      containerClassName="px-4 2xl:container sm:px-10 lg:px-12 2xl:mx-auto 2xl:px-0"
      position="top-right"
      toastOptions={{
        className:
          '!text-black !rounded !border !border-gray-200 !bg-white !shadow-lg !py-4 !px-6 !text-base [&>svg]:!shrink-0',
      }}
    />
  );
};

export const CookieNotifications = (notification: ServerToastData) => {
  const lastRendered = useRef<ServerToastData>(null);

  useEffect(() => {
    const { message, variant, position, description } = notification;

    if (notification.id !== lastRendered.current?.id) {
      toast[variant](message, { position, description });
      lastRendered.current = notification;
    }
  }, [notification]);

  return null;
};
