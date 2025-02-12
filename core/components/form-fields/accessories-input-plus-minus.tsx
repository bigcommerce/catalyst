'use client';

import { AlertCircle, Check, Minus, Plus, Loader2 as Spinner } from "lucide-react";
import { startTransition, useState } from "react";
import { CreateCartMetaFields, GetCartMetaFields, UpdateCartLineItems, UpdateCartMetaFields } from "../management-apis";
import { useCommonContext } from '~/components/common-context/common-provider';
import { useCart } from '~/components/header/cart-provider';
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { Link } from '~/components/link';
import { getCartData } from "../get-cart-items";

export const AccessoriesInputPlusMinus = ({ accessories, data }: { accessories: any, data: any }) => {
  const [quantity, setQuantity] = useState<any>(accessories?.prodQuantity);
  const [loader, setLoader] = useState<Boolean>(false);
  const productFlyout = useCommonContext();
  const cart = useCart();
  const t = useTranslations('Components.ProductCard.AddToCart');

  const changeInput = async (param: any) => {
    let quanty = quantity;
    let zeroQty = 0;
    let totalQty = accessories?.quantity || 0;
    if (param == 'minus') {
      quanty = quantity - 1;
      totalQty -= 1;
      if (quanty <= 0) {
        zeroQty = 1;
        quanty = 1;
      }
      setQuantity(quanty);
    } else {
      quanty = quantity + 1;
      totalQty += 1;
      setQuantity(quanty);
    }
    if(zeroQty == 1) {
      return;
    }
    if(totalQty == 0) {
      return;
    }
    setLoader(true);
    startTransition(async () => {
      let postData = {
        line_item: {
          product_id: accessories?.productEntityId,
          quantity: totalQty,
          variant_id: accessories?.variantEntityId
        }
      };
      let status = await UpdateCartLineItems(accessories?.cartId, accessories?.entityId, postData);
      let cartData: any = await getCartData(accessories?.cartId);
      cart.setCount(cartData?.data?.lineItems?.totalQuantity);
      productFlyout.setCartDataFn(cartData?.data);
      if (status?.error) {
        setLoader(false);

        toast.error(t('error'), {
          icon: <AlertCircle className="text-error-secondary" />,
        });
      } else {
        let cartId: string = accessories?.cartId || '';
        //update the cart metafields
        if (cartId) {
          let lineItemId = accessories?.lineItemId;
          let productId = accessories?.productEntityId;
          let variantIdData = data?.variantEntityId;
          let optionValue = {
            productId: productId,
            variantId: accessories?.variantEntityId,
            quantity: quantity,
          };
          let cartMetaFields: any = await GetCartMetaFields(cartId, 'accessories_data');
          let getCartMetaLineItems = cartMetaFields?.find((item: any) => item?.key == lineItemId);
          if (cartMetaFields?.length == 0 || !getCartMetaLineItems) {
            let metaArray: any = [];
            let parentInfo: any = JSON.stringify([{
              productId: productId,
              variantId: variantIdData
            }]);
            metaArray.push(optionValue);
            let cartMeta = {
              permission_set: 'write_and_sf_access',
              namespace: 'accessories_data',
              key: lineItemId,
              description: parentInfo,
              value: JSON.stringify(metaArray),
            };
            await CreateCartMetaFields(cartId, cartMeta);
          } else {
            let metaFieldId = getCartMetaLineItems?.id;
            let existingValue: any = '';
            if (getCartMetaLineItems?.id) {
              existingValue = JSON?.parse(getCartMetaLineItems?.value);
              let existingIndex = existingValue?.findIndex(
                (item: any) => item?.variantId == accessories?.variantEntityId,
              );
              if (existingIndex >= 0) {
                existingValue[existingIndex].quantity = quanty;
              } else {
                existingValue.push(optionValue);
              }
            }
            let cartMeta = {
              permission_set: 'write_and_sf_access',
              namespace: 'accessories_data',
              key: lineItemId,
              value: JSON.stringify(existingValue),
            };
            await UpdateCartMetaFields(cartId, metaFieldId, cartMeta);
          }
          setLoader(false);
          toast.success(
            () => (
              <div className="flex items-center gap-3">
                <span>
                  {t.rich('update', {
                    cartLink: (chunks: any) => (
                      <Link
                        className="font-semibold text-primary"
                        href="/cart"
                        prefetch="viewport"
                        prefetchKind="full"
                      >
                        {chunks}
                      </Link>
                    ),
                  })}
                </span>
              </div>
            ),
            { icon: <Check className="text-success-secondary" /> },
          );
        }
      }
    });
  };

  return (
    <>
      <div className="relative w-max">
        <div
          className={`flyout-loading ${loader ? 'flex' : 'hidden'} fixed left-0 top-0 z-50 h-full w-full items-center justify-center`}
        >
          <Spinner className="animate-spin rounded-[50%] bg-[#8b8d8f] text-white shadow-[0_10px_38px_2000px_#0e121659,_0_10px_20px_2000px_#0e121633]" />
        </div>
        {/* {loader && <Spinner aria-hidden="true" className="animate-spin text-blue-600 absolute top-[23%] left-[38.1%] "></Spinner>} */}
        <div className="text-[14px] font-normal tracking-[0.25px] text-[#353535]">
          <div className="flex h-[44px] max-w-[105px] items-center justify-center gap-[10px] rounded-[20px] border border-[#d6d6d6]">
            <div className="cursor-pointer">
              <Minus
                onClick={() => changeInput('minus')}
                className="h-[1rem] w-[1rem] text-[#7F7F7F]"
              ></Minus>
            </div>
            <input
              name="quantity"
              type="number"
              readOnly
              className="[&::-webkit-outer-spin-button]:margin-0 bg-transparent [&::-webkit-inner-spin-button]:margin-0 w-[35%] border border-y-0 text-center focus:border-y-0 focus:outline-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              min="1"
              value={quantity}
            />
            <div className="cursor-pointer">
              <Plus
                onClick={() => changeInput('plus')}
                className="h-[1rem] w-[1rem] text-[#7F7F7F]"
              ></Plus>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

