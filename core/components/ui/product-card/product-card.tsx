import { ReactNode } from 'react';

import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';
import { cn } from '~/lib/utils';

import { Compare } from './compare';

interface Image {
  altText: string;
  src: string;
}

type Price =
  | string
  | {
      type: 'sale';
      currentValue: string;
      previousValue: string;
    }
  | {
      type: 'range';
      minValue: string;
      maxValue: string;
    };

interface Product {
  id: string;
  name: string;
  href: string;
  image?: Image;
  price?: Price;
  subtitle?: string;
  badge?: string;
}

interface Props extends Product {
  addToCart?: ReactNode;
  className?: string;
  imagePriority?: boolean;
  imageSize?: 'square' | 'tall' | 'wide';
  showCompare?: boolean;
}

const ProductCard = ({
  addToCart,
  className,
  image,
  imagePriority = false,
  imageSize,
  href,
  price,
  id,
  showCompare = true,
  subtitle,
  name,
  ...props
}: Props) => (
  <div className={cn('group div-product relative flex flex-row w-[350px] p-[20px_20px_10px_20px] border-[2px] border-[#cccbcb] overflow-visible', className)} {...props}>
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
            src={image.src}
          />
        ) : (
          <div className="h-full w-full bg-gray-200" />
        )}
      </div>
    </div>
    <div className={cn('flex flex-1 flex-col gap-1 mt-3', Boolean(addToCart) && 'justify-end')}>
      {subtitle ? <p className="text-base text-gray-500 hidden">{subtitle}</p> : null}
      <h3 className="text-xl font-bold lg:text-2xl">
        <Link
          className="focus-visible:outline text-base font-normal text-[#353535] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-primary/20 focus-visible:ring-0"
          href={href}
        >
          <span aria-hidden="true" className="absolute inset-0 bottom-20" />
          {name}
        </Link>
      </h3>
      <div className="flex flex-wrap items-end justify-between pt-1">
        {Boolean(price) &&
          (typeof price === 'object' ? (
            <p className="flex gap-1">
              {price.type === 'range' && (
                <span className=''>
                  {price.minValue} - {price.maxValue}
                </span>
              )}

              {price.type === 'sale' && (
                <>
                  <span className='product-price-was text-[1.25rem] font-medium leading-[2rem] tracking-[0.009375rem] text-left'>
                    {/* Was:  */}
                    <span className="line-through">{price.previousValue}</span>
                  </span>
                  <span className='product-price-now text-[1.25rem] font-medium leading-[2rem] tracking-[0.009375rem] text-left'>
                    {/* Now: */}
                     {price.currentValue}</span>
                </>
              )}
            </p>
          ) : (
            <span className='text-[1.25rem] font-medium leading-[2rem] tracking-[0.009375rem] text-left'>{price}</span>
          ))}

        {showCompare && <Compare id={id} image={image} name={name} />}
      </div>
    </div>
    {addToCart}
  </div>
);

ProductCard.displayName = 'ProductCard';

export { ProductCard, type Price };
