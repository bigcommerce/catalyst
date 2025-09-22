import clsx from 'clsx';
import { Image } from '~/components/image';
import { Badge } from '../badge';
import { Link } from '~/components/link';

interface ProductCardProps {
  className?: string;
  image?: { src: string; alt: string };
  name: string;
  price?: string;
  salePrice?: string;
  rating: number;
  reviewCount: number;
  badge: { show: boolean; text: string; theme: string; shape: string; location: string };
  aspectRatio?: '5:6' | '3:4' | '1:1';
  showReviews?: boolean;
  imagePriority?: boolean;
  imageSizes?: string;
  href: string;
  id: string;
  buttonText?: string;
}

const DEFAULT_PRODUCT_IMAGE_URL =
  'https://betterineraction.nyc3.cdn.digitaloceanspaces.com/product-placeholder.svg';

export const ProductCard = ({
  className,
  image,
  name,
  price,
  salePrice,
  rating,
  reviewCount,
  badge,
  aspectRatio = '5:6',
  imagePriority = false,
  imageSizes = '(min-width: 80rem) 20vw, (min-width: 64rem) 25vw, (min-width: 42rem) 33vw, (min-width: 24rem) 50vw, 100vw',
  showReviews = true,
  buttonText = 'Shop Now →',
  id,
  href,
}: ProductCardProps) => {
  return (
    <div className="relative">
      <Link
        aria-label={name}
        href={href}
        id={id}
        className={clsx(
          'max-w group flex h-full flex-col overflow-hidden rounded-lg bg-white no-underline shadow-lg',
          className,
        )}
        style={{ display: 'block' }}
      >
        <div
          className={clsx(
            'relative max-h-[480px] overflow-hidden rounded-xl bg-[var(--product-card-light-background,hsl(var(--contrast-100)))] @md:rounded-2xl',
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
              loading={imagePriority ? 'eager' : 'lazy'}
            />
          ) : (
            <Image
              alt={`${name} image`}
              className={clsx(
                'bg-[var(--product-card-light-background,hsl(var(--contrast-100))] w-full scale-100 select-none object-cover transition-transform duration-500 ease-out group-hover:scale-110',
              )}
              fill
              priority={imagePriority}
              sizes={imageSizes}
              src={DEFAULT_PRODUCT_IMAGE_URL}
              loading={imagePriority ? 'eager' : 'lazy'}
            />
          )}
          {badge.show && badge.text !== '' && (
            <Badge
              className={`absolute ${badge.location}-4 top-4`}
              shape={badge.shape as 'pill' | 'rounded'}
              variant={badge.theme as 'primary' | 'warning' | 'error' | 'success' | 'info'}
            >
              {badge.text}
            </Badge>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <div className="flex flex-1 flex-col">
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
          </div>
        </div>
        <button
          className={clsx(
            'relative mt-4 w-full rounded bg-gray-900 py-2 text-center text-white transition hover:bg-gray-800',
          )}
          type="button"
          tabIndex={-1}
          aria-disabled="true"
        >
          {buttonText}
        </button>
      </Link>
    </div>
  );
};
