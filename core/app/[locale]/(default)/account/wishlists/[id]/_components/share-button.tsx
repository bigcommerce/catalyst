'use client';

import { clsx } from 'clsx';
import { useState } from 'react';

import { Stream, Streamable } from '@/ui/lib/streamable';
import { Button, ButtonProps } from '@/ui/primitives/button';
import * as Skeleton from '@/ui/primitives/skeleton';
import { toast } from '@/ui/primitives/toaster';
import { Tooltip } from '@/ui/primitives/tooltip';
import { Modal } from '~/components/modal';

import { ShareWishlistModal } from '../../_components/modals/share';
import { getShareWishlistModal } from '../../modals';

interface Props {
  wishlistName: string;
  publicUrl: string;
  label: string;
  isMobileUser: Streamable<boolean>;
  isPublic: boolean;
  modalTitle: string;
  successMessage: string;
  copiedMessage: string;
  disabledTooltip: string;
  closeLabel: string;
  size?: ButtonProps['size'];
}

export const WishlistShareButton = ({
  wishlistName,
  publicUrl,
  label,
  isMobileUser: streamableIsMobileUser,
  isPublic,
  modalTitle,
  successMessage,
  copiedMessage,
  disabledTooltip,
  closeLabel,
  size = 'small',
}: Props) => {
  const [open, setOpen] = useState(false);
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const getShareUrl = () => String(new URL(publicUrl, window.location.origin));
  const nativeShare = async () => {
    try {
      await navigator.share({ url: getShareUrl(), title: wishlistName });
      toast.success(successMessage);
    } catch {
      // noop
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl());
      toast.success(copiedMessage);
      setOpen(false);
    } catch {
      // noop
    }
  };

  return (
    <Stream fallback={<WishlistShareButtonSkeleton size={size} />} value={streamableIsMobileUser}>
      {(isMobileUser) => {
        const ShareButton = (
          <Button
            disabled={!isPublic}
            onClick={isMobileUser ? nativeShare : () => null}
            onTouchStart={() => (!isPublic && isMobileUser ? setTooltipOpen(!tooltipOpen) : null)}
            size={size}
            variant="secondary"
          >
            {label}
          </Button>
        );

        if (!isPublic) {
          return (
            <Tooltip
              className="max-w-52 pl-4 text-sm"
              delayDuration={0}
              open={tooltipOpen}
              setOpen={setTooltipOpen}
              side="bottom"
              trigger={ShareButton}
            >
              {disabledTooltip}
            </Tooltip>
          );
        }

        if (!isMobileUser) {
          return (
            <Modal
              className="max-w-lg min-w-64 @lg:min-w-96"
              isOpen={open}
              setOpen={setOpen}
              trigger={ShareButton}
              {...getShareWishlistModal(modalTitle, closeLabel, publicUrl, copyToClipboard)}
            >
              <ShareWishlistModal publicUrl={publicUrl} />
            </Modal>
          );
        }

        return ShareButton;
      }}
    </Stream>
  );
};

export function WishlistShareButtonSkeleton({ size = 'small' }: { size?: Props['size'] }) {
  return (
    <Skeleton.Box
      className={clsx(
        'rounded-full',
        {
          'x-small': 'min-h-8 min-w-[7ch]',
          small: 'min-h-10 min-w-[7ch]',
          medium: 'min-h-12 min-w-[8ch]',
          large: 'min-h-14 min-w-[9ch]',
        }[size],
      )}
    />
  );
}
