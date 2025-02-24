'use client';

import { useFormatter, useTranslations } from 'next-intl';
import { BcImage } from '~/components/bc-image';
import { Select } from '~/components/ui/form';
import { useCart } from '~/components/header/cart-provider';
import { addToCart } from '~/components/product-card/add-to-cart/form/_actions/add-to-cart';
import { AlertCircle, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from '~/components/link';
import { useState, useTransition } from 'react';
import { Button } from '~/components/ui/button';
import { useCommonContext } from '~/components/common-context/common-provider';
import { GetCartMetaFields, CreateCartMetaFields, UpdateCartMetaFields } from '../management-apis';
import { InputPlusMinus } from '../form-fields/input-plus-minus';

interface Props {
  accessories: any;
  index: number;
  fanPopup: string;
  currencyCode: string;
  blankAddImg: string;
  isLoading: boolean;
  from: string;
  setIsLoading: (loading: boolean) => void;
  data: any;
}

export const ProductAccessories = ({
  accessories,
  index,
  currencyCode,
  fanPopup,
  blankAddImg,
  isLoading,
  setIsLoading,
  from,
  data
}: Props) => {
  const format = useFormatter();
  const productFlyout = useCommonContext();
  const t = useTranslations('Components.ProductCard.AddToCart');
  const cart = useCart();
  let accessoriesProducts: any = accessories?.productData?.map(
    ({
      sku,
      id,
      price,
      name,
      sale_price,
      retail_price,
      purchasing_disabled,
      update_price_for_msrp,
    }: {
      sku: any;
      id: any;
      price: any;
      name: any;
      sale_price: any;
      retail_price:any;
      purchasing_disabled:Boolean,
      update_price_for_msrp:any,
    }) => ({
      value: id,
      label: `(+$${sale_price}) ${sku}  ${name}`,
      purchasing_disabled: purchasing_disabled.toString(),
    }),
  );
  const [isPending, startTransition] = useTransition();
  const [variantId, setvariantId] = useState<number>(0);
  const [productlabel, setProductLabel] = useState<string>(accessories?.label);
  const [productPrice, setProductPrice] = useState<any>();
  const [productSalePrice, setProductSalePrice] = useState<any>();
  const [originalPrice, setOriginalPrice] = useState<any>();
  const [updatedPrice, setUpdatedPrice] = useState<any>();
  const [productImage, setProductImage] = useState<string>(blankAddImg);
  const [baseImage, setBaseImage] = useState<string>(' bg-set');
  const [hasSalePrice, setHasSalePrice] = useState<number>(0);
  const [hasDiscount, setHasDiscount] = useState<boolean>(true);
  const [isPurchasingDisabled, setIsPurchasingDisabled] = useState<boolean>(false);

  const onProductChange = (variant: any) => {
    setvariantId(variant);
    let accessoriesData = accessories?.productData?.find((prod: any) => prod.id == variant);
    if (accessoriesData) {
      setIsPurchasingDisabled(accessoriesData.purchasing_disabled);
      let formatPrice = format.number(accessoriesData?.price, {
        style: 'currency',
        currency: currencyCode,
      });
      let salePrice: number = accessoriesData?.sale_price;
      if (salePrice != accessoriesData?.price) {
        setHasSalePrice(1);
      } else {
        setHasSalePrice(0);
      }
      if (accessoriesData?.update_price_for_msrp?.hasDiscount){
        setHasDiscount(true);
      }else{
        setHasDiscount(false);
      }
      let formatSalePrice: any = 0;
      formatSalePrice = format.number(salePrice, {
        style: 'currency',
        currency: currencyCode,
      });
      let originalPrice = accessoriesData?.update_price_for_msrp?.originalPrice;
      let formatOriginalPrice: any = 0;
      formatOriginalPrice = format.number(originalPrice,{
        style: 'currency',
        currency: currencyCode,
      });
      let updatedPrice = accessoriesData?.update_price_for_msrp?.updatedPrice;
      let formatUpdatedPrice = format.number(updatedPrice,{
        style: 'currency',
        currency: currencyCode,
      });
      setBaseImage('');
      setProductLabel(accessoriesData?.name?.replace('-', ''));
      setProductPrice(formatPrice);
      setProductImage(accessoriesData?.image);
      setProductSalePrice(formatSalePrice);
      setOriginalPrice(formatOriginalPrice);
      setUpdatedPrice(formatUpdatedPrice);
    }
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    setIsLoading(true);
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const quantity = Number(formData.get('quantity'));
    if (variantId == 0) {
      setIsLoading(false);
      return false;
    }
    cart.increment(quantity);
    startTransition(async () => {
      const result = await addToCart(formData);
      if (result?.items) {
        productFlyout.setCartDataFn(result?.items);
      }

      if (result.error) {
        setIsLoading(false);
        cart.decrement(quantity);

        toast.error(t('error'), {
          icon: <AlertCircle className="text-error-secondary" />,
        });
      }
      if (result?.status == 'success') {
        let cartId: string = result?.data?.entityId || '';
        //update the cart metafields
        if (cartId) {
          let lineItemId = (from == 'pdp') ? productFlyout?.productData?.entityId : data?.entityId;
          let productId = (from == 'pdp') ? productFlyout?.productData?.productEntityId : data?.productEntityId;
          let variantIdData = (from == 'pdp') ? productFlyout?.productData?.variantEntityId : data?.variantEntityId;
          let optionValue = {
            productId: productId,
            variantId: variantId,
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
                (item: any) => item?.variantId == variantId,
              );
              if (existingIndex >= 0) {
                existingValue[existingIndex].quantity += quantity;
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
          setIsLoading(false);
          toast.success(
            () => (
              <div className="flex items-center gap-3">
                <span>
                  {t.rich('success', {
                    cartItems: quantity,
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
  let hideImage = '';
  if (baseImage) {
    hideImage = ' hidden';
  }
 
  return (
    <>
      {accessories?.length}
      <div
        className={`left-container flex h-[150px] w-[195px] items-center justify-center border border-[#CCCBCB] bg-transparent xl:h-[150px] xl:w-[195px] sm:h-[155px] sm:w-[150px] 4xl:h-[155px] 4xl:w-[150px] sm:bg-transparent ${baseImage}`}
      >
        <BcImage
          alt={accessories?.label}
          className={`h-[145px] w-[190px] xl:h-[145px] xl:w-[190px] object-fill sm:h-[150px] sm:w-[150px] 4xl:h-[150px] 4xl:w-[150px] ${baseImage}`}
          height={150}
          src={productImage}
          width={150}
          unoptimized={true}
        />
      </div>
      <div className="flex w-full shrink-[100] flex-col gap-[10px]">
          <div className="flex flex-col gap-[5px] sm:gap-[0px] xl:gap-[5px] 4xl:gap-[0px]">
            <p className="text-center xl:text-center text-[16px] font-normal tracking-[0.15px] text-[#353535] sm:text-left 4xl:text-left ">
              {productlabel}
            </p>
            <p className="text-center xl:text-center text-[16px] font-normal tracking-[0.15px] text-[#353535] sm:text-right 4xl:text-right">
              {updatedPrice}
              {hasDiscount && (
                <span className="ml-1 text-[#808080] line-through">{originalPrice}</span>
              )}
            </p>
          </div>
        <div className="right-container">
          <Select
            name={`accessories-products-${index}`}
            id={`accessories-products-${index}`}
            options={accessoriesProducts}
            placeholder={accessories?.label}
            onValueChange={(value: string) => onProductChange(value)}
          />
        </div>
        <div className="add-to-cart">
          <form onSubmit={handleSubmit}>
            <input name="product_id" type="hidden" value={accessories?.entityId} />
            <input name="variant_id" type="hidden" value={variantId} />
            <div className="relative flex flex-col items-center justify-end gap-[10px] p-0 xl:flex-col 4xl:flex-row sm:flex-row xl:items-center 4xl:items-start sm:items-start">
             {!isPurchasingDisabled && <InputPlusMinus
                product="false"
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                productData=""
              />}
              <div className='justify-center'>
              <Button
                id="add-to-cart"
                className={`h-[42px] flex-shrink-[100] !rounded-[3px] bg-[#03465C] !px-[10px] !py-[5px] text-[14px] font-medium tracking-[1.25px] ${isPurchasingDisabled &&'!bg-[#b1b9bc]'}`}  
                loading={isPending}
                loadingText="processing"
                type="submit"
                disabled={isPurchasingDisabled}
              >
                ADD TO CART
              </Button>
              {isPurchasingDisabled&& <p className="text-[#2e2e2e] text-[12px] text-center mt-1">This product is currently unavailable</p>}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
