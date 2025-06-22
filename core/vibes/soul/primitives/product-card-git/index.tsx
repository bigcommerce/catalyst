import clsx from 'clsx';
import Image from 'next/image';
import { Badge } from '../badge';

interface ProductCardProps {
  className?: string;
  image?: { src: string; alt: string };
  name: string;
  price?: string;
  salePrice?: string;
  rating: number;
  reviewCount: number;
  showBadge?: boolean;
  badgeText?: string;
  badgeColor?: string;
  aspectRatio?: '5:6' | '3:4' | '1:1';
  showReviews?: boolean;
  imagePriority?: boolean;
  imageSizes?: string;
}

export const ProductCard = ({
  className,
  image,
  name,
  price,
  salePrice,
  rating,
  reviewCount,
  showBadge = false,
  badgeText = 'Best Seller',
  badgeColor = 'bg-yellow-400',
  aspectRatio = '5:6',
  imagePriority = false,
  imageSizes = '(min-width: 80rem) 20vw, (min-width: 64rem) 25vw, (min-width: 42rem) 33vw, (min-width: 24rem) 50vw, 100vw',
  showReviews = true,
}: ProductCardProps) => {
  return (
    <div className={`max-w-xl overflow-hidden rounded-lg bg-white shadow-lg ${className}`}>
      <div
        className={clsx(
          'relative overflow-hidden rounded-xl bg-[var(--product-card-light-background,hsl(var(--contrast-100)))] @md:rounded-2xl',
          {
            '5:6': 'aspect-[5/6]',
            '3:4': 'aspect-[3/4]',
            '1:1': 'aspect-square',
          }[aspectRatio],
        )}
      >
        {image != null ? (
          <Image
            alt={image.alt}
            className={clsx(
              'bg-[var(--product-card-light-background,hsl(var(--contrast-100))] w-full scale-100 select-none object-cover transition-transform duration-500 ease-out group-hover:scale-110',
            )}
            fill
            priority={imagePriority}
            sizes={imageSizes}
            src={image.src}
          />
        ) : (
          <div
            className={clsx(
              'break-words pl-5 pt-5 text-4xl font-bold leading-[0.8] tracking-tighter text-[var(--product-card-light-title,hsl(var(--foreground)))] opacity-25 transition-transform duration-500 ease-out group-hover:scale-105 @xs:text-7xl',
            )}
          >
            {name}
          </div>
        )}
        {showBadge && badgeText !== '' && (
          <Badge className="absolute left-3 top-3" shape="rounded">
            {badgeText}
          </Badge>
        )}
      </div>
      <div className="p-4">
        <h2 className="mb-1 text-xl font-bold text-gray-800">{name}</h2>
        {showReviews && (
          <div className="mb-2 flex items-center">
            <div className="text-yellow-400">
              {'★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating))}
            </div>
            <span className="ml-2 text-sm text-gray-600">
              {rating} ({reviewCount} reviews)
            </span>
          </div>
        )}

        {salePrice ? (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{salePrice}</span>
            <span className="text-gray-400 line-through">{price}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">{price}</span>
          </div>
        )}
        <button className="mt-4 w-full rounded bg-gray-900 py-2 text-white transition hover:bg-gray-800">
          Shop Now →
        </button>
      </div>
    </div>
  );
};
