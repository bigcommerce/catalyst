'use client';

import { Input } from '@/vibes/soul/form/input';

export const ShareWishlistModal = ({ publicUrl }: { publicUrl: string }) => {
  const shareUrl = String(new URL(publicUrl, window.location.origin));

  return <Input defaultValue={shareUrl} readOnly type="text" />;
};
