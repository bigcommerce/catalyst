import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';

import { Button } from '~/components/ui/button';

import { deleteWishlistItem } from './_actions/delete-wishlist-item';

const SubmitButton = () => {
  const t = useTranslations('Components.ProductCard.DeleteWishlistItem');

  return (
    <Button
      aria-label={t('deleteAriaLabel')}
      className="p-3 text-black hover:bg-transparent hover:text-black"
      title={t('delete')}
      type="submit"
      variant="subtle"
    >
      <Heart fill="currentColor" />
    </Button>
  );
};

export interface DeleteWishlistItemFormProps {
  wishlistId: number;
  wishlistItemId: number;
  onWishlistItemDelete: (itemEntityId: number) => void;
  onWishlistItemDeleted: (itemEntityId: number) => void;
  onWishlistItemUndoDelete: (itemEntityId: number) => void;
}

export const DeleteWishlistItemForm = ({
  onWishlistItemDelete,
  onWishlistItemDeleted,
  onWishlistItemUndoDelete,
  wishlistId,
  wishlistItemId,
}: DeleteWishlistItemFormProps) => {
  const t = useTranslations('Components.ProductCard.DeleteWishlistItem');

  return (
    <form
      action={(formData: FormData) => {
        const entityId = Number(formData.get('wishlistId'));
        const itemEntityId = Number(formData.get('wishlistItemId'));

        onWishlistItemDelete(itemEntityId);

        let toastId: string;

        const timer = setTimeout(() => {
          toast.dismiss(toastId);

          onWishlistItemDeleted(itemEntityId);

          void deleteWishlistItem({
            input: { entityId, itemEntityIds: [itemEntityId] },
          });
        }, 5000);

        toast(
          ({ id }) => {
            toastId = id;

            return (
              <div className="flex items-center gap-3">
                <span>
                  {t.rich('success', {
                    undoButton: (chunks) => (
                      <Button
                        className="inline-flex w-auto items-center p-0 text-primary hover:bg-transparent disabled:text-primary disabled:hover:text-primary"
                        onClick={() => {
                          toast.dismiss(toastId);

                          onWishlistItemUndoDelete(itemEntityId);

                          clearTimeout(timer);
                        }}
                        variant="subtle"
                      >
                        {chunks}
                      </Button>
                    ),
                  })}
                </span>
              </div>
            );
          },
          { duration: 5000 },
        );
      }}
    >
      <input name="wishlistId" type="hidden" value={wishlistId} />
      <input name="wishlistItemId" type="hidden" value={wishlistItemId} />
      <SubmitButton />
    </form>
  );
};
