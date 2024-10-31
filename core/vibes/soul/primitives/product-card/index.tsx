import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';

import { clsx } from 'clsx';

import { Badge } from '@/vibes/soul/primitives/badge';
import { Price, PriceLabel } from '@/vibes/soul/primitives/price-label';

import { Compare } from './compare';

export type CardProduct = {
  id: string;
  title: string;
  href: string;
  image?: { src: string; alt: string };
  price?: Price;
  subtitle?: string;
  badge?: string;
  rating?: number;
};

type Props = {
  className?: string;
  showCompare?: boolean;
  compareLabel?: string;
  compareParamName?: string;
  product: CardProduct;
};

export function ProductCard({
  product: { id, title, subtitle, badge, price, image, href },
  className,
  showCompare = false,
  compareLabel,
  compareParamName,
}: Props) {
  return (
    <div className={className}>
      <Link
        id={id}
        href={href}
        className="group flex cursor-pointer flex-col gap-2 rounded-xl ring-primary ring-offset-4 focus-visible:outline-0 focus-visible:ring-2 @md:rounded-2xl"
      >
        <div className="relative aspect-[5/6] overflow-hidden rounded-[inherit] bg-contrast-100">
          {image?.src != null ? (
            <BcImage
              src={image.src}
              fill
              sizes="(max-width: 768px) 70vw, 33vw"
              alt="Category card image"
              className="w-full scale-100 select-none bg-contrast-100 object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="pl-2 pt-3 text-7xl font-bold leading-[0.8] tracking-tighter text-contrast-300 transition-transform duration-500 ease-out group-hover:scale-105">
              {title}
            </div>
          )}
          {badge != null && badge !== '' && (
            <Badge variant="rounded" className="absolute left-3 top-3">
              {badge}
            </Badge>
          )}
        </div>
      </Link>

      <div className="mt-2 flex flex-col items-start gap-x-4 gap-y-3 px-1 @xs:mt-3 @2xl:flex-row">
        <div className="flex-1">
          <Link tabIndex={-1} href={href} className="group text-base">
            <span className="block font-semibold">{title}</span>

            {subtitle != null && subtitle !== '' && (
              <span className="mb-2 block text-sm font-normal text-contrast-400">{subtitle}</span>
            )}
            {price != null && <PriceLabel price={price} />}
          </Link>
        </div>

        {showCompare && (
          <div className="mt-0.5 shrink-0">
            <Compare productId={id} label={compareLabel} paramName={compareParamName} />
          </div>
        )}
      </div>
    </div>
  );
}

interface ProductCardSkeletonProps {
  className?: string;
}

export const ProductCardSkeleton = function ProductCardSkeleton({
  className,
}: ProductCardSkeletonProps) {
  return (
    <div className={clsx('animate-pulse cursor-pointer rounded-xl @md:rounded-2xl', className)}>
      {/* Image */}
      <div className="relative aspect-[5/6] overflow-hidden rounded-xl bg-contrast-100 @6xl:min-w-80"></div>
      <div className="flex justify-between gap-2 pt-4 @sm:gap-2 @sm:pt-7">
        <h3 className="flex flex-col flex-wrap justify-between gap-2 @sm:gap-2 @4xl:flex-row">
          {/* Name */}
          <div className="h-4 w-24 rounded-lg bg-contrast-100" />
          {/* Subtitle */}
          <div className="h-4 w-20 rounded-lg bg-contrast-100" />
        </h3>
        {/* Price */}
        <div className="h-4 w-16 rounded-lg bg-contrast-100 @4xl:h-6" />
      </div>
    </div>
  );
};
