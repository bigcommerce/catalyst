'use client';

import { useEffect, useRef } from 'react';

import { toast } from '@/ui/primitives/toaster';
import { type ServerToastData } from '~/lib/server-toast';

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
