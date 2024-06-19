import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '~/components/ui/button';
import { Checkbox } from '~/components/ui/checkbox';
import { Field, Form, FormSubmit } from '~/components/ui/form';
import { Label } from '~/components/ui/label';

import { Wishlist } from '..';

import { addWishlistItems } from './_actions/add-wishlist-items';
import { deleteWishlistItems } from './_actions/delete-wishlist-items';

interface SubmitButtonProps {
  disabled: boolean;
}

const SubmitButton = ({ disabled }: SubmitButtonProps) => {
  const { pending } = useFormStatus();
  const t = useTranslations('Account.Wishlist.Sheet');

  return (
    <Button
      className="relative items-center px-8 py-2"
      disabled={disabled}
      loading={pending}
      loadingText={t('save')}
      variant="primary"
    >
      {t('save')}
    </Button>
  );
};

interface UpdateWishlistsFormProps {
  onWishlistsUpdated: (updatedWishlists: Wishlist[]) => void;
  productId: number;
  wishlists: Wishlist[];
}

export const UpdateWishlistsForm = ({
  onWishlistsUpdated,
  productId,
  wishlists,
}: UpdateWishlistsFormProps) => {
  const [wishlistsList, setWishlistsList] = useState(() => {
    return wishlists.map((wishlist) => {
      return {
        ...wishlist,
        checked: wishlist.items.some(({ product }) => product.entityId === productId),
        upToDate: true,
      };
    });
  });

  useEffect(() => {
    setWishlistsList((prevWishlistsList) => {
      return wishlists.map((wishlist) => {
        const prevWishlistsItem = prevWishlistsList.find(
          ({ entityId }) => entityId === wishlist.entityId,
        );

        if (prevWishlistsItem) {
          return {
            ...prevWishlistsItem,
          };
        }

        return {
          ...wishlist,
          checked: false,
          upToDate: true,
        };
      });
    });
  }, [productId, setWishlistsList, wishlists]);

  const handleCheckboxChange = (checked: boolean, wishlistId: number) => {
    setWishlistsList((prevWishlistsList) => {
      const newWishlistItemIdx = prevWishlistsList.findIndex(
        (wishlist) => wishlist.entityId === wishlistId,
      );

      const prevWishlistItem = prevWishlistsList[newWishlistItemIdx];

      if (!prevWishlistItem) {
        return prevWishlistsList;
      }

      const newWishlistItem = {
        ...prevWishlistItem,
        checked,
        upToDate: !prevWishlistsList[newWishlistItemIdx]?.upToDate,
      };

      const newWishlistsList = [
        ...prevWishlistsList.slice(0, newWishlistItemIdx),
        newWishlistItem,
        ...prevWishlistsList.slice(newWishlistItemIdx + 1),
      ];

      return newWishlistsList;
    });
  };

  const onSubmit = async () => {
    const wishlistsToUpdate = wishlistsList.filter((wishlist) => {
      return !wishlist.upToDate;
    });

    const result = await Promise.all(
      wishlistsToUpdate.map(({ checked, entityId, items }) => {
        if (checked) {
          return addWishlistItems({
            input: {
              entityId,
              items: [{ productEntityId: productId }],
            },
          });
        }

        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const itemEntityId = items.find(({ product }) => product.entityId === productId)!.entityId;

        return deleteWishlistItems({
          input: {
            entityId,
            itemEntityIds: [itemEntityId],
          },
        });
      }),
    );

    const updatedWishlists = result.reduce<Wishlist[]>((acc, curr) => {
      if (curr.data) {
        acc.push(curr.data);
      }

      return acc;
    }, []);

    setWishlistsList((prevWishlistsList) => {
      return prevWishlistsList.map((wishlist) => {
        const updatedWishlist = updatedWishlists.find(
          ({ entityId }) => entityId === wishlist.entityId,
        );

        return {
          ...wishlist,
          items: updatedWishlist ? [...updatedWishlist.items] : [...wishlist.items],
          upToDate: true,
        };
      });
    });

    onWishlistsUpdated(updatedWishlists);
  };

  return (
    <Form action={onSubmit} className="mb-3" onSubmit={(e) => e.stopPropagation()}>
      <fieldset className="overflow-auto">
        {wishlistsList.map(({ entityId, name, checked }) => {
          return (
            <Field className="mb-6 flex" key={entityId} name={entityId.toString()}>
              <Checkbox
                checked={checked}
                defaultChecked={checked}
                id={entityId.toString()}
                onCheckedChange={(_checked) => handleCheckboxChange(!!_checked, entityId)}
              />
              <Label className="cursor-pointer ps-3" htmlFor={entityId.toString()}>
                {name}
              </Label>
            </Field>
          );
        })}
      </fieldset>
      <FormSubmit asChild>
        <SubmitButton disabled={!wishlistsList.find((wishlist) => !wishlist.upToDate)} />
      </FormSubmit>
    </Form>
  );
};
