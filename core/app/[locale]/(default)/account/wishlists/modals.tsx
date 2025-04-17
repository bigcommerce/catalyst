import { getTranslations } from 'next-intl/server';

import { Wishlist } from '@/vibes/soul/sections/wishlist-details';
import { ExistingResultType } from '~/client/util';

import { toggleWishlistVisibility } from './_actions/change-wishlist-visibility';
import { deleteWishlist } from './_actions/delete-wishlist';
import { newWishlist } from './_actions/new-wishlist';
import { renameWishlist } from './_actions/rename-wishlist';
import { ChangeWishlistVisibilityModal } from './_components/modals/change-visibility';
import { DeleteWishlistModal } from './_components/modals/delete';
import { NewWishlistModal } from './_components/modals/new';
import { RenameWishlistModal } from './_components/modals/rename';
import { ShareWishlistModal } from './_components/modals/share';
import { WishlistModalProps } from './_components/wishlist-actions-menu';

const bold = (chunks: React.ReactNode) => <span className="font-bold">{chunks}</span>;

export const getNewWishlistModal = (
  t: ExistingResultType<typeof getTranslations<'Account.Wishlists'>>,
): WishlistModalProps => ({
  children: (
    <NewWishlistModal nameLabel={t('Form.nameLabel')} requiredError={t('Errors.nameRequired')} />
  ),
  title: t('Modal.newTitle'),
  formAction: newWishlist,
  buttons: [
    {
      label: t('Modal.cancel'),
      type: 'cancel',
    },
    {
      label: t('Modal.create'),
      type: 'submit',
    },
  ],
});

export const getRenameWishlistModal = (
  wishlist: Wishlist,
  t: ExistingResultType<typeof getTranslations<'Account.Wishlists'>>,
): WishlistModalProps => ({
  children: (
    <RenameWishlistModal
      {...wishlist}
      nameLabel={t('Form.nameLabel')}
      requiredError={t('Errors.nameRequired')}
    />
  ),
  title: t('Modal.renameTitle', { name: wishlist.name }),
  formAction: renameWishlist,
  buttons: [
    {
      label: t('Modal.cancel'),
      type: 'cancel',
    },
    {
      label: t('Modal.save'),
      type: 'submit',
    },
  ],
});

export const getChangeWishlistVisibilityModal = (
  wishlist: Wishlist,
  t: ExistingResultType<typeof getTranslations<'Account.Wishlists'>>,
): WishlistModalProps => {
  const name = wishlist.name;
  const title = wishlist.visibility.isPublic
    ? t('Modal.changeVisibilityPrivateTitle', { name })
    : t('Modal.changeVisibilityPublicTitle', { name });

  const message = wishlist.visibility.isPublic
    ? t.rich('Modal.makePrivateContent', { name, bold })
    : t.rich('Modal.makePublicContent', { name, bold });

  return {
    children: <ChangeWishlistVisibilityModal {...wishlist} message={message} />,
    title,
    formAction: toggleWishlistVisibility,
    hideHeader: true,
    buttons: [
      {
        label: t('Modal.cancel'),
        type: 'cancel',
      },
      {
        label: wishlist.visibility.isPublic ? t('makePrivate') : t('makePublic'),
        type: 'submit',
      },
    ],
  };
};

export const getShareWishlistModal = (
  title: string,
  closeLabel: string,
  publicUrl: string,
  action: () => void | Promise<void>,
): WishlistModalProps => ({
  children: <ShareWishlistModal publicUrl={publicUrl} />,
  title,
  buttons: [
    { type: 'cancel', label: closeLabel },
    { label: 'Copy', variant: 'primary', action },
  ],
});

export const getDeleteWishlistModal = (
  wishlist: Wishlist,
  t: ExistingResultType<typeof getTranslations<'Account.Wishlists'>>,
): WishlistModalProps => ({
  children: (
    <DeleteWishlistModal
      {...wishlist}
      message={t.rich('Modal.deleteContent', { name: wishlist.name, bold })}
    />
  ),
  title: t('Modal.deleteTitle', { name: wishlist.name }),
  formAction: deleteWishlist,
  hideHeader: true,
  buttons: [
    {
      label: t('Modal.cancel'),
      type: 'cancel',
    },
    {
      label: t('Modal.delete'),
      variant: 'danger',
      type: 'submit',
    },
  ],
});
