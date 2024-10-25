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

interface Props {
  accessories: any;
  index: number;
  currencyCode: string;
}

export const ProductAccessories = ({ accessories, index, currencyCode }: Props) => {
  const format = useFormatter();
  const t = useTranslations('Components.ProductCard.AddToCart');
  const cart = useCart();
  let accessoriesProducts: any = accessories?.productData?.map(
    ({ sku, id, price, name }: { sku: any; id: any; price: any; name: any }) => ({
      value: id,
      label: `(+$${price}) ${sku}-  ${name}`,
    }),
  );
  const [isPending, startTransition] = useTransition();
  const [variantId, setvariantId] = useState<number>(0);
  const [productlabel, setProductLabel] = useState<string>(accessories?.label);
  const [productPrice, setProductPrice] = useState<any>();
  const onProductChange = (variant: any) => {
    setvariantId(variant);
    let accessoriesData = accessories?.productData?.find((prod: any) => prod.id == variant);
    if(accessoriesData) {
      let formatPrice = format.number(accessoriesData?.price, {
        style: 'currency',
        currency: currencyCode,
      });
      setProductLabel(accessoriesData?.name);
      setProductPrice(formatPrice);
    }
  };
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const quantity = Number(formData.get('quantity'));
    if (variantId == 0) {
      return false;
    }

    // Optimistic update
    cart.increment(quantity);
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

    startTransition(async () => {
      const result = await addToCart(formData);

      if (result.error) {
        cart.decrement(quantity);

        toast.error(t('error'), {
          icon: <AlertCircle className="text-error-secondary" />,
        });
      }
    });
  };

  return (
    <>
      {accessories?.length}
      <div className="left-container w-[150px] h-[150px]">
        <BcImage
          alt={accessories?.label}
          className="object-contain"
          height={150}
          src={accessories?.image}
          width={150}
        />
      </div>
      <div className='w-full flex flex-col gap-[10px]'>
        {productlabel && (
        <div className='flex flex-col'>
            <p className='font-normal text-[16px] tracking-[0.15px] text-[#353535]'>{productlabel}</p>
            <p className='font-normal text-[16px] tracking-[0.15px] text-[#353535] text-right'>{productPrice}</p>
        </div>
        )}
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
            <input name="quantity" type="hidden" value={1} />
            <Button
              id="add-to-cart"
              className="rounded-[3px] py-[5px] px-[10px] h-[42px] text-[14px] font-medium tracking-[1.25px]"
              loading={isPending}
              loadingText="processing"
              type="submit"
            >
              ADD TO CART
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};
