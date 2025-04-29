'use client';

import { useSearchParams } from 'next/navigation';

import { Modal } from '~/components/modal';
import { NewWishlistModal } from '~/components/wishlist/modals/new';
import { usePathname, useRouter } from '~/i18n/routing';

import { addToNewWishlist } from '../../_actions/wishlist-action';

interface Props {
  title: string;
  cancelLabel: string;
  createLabel: string;
  nameLabel: string;
  requiredError: string;
  modalVisible: boolean;
  productId: number;
  selectedSku: string;
}

export const AddToNewWishlistModal = ({
  title,
  cancelLabel,
  createLabel,
  nameLabel,
  requiredError,
  modalVisible,
  productId,
  selectedSku,
}: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const closeModal = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete('action');

    router.push(params.size === 0 ? pathname : `${pathname}?${params.toString()}`);
  };

  return (
    <Modal
      buttons={[
        {
          label: cancelLabel,
          type: 'cancel',
        },
        {
          label: createLabel,
          type: 'submit',
        },
      ]}
      className="min-w-64 @lg:min-w-96"
      form={{ action: addToNewWishlist, onSuccess: closeModal }}
      isOpen={modalVisible}
      setOpen={(open) => {
        if (!open) {
          closeModal();
        }
      }}
      title={title}
    >
      <input name="productId" type="hidden" value={productId} />
      <input name="selectedSku" type="hidden" value={selectedSku} />
      <input
        name="redirectTo"
        type="hidden"
        value={searchParams.size === 0 ? pathname : `${pathname}?${searchParams.toString()}`}
      />
      <NewWishlistModal nameLabel={nameLabel} requiredError={requiredError} />
    </Modal>
  );
};
