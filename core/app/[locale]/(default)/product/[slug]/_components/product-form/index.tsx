'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FragmentOf } from 'gql.tada';
import { AlertCircle, Check, Heart, ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FormProvider, useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useEffect, useMemo, useState } from 'react';

import { ProductItemFragment } from '~/client/fragments/product-item';
import { AddToCartButton } from '~/components/add-to-cart-button';
import { getCartData } from '~/components/get-cart-items';
import { useCart } from '~/components/header/cart-provider';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { bodl } from '~/lib/bodl';

import { handleAddToCart } from './_actions/add-to-cart';

import { handleRequestQuote } from '~/app/[locale]/(default)/sales-buddy/quote/actions/handleRequestQuote';

import { CheckboxField } from './fields/checkbox-field';
import { DateField } from './fields/date-field';
import { MultiLineTextField } from './fields/multi-line-text-field';
import { MultipleChoiceField } from './fields/multiple-choice-field';
import { NumberField } from './fields/number-field';
import { QuantityField } from './fields/quantity-field';
import { TextField } from './fields/text-field';
import { ProductFormData, useProductForm } from './use-product-form';
import { ProductFlyout } from '~/components/product-card/product-flyout';
import { useCommonContext } from '~/components/common-context/common-provider';

import aa from 'search-insights';
import { KlaviyoTrackAddToCart } from '~/belami/components/klaviyo/klaviyo-track-add-to-cart';

import { useCompareDrawerContext } from '~/components/ui/compare-drawer';
import { getCartIdCookie } from '~/app/[locale]/(default)/sales-buddy/_actions/cart';
import { BcImage } from '~/components/bc-image';
import { Label } from '~/components/ui/form';
import exclamatryIcon from '~/public/pdp-icons/exclamatryIcon.svg';
import SkyxFlyout from '~/components/skyx-flyout/skyxFlyout';
import { callforMaxPriceRuleDiscountFunction } from '~/components/common-functions';
import { updateCartLineItemPrice } from '~/components/management-apis';

aa('init', {
  appId: process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '',
  apiKey: process.env.NEXT_PUBLIC_ALGOLIA_API_KEY || '',
});

const indexName: string = process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME || '';

interface Props {
  data: FragmentOf<typeof ProductItemFragment>;
  multipleOptionIcon: string;
  closeIcon: string;
  fanPopup: string;
  blankAddImg: string;
  productMpn: string | null;
  showInSticky?: boolean;
  customerGroupDetails?: any;
  swatchOptions?: any;
  sessionUser?: any;
  priceMaxRules?: any;
}
const productItemTransform = (p: FragmentOf<typeof ProductItemFragment>) => {
  const category = removeEdgesAndNodes(p.categories).at(0);
  const breadcrumbs = category ? removeEdgesAndNodes(category.breadcrumbs) : [];

  return {
    product_id: p.entityId.toString(),
    product_name: p.name,
    brand_name: p.brand?.name,
    sku: p.sku,
    sale_price: p.prices?.salePrice?.value,
    purchase_price: p.prices?.salePrice?.value || p.prices?.price.value || 0,
    base_price: p.prices?.price.value,
    retail_price: p.prices?.retailPrice?.value,
    currency: p.prices?.price.currencyCode || 'USD',
    category_names: breadcrumbs.map(({ name }) => name),
    variant_id: p.variants.edges?.map((variant) => variant.node.entityId),
  };
};

export const Submit = ({
  data: product,
  isSticky = false,
  isQuoteSubmitting = false
}: {
  data: Props['data'];
  isSticky?: boolean;
  isQuoteSubmitting?:boolean;

}) => {
  const { formState } = useFormContext();
  const { isSubmitting } = formState;

  return (
    <AddToCartButton data={product} loading={isSubmitting && !isQuoteSubmitting}>
      {/* Remove the ShoppingCart icon completely */}
      {isSticky ? '' : ''}
    </AddToCartButton>
  );
};

export const ProductForm = ({
  data: product,
  multipleOptionIcon,
  closeIcon,
  fanPopup,
  blankAddImg,
  productMpn,
  customerGroupDetails,
  showInSticky = false,
  swatchOptions,
  sessionUser = null,
  priceMaxRules,
}: Props) => {
  const t = useTranslations('Product.Form');
  const cart = useCart();
  const productFlyout: any = useCommonContext();
  const productOptions = removeEdgesAndNodes(product.productOptions);
  const { setCartIdForCheck, setStoreProductDetailsForQuote, StoreProductDetailsFunctionForQoute } =
    useCompareDrawerContext();
    const [isQuoteSubmitting, setIsQuoteSubmitting] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const pdpUrl = useMemo(() => {
      if (typeof window !== 'undefined') {
        return `${window.location.origin}${pathname}?${searchParams.toString()}`;
      }
      return '';
    }, [pathname, searchParams]);

  if (productOptions?.length > 0) {
    const router = useRouter();
    const handleInteraction = (urlParamArray: any) => {
      const optionSearchParams = new URLSearchParams(searchParams.toString());
      urlParamArray?.forEach((urlData: any) => {
        optionSearchParams.set(String(urlData?.selectedValue), String(urlData?.defaultValue));
      });
      const newUrl = `${pathname}?${optionSearchParams.toString()}`;
      router.replace(newUrl, { scroll: false });
    };
    let urlParamArray: any = [];
    productOptions.forEach((option: any) => {
      const searchParamSelected = searchParams.get(String(option.entityId));
      if (option?.values) {
        const values: any = removeEdgesAndNodes(option.values);
        const selectedValue = option.entityId;
        if (selectedValue) {
          const defaultValue = values.find((value: any) => value.isDefault)?.entityId.toString();
          // console.log(defaultValue,">>Default value");
          urlParamArray.push({
            selectedValue: selectedValue,
            defaultValue: defaultValue,
          });
        }
      }
    });
    useEffect(() => {
      handleInteraction(urlParamArray);
    }, []);
  }

  const { handleSubmit, register, ...methods } = useProductForm();

  const productFormSubmit = async (data: ProductFormData, action: 'addToCart' | 'requestQuote') => {
    const quantity = Number(data.quantity);
    // Optimistic update
    cart.increment(quantity);

    if (action === 'addToCart') {
      const matchedPriceRule = priceMaxRules?.find(
        (r: PriceMaxRule) => r.skus && r.skus.includes(product?.parent?.sku || ''),
      );
      console.log(matchedPriceRule, 'price');

      // Calculate discounted price
      const originalPrice = product?.UpdatePriceForMSRP?.originalPrice || 0;
      let finalPrice = originalPrice;
      if (matchedPriceRule) {
        const discountPercent = Number(matchedPriceRule.discount);
        finalPrice = originalPrice - originalPrice * (discountPercent / 100);
      }

      const result = await handleAddToCart(data, product);

      // If max price rule exists and cart was created successfully, update the price
      if (result.status === 'success' && result.data?.entityId) {
        const priceUpdateData = {
          cartId: result.data.entityId,
          price: finalPrice,
          productId: data.product_id,
          quantity: quantity,
        };
        let itemAddedRecently: any = '';
        if (result?.data?.entityId) {
          let cartData = await getCartData(result?.data?.entityId);
          if (cartData?.data?.lineItems?.physicalItems) {
            productFlyout.setCartDataFn(cartData?.data);
            cartData?.data?.lineItems?.physicalItems?.forEach((items: any) => {
              if (items?.productEntityId == data?.product_id) {
                let selectedOptions = items?.selectedOptions;
                let productSelection = true;
                selectedOptions?.some((selOptions: any) => {
                  if (data?.['attribute_' + selOptions?.entityId] != selOptions?.valueEntityId) {
                    productSelection = false;
                    return true;
                  }
                });
                if (productSelection) {
                  itemAddedRecently = items;
                  productFlyout.setProductDataFn(items);
                }
              }
            });
          }
        }

        try {
          if (itemAddedRecently?.entityId && matchedPriceRule) {
            const priceUpdateResult = await updateCartLineItemPrice(
              priceUpdateData,
              itemAddedRecently?.entityId,
            );
          }
        } catch (error) {
          console.error('Error updating price:', error);
        }
      }

      // Get and log cart ID
      const cartId = await getCartIdCookie();

      if (cartId && typeof cartId === 'object' && 'value' in cartId && cartId.value === undefined) {
        setCartIdForCheck(result?.data?.entityId);
      }

      if (result.error) {
        toast.error(t('error'), {
          icon: <AlertCircle className="text-error-secondary" />,
        });
        cart.decrement(quantity);
        return;
      }

      toast.success(
        () => (
          <div className="flex items-center gap-3">
            <span>
              {t.rich('success', {
                cartItems: quantity,
                cartLink: (chunks) => (
                  <Link
                    className="hover:text-secondary font-semibold text-primary"
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

      const transformedProduct = productItemTransform(product);

      if (product && product.prices) {
        KlaviyoTrackAddToCart({
          product: product as any,
          user:
            sessionUser && sessionUser.user && sessionUser.user?.email
              ? ({
                  email: sessionUser.user.email,
                  first_name: sessionUser.user?.firstName,
                  last_name: sessionUser.user?.lastName,
                } as any)
              : null,
        });

        aa('addedToCartObjectIDs', {
          eventName: 'Product Added To Cart',
          index: indexName,
          objectIDs: [String(transformedProduct.product_id)],
          objectData: [
            {
              price: transformedProduct.purchase_price,
              quantity: quantity,
            },
          ],
          currency: transformedProduct.currency,
        });
      }

      bodl.cart.productAdded({
        product_value: transformedProduct.purchase_price * quantity,
        currency: transformedProduct.currency,
        line_items: [
          {
            ...transformedProduct,
            quantity,
          },
        ],
      });
    } else if (action === 'requestQuote') {
      try {
        setIsQuoteSubmitting(true);
        const quoteResult = await handleRequestQuote(data, product);
        console.log(quoteResult);
        
        var getRelatimeData = StoreProductDetailsFunctionForQoute(quoteResult?.data?.qr_product ? {...quoteResult.data.qr_product, bc_product_url: pdpUrl } : null);
        setStoreProductDetailsForQuote(getRelatimeData);
        localStorage.setItem('Q_R_data', JSON.stringify(getRelatimeData));
      } catch (error) {
        console.error('Error submitting quote:', error);
      } finally {
        setIsQuoteSubmitting(false); 
      }
    }
  };

  // If showing in sticky header, return only the Submit component
  if (showInSticky) {
    return (
      <FormProvider handleSubmit={handleSubmit} register={register} {...methods}>
        <form onSubmit={handleSubmit((data) => productFormSubmit(data, 'addToCart'))}>
          <input type="hidden" value={product.entityId} {...register('product_id')} />
          <input type="hidden" value="1" {...register('quantity')} />
          {productOptions.map((option) => {
            if (option.__typename === 'MultipleChoiceOption') {
              const values = removeEdgesAndNodes(option.values);
              const defaultValue = values.find((value) => value.isDefault)?.entityId.toString();
              return (
                <input
                  key={option.entityId}
                  type="hidden"
                  value={defaultValue}
                  {...register(`attribute_${option.entityId}`)}
                />
              );
            }
            return null;
          })}
          <Submit data={product} isSticky={true} />
        </form>
      </FormProvider>
    );
  }
  const discountRules = customerGroupDetails?.discount_rules;
  return (
    <>
      <ProductFlyout
        data={product}
        closeIcon={closeIcon}
        blankAddImg={blankAddImg}
        fanPopup={fanPopup}
        discountRules={discountRules}
        from="pdp"
      />
      <FormProvider handleSubmit={handleSubmit} register={register} {...methods}>
        <form
          className="product-variants mt-[15px] flex flex-col gap-[20px]"
          onSubmit={handleSubmit((data) => productFormSubmit(data, 'addToCart'))}
        >
          <input type="hidden" value={product.entityId} {...register('product_id')} />

          <div>
            <div className="mb-3 block !gap-0 text-center xl:flex xl:items-center">
              <BcImage
                className="variant-img inline-block !h-[20px] !w-[20px] rounded-[50px]"
                alt="headline icon"
                src={exclamatryIcon}
                width={15}
                height={15}
                unoptimized={true}
                loading="lazy"
              />
              <Label
                className="ml-2 inline-block text-left text-base font-normal leading-8 tracking-wide text-[#353535]"
                htmlFor={`label-`}
              >
                Product Options:
              </Label>
              <SkyxFlyout triggerName={'Hardwire Installation'} />
            </div>

            <div className="flex flex-row justify-center gap-5 xl:justify-start">
              <div className="flex max-w-[100px] flex-col items-center rounded-[5px] bg-[#b4dde9] p-[5px]">
                <div className="bg-white">
                  <BcImage
                    width={90}
                    height={90}
                    alt="skyx"
                    unoptimized={true}
                    src={exclamatryIcon}
                  />
                </div>
                <div className="flex h-full flex-col items-center justify-between p-0">
                  <div className="text-center text-[12px] font-normal leading-[18px] tracking-[0.4px] text-[#353535]">
                    Hardwire Installation
                  </div>
                  <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px]">
                    <span>$359.20</span>
                  </div>
                </div>
              </div>

              <div className="flex max-w-[100px] flex-col items-center rounded-[5px] bg-[#F3F4F5] p-[5px]">
                <div className="bg-white">
                  <BcImage
                    width={90}
                    height={90}
                    alt="skyx"
                    unoptimized={true}
                    src={exclamatryIcon}
                  />
                </div>
                <div className="flex h-full flex-col items-center justify-between p-0">
                  <div className="text-center text-[12px] font-normal leading-[18px] tracking-[0.4px] text-[#353535]">
                    With Skyplug
                  </div>
                  <div className="text-[14px] font-bold leading-[24px] tracking-[0.25px] text-[#006380]">
                    <span>+$20</span>
                  </div>
                </div>
              </div>

              <div className="flex max-w-[100px] flex-col items-center rounded-[5px] bg-[#F3F4F5] p-[5px]">
                <div className="bg-white">
                  <BcImage
                    width={90}
                    height={90}
                    alt="skyx"
                    unoptimized={true}
                    src={exclamatryIcon}
                  />
                </div>
                <div className="flex h-full flex-col items-center justify-between p-0">
                  <div className="text-center text-[12px] font-normal leading-[18px] tracking-[0.4px] text-[#353535]">
                    With Skyplug Smart
                  </div>
                  <div className="text-[14px] font-normal leading-[24px] tracking-[0.25px] text-[#006380]">
                    <span className="font-bold">+$10</span>{' '}
                    <span className="font-normal text-[#353535]">$20</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {productOptions.map((option) => {
            if (option.__typename === 'MultipleChoiceOption') {
              return (
                <MultipleChoiceField
                  key={option.entityId}
                  option={option}
                  multipleOptionIcon={multipleOptionIcon}
                  productMpn={productMpn}
                  swatchOptions={swatchOptions}
                />
              );
            }

            if (option.__typename === 'CheckboxOption') {
              return <CheckboxField key={option.entityId} option={option} />;
            }

            if (option.__typename === 'NumberFieldOption') {
              return <NumberField key={option.entityId} option={option} />;
            }

            if (option.__typename === 'MultiLineTextFieldOption') {
              return <MultiLineTextField key={option.entityId} option={option} />;
            }

            if (option.__typename === 'TextFieldOption') {
              return <TextField key={option.entityId} option={option} />;
            }

            if (option.__typename === 'DateFieldOption') {
              return <DateField key={option.entityId} option={option} />;
            }

            return null;
          })}

          <QuantityField />

          <div className="mt-0 flex flex-col gap-4 @md:flex-row">
            <button
              type="submit"
              className="hidden"
              id="custom-quote"
              onClick={handleSubmit((data) => productFormSubmit(data, 'requestQuote'))}
            >
              Request Quote
            </button>
            <Submit data={product} isQuoteSubmitting={isQuoteSubmitting}/>
            <div className="hidden w-full">
              <Button disabled type="submit" variant="secondary">
                <Heart aria-hidden="true" className="mr-2" />
                <span>{t('saveToWishlist')}</span>
              </Button>
            </div>
          </div>
        </form>
      </FormProvider>
    </>
  );
};
