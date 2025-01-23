'use client';

import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'react-hot-toast';

import { FragmentOf } from '~/client/graphql';

import { CartItemFragment } from '~/app/[locale]/(default)/cart/_components/cart-item';
import { RemoveFromCartButton } from '~/app/[locale]/(default)/cart/_components/remove-from-cart-button';
import { GetCartMetaFields, RemoveCartMetaFields, UpdateCartMetaFields } from '~/components/management-apis';
import { updateItemQuantity } from '~/app/[locale]/(default)/cart/_components/item-quantity/update-item-quantity';

type FragmentResult = FragmentOf<typeof CartItemFragment>;
type PhysicalItem = FragmentResult['physicalItems'][number];
type DigitalItem = FragmentResult['digitalItems'][number];

export type Product = PhysicalItem | DigitalItem;

interface Props {
  currency: string;
  product: Product;
  lineItemId: string;
  cartId: string;
}

export const RemoveAccessoryItem = ({ currency, product, lineItemId, cartId }: Props) => {
  const t = useTranslations('Cart.SubmitRemoveItem');
  const onSubmitRemoveItem = async () => {
    let getCartMetaFields: any = await GetCartMetaFields(cartId, 'accessories_data');
    let lineItemAvailability: any = [];
    if (getCartMetaFields?.length > 0) {
      getCartMetaFields?.forEach((meta: any) => {
        let itemAvailableData = (meta?.value) ? JSON?.parse(meta?.value) : [];
        if(itemAvailableData?.length > 0) {
          itemAvailableData?.forEach(async (info: any) => {
            if(product?.variantEntityId == info?.variantId) {
              let findTheVariant: any = lineItemAvailability?.find((item: any) => item?.variant == info?.variantId);
              let findTheVariantIndex: number = lineItemAvailability?.findIndex((item: any) => item?.variant == info?.variantId);
              if(!findTheVariant) {
                lineItemAvailability.push({
                  variant: info?.variantId,
                  productsMapped: 1,
                  quantity: info?.quantity
                })
              } else {
                lineItemAvailability[findTheVariantIndex].productsMapped++;
                lineItemAvailability[findTheVariantIndex].quantity += info?.quantity;
              }
            }
          });
        }
      });
      let findAccessories = getCartMetaFields?.find((acces: any) => acces?.key == lineItemId);
      if (findAccessories) {
        let metaFieldId = findAccessories?.id;
        let getAccessoriesInfo = (findAccessories?.value) ? JSON?.parse(findAccessories?.value) : [];
        if (getAccessoriesInfo?.length > 0) {
          getAccessoriesInfo?.forEach(async (getInfo: any, index: number) => {
            if (product?.variantEntityId == getInfo?.variantId) {
              let getAccessories: any = lineItemAvailability?.find((item: any) => item.variant == getInfo?.variantId);
              if(getAccessories) {
                const { status } = await updateItemQuantity({
                  lineItemEntityId: product?.entityId,
                  productEntityId: Number(product?.productEntityId),
                  quantity: (getAccessories?.quantity - getInfo?.quantity),
                  selectedOptions: {},
                  variantEntityId: getInfo?.variantId,
                });
                if (status === 'error') {
                  toast.error(t('errorMessage'), {
                    icon: <AlertCircle className="text-error-secondary" />,
                  });
                }
              }
              if(getAccessoriesInfo?.length == 1) {
                await RemoveCartMetaFields(cartId, metaFieldId);
              } else {
                getAccessoriesInfo?.splice(index, 1);
                let cartMeta = {
                  "permission_set": "write_and_sf_access",
                  "namespace": "accessories_data",
                  "key": lineItemId,
                  "value": JSON.stringify(getAccessoriesInfo),
                }
                await UpdateCartMetaFields(cartId, metaFieldId, cartMeta);
              }
            }
          });
        }
      }
    }
    return;
  };

  return (
    <form action={onSubmitRemoveItem}>
      <RemoveFromCartButton  />
    </form>
  );
};
