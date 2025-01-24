'use client';

import { removeEdgesAndNodes } from '@bigcommerce/catalyst-client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { FragmentOf } from 'gql.tada';
import { AlertCircle, Check, Heart, ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FormProvider, useFormContext } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { useEffect } from 'react';

import { ProductItemFragment } from '~/client/fragments/product-item';
import { AddToCartButton } from '~/components/add-to-cart-button';
import { getCartData } from '~/components/get-cart-items';
import { useCart } from '~/components/header/cart-provider';
import { Link } from '~/components/link';
import { Button } from '~/components/ui/button';
import { bodl } from '~/lib/bodl';

import { handleAddToCart } from './_actions/add-to-cart';
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
}: {
  data: Props['data'];
  isSticky?: boolean;
}) => {
  const { formState } = useFormContext();
  const { isSubmitting } = formState;

  return (
    <AddToCartButton data={product} loading={isSubmitting}>
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
  showInSticky = false,
}: Props) => {
  const t = useTranslations('Product.Form');
  const cart = useCart();
  const productFlyout: any = useCommonContext();
  const productOptions = removeEdgesAndNodes(product.productOptions);

  if (productOptions?.length > 0) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
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

  const productFormSubmit = async (data: ProductFormData) => {
    const quantity = Number(data.quantity);
    // Optimistic update
    cart.increment(quantity);
    const result = await handleAddToCart(data, product);

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
              productFlyout.setProductDataFn(items);
            }
          }
        });
      }
    }

    const transformedProduct = productItemTransform(product);

    if (product && product.prices) {
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
  };

  // If showing in sticky header, return only the Submit component
  if (showInSticky) {
    return (
      <FormProvider handleSubmit={handleSubmit} register={register} {...methods}>
        <form onSubmit={handleSubmit(productFormSubmit)}>
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

  return (
    <>
      <ProductFlyout
        data={product}
        closeIcon={closeIcon}
        blankAddImg={blankAddImg}
        fanPopup={fanPopup}
        from="pdp"
      />
      <FormProvider handleSubmit={handleSubmit} register={register} {...methods}>
        <form
          className="product-variants flex flex-col gap-6"
          onSubmit={handleSubmit(productFormSubmit)}
        >
          <input type="hidden" value={product.entityId} {...register('product_id')} />

          {productOptions.map((option) => {
            if (option.__typename === 'MultipleChoiceOption') {
              return (
                <MultipleChoiceField
                  key={option.entityId}
                  option={option}
                  multipleOptionIcon={multipleOptionIcon}
                  productMpn={productMpn}
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

          <div className="mt-0 flex flex-col gap-4 @md:flex-row xl:mt-4">
            <Submit data={product} />
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
