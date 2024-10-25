'use client';

import { useTranslations } from 'next-intl';
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
}

export const ProductAccessories = ({ accessories, index }: Props) => {
  const t = useTranslations('Components.ProductCard.AddToCart');
  const cart = useCart();
  let accessoriesProducts: any = accessories?.productData?.map(
    ({ sku, id, price, name }: { sku: any; id: any; price: any; name: any }) => ({
      value: id,
      label: `(+$${price}) ${sku}-  ${name}`,
    }),
  );
  const onProductChange = (variant: any) => {
    setvariantId(variant);
  };
  const [isPending, startTransition] = useTransition();
  const [variantId, setvariantId] = useState<number>(0);

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
        <div className='flex flex-col'>
            <p className='font-normal text-[16px] tracking-[0.15px] text-[#353535]'>36W 3 LED Bowl Light Kit-6.85 Inches Tall and 13.07 Inches Wide</p>
            <p className='font-normal text-[16px] tracking-[0.15px] text-[#353535] text-right'>$321.00 <span className='text-[#808080] line-through'>$400.00</span></p>
        </div>
        <div className="right-container">
          {/* <div className="accessories-label">{accessories?.label}</div> */}
         
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
