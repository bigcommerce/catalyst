'use client';

import { EllipsisIcon } from 'lucide-react';
import { useReducer } from 'react';

import { Button } from '@/vibes/soul/primitives/button';
import { DropdownMenu } from '@/vibes/soul/primitives/dropdown-menu';
import { toast } from '@/vibes/soul/primitives/toaster';
import { Modal, ModalButton, ModalFormAction, ModalFormState } from '~/components/modal';

import { getShareWishlistModal } from '../modals';

interface WishlistActionBase {
  className?: string;
  label: string | React.ReactNode;
  disabled?: boolean;
  variant?: 'default' | 'danger';
}

export interface WishlistModalProps {
  title: string;
  children: React.ReactNode;
  hideHeader?: boolean;
  buttons?: ModalButton[];
  formAction?: ModalFormAction;
}

interface WishlistModalAction extends WishlistActionBase {
  key?: string;
  modal: WishlistModalProps;
}

interface WishlistMenuAction extends WishlistActionBase {
  action?: string | ((e: React.MouseEvent<HTMLDivElement>) => void);
}

export type WishlistAction = WishlistModalAction | WishlistMenuAction;

interface Props {
  actionsTitle?: string;
  share?: {
    wishlistName: string;
    label: string;
    publicUrl: string;
    modalTitle: string;
    copiedMessage: string;
    isMobileUser: boolean;
    isPublic: boolean;
    successMessage: string;
    disabledTooltip: string;
    closeLabel: string;
    copyLabel: string;
  };
  items: WishlistAction[];
}

function reducer(state: Record<string, boolean>, action: { modal: string; open: boolean }) {
  return {
    ...state,
    [action.modal]: action.open,
  };
}

function getShareMenuItemProps(
  share: Props['share'],
  key: string,
  nativeShare: (name: string, publicUrl: string) => Promise<void>,
  copyToClipboard: (publicUrl: string) => Promise<void>,
): WishlistAction | undefined {
  if (!share) {
    return undefined;
  }

  if (share.isMobileUser) {
    return {
      label: share.label,
      disabled: !share.isPublic,
      action: () => {
        void nativeShare(share.wishlistName, share.publicUrl);
      },
    };
  }

  return {
    label: share.label,
    disabled: !share.isPublic,
    key,
    modal: getShareWishlistModal(
      share.modalTitle,
      share.copyLabel,
      share.closeLabel,
      share.publicUrl,
      () => {
        void copyToClipboard(share.publicUrl);
      },
    ),
  };
}

export const WishlistActionsMenu = ({ actionsTitle, items, share }: Props) => {
  const [state, dispatch] = useReducer(reducer, {});
  const shareModalKey = 'share-dropdown-modal';
  const getShareUrl = (publicUrl: string) => String(new URL(publicUrl, window.location.origin));
  const nativeShare = async (title: string, publicUrl: string) => {
    try {
      await navigator.share({ url: getShareUrl(publicUrl), title });
      toast.success(share?.successMessage);
    } catch {
      // noop
    }
  };

  const copyToClipboard = async (publicUrl: string) => {
    try {
      await navigator.clipboard.writeText(getShareUrl(publicUrl));
      toast.success(share?.copiedMessage);
      dispatch({ modal: shareModalKey, open: false });
    } catch {
      // noop
    }
  };

  const shareProps = getShareMenuItemProps(share, shareModalKey, nativeShare, copyToClipboard);
  const shareMenuItem = shareProps ? [shareProps] : [];
  const menuItems = [...shareMenuItem, ...items].map((item, index) => {
    if ('modal' in item) {
      const key = item.key ?? `dropdown-modal-${index}`;

      return {
        ...item,
        key,
        action: () => dispatch({ modal: key, open: true }),
      };
    }

    return item;
  });

  const modals = menuItems.filter((item) => 'modal' in item);

  const handleModalFormSuccess = (modal: string) => {
    return ({ successMessage }: ModalFormState) => {
      if (successMessage !== undefined && successMessage !== '') {
        toast.success(successMessage);
        dispatch({ modal, open: false });
      }
    };
  };

  return (
    <>
      <DropdownMenu className="min-w-40" items={menuItems}>
        <Button
          className="data-[state=open]:after:translate-x-0"
          shape="circle"
          size="small"
          variant="tertiary"
        >
          <EllipsisIcon size={20}>
            <title>{actionsTitle}</title>
          </EllipsisIcon>
        </Button>
      </DropdownMenu>
      {modals.map(({ key, modal: { formAction: action, ...modalProps } }) => (
        <Modal
          className="min-w-64 max-w-lg @lg:min-w-96"
          form={action ? { action, onSuccess: handleModalFormSuccess(key) } : undefined}
          isOpen={state[key] ?? false}
          key={key}
          setOpen={(open) => dispatch({ modal: key, open })}
          {...modalProps}
        />
      ))}
    </>
  );
};
