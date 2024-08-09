import { ComponentPropsWithoutRef, ReactNode } from 'react';

import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';
import { cn } from '~/lib/utils';

import { Compare } from './compare';

type Price =
  | {
      type: 'range';
      min: string;
      max: string;
    }
  | {
      type: 'fixed';
      amount: string;
      msrp?: string;
    }
  | { type: 'sale'; originalAmount: string; amount: string; msrp?: string };

interface Props extends ComponentPropsWithoutRef<'div'> {
  addToCart?: ReactNode;
  image?: { url: string; altText: string } | null;
  imagePriority?: boolean;
  imageSize?: 'square' | 'tall' | 'wide';
  link: string;
  price?: Price;
  productId: number;
  showCompare?: boolean;
  subtitle?: string;
  title: string;
}

const ProductCard = ({
  addToCart,
  className,
  image,
  imagePriority = false,
  imageSize,
  link,
  price,
  productId,
  showCompare = true,
  subtitle,
  title,
  ...props
}: Props) => (
  <div className={cn('group relative flex flex-col overflow-visible', className)} {...props}>
    <div className="relative flex justify-center pb-3">
      <div
        className={cn('relative flex-auto', {
          'aspect-square': imageSize === 'square',
          'aspect-[4/5]': imageSize === 'tall',
          'aspect-[7/5]': imageSize === 'wide',
        })}
      >
        {image ? (
          <BcImage
            alt={image.altText}
            className="object-contain"
            fill
            priority={imagePriority}
            sizes="(max-width: 768px) 50vw, (max-width: 1536px) 25vw, 500px"
            src={image.url}
          />
        ) : (
          <div className="h-full w-full bg-gray-200" />
        )}
      </div>
    </div>
    <div className={cn('flex flex-1 flex-col gap-1', Boolean(addToCart) && 'justify-end')}>
      {subtitle ? <p className="text-base text-gray-500">{subtitle}</p> : null}
      <h3 className="text-xl font-bold lg:text-2xl">
        <Link
          className="focus-visible:outline focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-primary/20 focus-visible:ring-0"
          href={link}
        >
          <span aria-hidden="true" className="absolute inset-0 bottom-20" />
          {title}
        </Link>
      </h3>
      <div className="flex flex-wrap items-end justify-between pt-1">
        {price && (
          <p className="flex flex-col gap-1">
            {price.type === 'range' && (
              <span>
                {price.min} - {price.max}
              </span>
            )}

            {price.type === 'fixed' && (
              <>
                {Boolean(price.msrp) && (
                  <span>
                    MSRP: <span className="line-through">{price.msrp}</span>
                  </span>
                )}
                <span>{price.amount}</span>
              </>
            )}

            {price.type === 'sale' && (
              <>
                {Boolean(price.msrp) && (
                  <span>
                    MSRP: <span className="line-through">{price.msrp}</span>
                  </span>
                )}
                <>
                  <span>
                    Was: <span className="line-through">{price.originalAmount}</span>
                  </span>
                  <span>Now: {price.amount}</span>
                </>
              </>
            )}
          </p>
        )}

        {showCompare && <Compare productId={productId} productImage={image} productName={title} />}
      </div>
    </div>
    {addToCart}
  </div>
);

ProductCard.displayName = 'ProductCard';

export { ProductCard, type Price };
