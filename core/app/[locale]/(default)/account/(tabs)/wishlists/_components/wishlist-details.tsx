'use client';

import { Ellipsis } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { ExistingResultType } from '~/client/util';
import { ProductCard } from '~/components/product-card';
import { Button } from '~/components/ui/button';
import { Dropdown } from '~/components/ui/dropdown';
import { Pagination } from '~/components/ui/pagination';
import { useRouter } from '~/i18n/routing';

import { useAccountStatusContext } from '../../_components/account-status-provider';
import { Modal } from '../../_components/modal';
import { getWishlist } from '../page-data';

import { DeleteWishlistForm } from './delete-wishlist-form';
import { UpdateWishlistForm } from './update-wishlist-form';
import { updateWishlist } from './update-wishlist-form/_actions/update-wishlist';

type Wishlist = ExistingResultType<typeof getWishlist>['wishlists'][number];
type UpdatedWishlist = NonNullable<ExistingResultType<typeof updateWishlist>['data']>;

interface WishlistDetailsProps {
  data: Wishlist;
}

export const WishlistDetails = ({ data }: WishlistDetailsProps) => {
  const t = useTranslations('Account.Wishlist');
  const [name, setName] = useState(data.name);
  const [editWishlistModalOpen, setEditWishlistModalOpen] = useState(false);
  const [deleteWishlistModalOpen, setDeleteWishlistModalOpen] = useState(false);
  const { setAccountState } = useAccountStatusContext();
  const router = useRouter();

  const [wishlistItems, setWishlistItems] = useState(() => {
    return data.items.map((item) => {
      return {
        ...item,
        toRemove: false,
      };
    });
  });

  useEffect(() => {
    setWishlistItems((items) => {
      return data.items.map((dataItem) => {
        const currentItem = items.find(({ entityId }) => entityId === dataItem.entityId);

        if (currentItem) {
          return currentItem;
        }

        return { ...dataItem, toRemove: false };
      });
    });
  }, [data]);

  const handleWishlistUpdated = (updatedWishlist: UpdatedWishlist) => {
    setName(updatedWishlist.name);
    setEditWishlistModalOpen(false);
  };

  const handleWishlistDeleted = () => {
    setDeleteWishlistModalOpen(false);

    const message = t('messages.deleted', { name });

    setAccountState({ status: 'success', message });

    router.replace('/account/wishlists');
  };

  const handleWishlistItemDelete = (itemEntityId: number) => {
    setWishlistItems((items) =>
      items.map((item) => {
        return {
          ...item,
          toRemove: item.entityId === itemEntityId ? true : item.toRemove,
        };
      }),
    );
  };

  const handleWishlistItemDeleted = (itemEntityId: number) => {
    setWishlistItems((items) => items.filter((item) => item.entityId !== itemEntityId));
  };

  const handleWishlistItemUndoDelete = (itemEntityId: number) => {
    setWishlistItems((items) =>
      items.map((item) => {
        return {
          ...item,
          toRemove: item.entityId === itemEntityId ? false : item.toRemove,
        };
      }),
    );
  };

  const { hasNextPage, hasPreviousPage, startCursor, endCursor } = data.pageInfo;

  return (
    <div className="pb-14">
      <div className="mb-8 flex flex-col justify-between md:flex-row md:gap-3">
        <div className="mb-4 shrink-0 md:mb-0">
          <h1 className="text-3xl font-bold lg:text-4xl">{name}</h1>
          <span>{t('items', { items: data.items.length })}</span>
        </div>
        <div className="flex items-start">
          <Button className="me-2 ms-auto md:w-auto" disabled>
            Share {data.name}
          </Button>

          <Dropdown
            align="end"
            items={[
              {
                action: () => {
                  setEditWishlistModalOpen(true);
                },
                name: t('edit'),
              },
              {
                action: () => {
                  setDeleteWishlistModalOpen(true);
                },
                name: t('delete'),
              },
            ]}
            trigger={
              <Button aria-label="Account" className="w-auto p-2.5" variant="secondary">
                <Ellipsis aria-hidden="true" />
              </Button>
            }
          />
          <Modal
            open={editWishlistModalOpen}
            setOpen={setEditWishlistModalOpen}
            showCancelButton={false}
            title={t('editWishlist')}
          >
            <UpdateWishlistForm
              entityId={data.entityId}
              name={name}
              onWishlistUpdated={handleWishlistUpdated}
            />
          </Modal>
          <Modal
            open={deleteWishlistModalOpen}
            setOpen={setDeleteWishlistModalOpen}
            showCancelButton={false}
            title={t('deleteTitle', { name })}
          >
            <DeleteWishlistForm
              id={data.entityId}
              name={name}
              onWishlistDeleted={handleWishlistDeleted}
            />
          </Modal>
        </div>
      </div>
      {wishlistItems.length === 0 || wishlistItems.every(({ toRemove }) => toRemove) ? (
        <p className="text-center">{t('noItems')}</p>
      ) : (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 md:gap-8">
          {wishlistItems.map(({ entityId, product, toRemove }) => {
            if (toRemove) {
              return null;
            }

            // TODO: remove this after wishlist api will support defaultImage
            product.defaultImage =
              product.defaultImage || product.images.find(({ isDefault }) => isDefault) || null;

            return (
              <ProductCard
                imageSize="tall"
                key={product.entityId}
                product={product}
                // TODO: return showCart={true} after availability & productOptions in wishlist api will be correct
                showCart={false}
                showCompare={false}
                showWishlist={true}
                wishlistData={{
                  wishlistId: data.entityId,
                  wishlistItemId: entityId,
                  onWishlistItemDelete: handleWishlistItemDelete,
                  onWishlistItemDeleted: handleWishlistItemDeleted,
                  onWishlistItemUndoDelete: handleWishlistItemUndoDelete,
                }}
              />
            );
          })}
        </div>
      )}
      <Pagination
        endCursor={endCursor ?? undefined}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        startCursor={startCursor ?? undefined}
      />
    </div>
  );
};
