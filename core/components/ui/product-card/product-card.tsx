import { ComponentPropsWithRef, ReactNode } from 'react';

import { BcImage } from '~/components/bc-image';
import { cn } from '~/lib/utils';
import { Link } from '~/navigation';

import { Compare } from './compare';

interface Props extends ComponentPropsWithRef<'div'> {
  addToCart?: ReactNode;
  brand?: string;
  image?: { url: string; altText: string } | null;
  imagePriority?: boolean;
  imageSize?: 'square' | 'tall' | 'wide';
  link: string;
  price?: ReactNode;
  productId: number;
  showCompare?: boolean;
  title: string;
}

const ProductCard = ({
  addToCart,
  brand,
  className,
  image,
  imagePriority = false,
  imageSize,
  link,
  price,
  productId,
  showCompare = true,
  title,
  ...props
}: Props) => {
  return (
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
        {brand ? <p className="text-base text-gray-500">{brand}</p> : null}
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
          {price}

          {showCompare && (
            <Compare productId={productId} productImage={image} productName={title} />
          )}
        </div>
      </div>
      {addToCart}
    </div>
  );
};

ProductCard.displayName = 'ProductCard';

export { ProductCard };
