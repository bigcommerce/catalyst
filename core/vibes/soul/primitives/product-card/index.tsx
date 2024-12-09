import { clsx } from 'clsx';

import { Badge } from '@/vibes/soul/primitives/badge';
import { Price, PriceLabel } from '@/vibes/soul/primitives/price-label';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

import { Compare } from './compare';

export interface CardProduct {
  id: string;
  title: string;
  href: string;
  image?: { src: string; alt: string };
  price?: Price;
  subtitle?: string;
  badge?: string;
  rating?: number;
}

interface Props {
  className?: string;
  showCompare?: boolean;
  compareLabel?: string;
  compareParamName?: string;
  product: CardProduct;
}

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
        className="group flex cursor-pointer flex-col gap-2 rounded-xl ring-primary ring-offset-4 focus-visible:outline-0 focus-visible:ring-2 @md:rounded-2xl"
        href={href}
        id={id}
      >
        <div className="relative aspect-[5/6] overflow-hidden rounded-[inherit] bg-contrast-100">
          {image != null ? (
            <Image
              alt={image.alt}
              className="w-full scale-100 select-none bg-contrast-100 object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              fill
              sizes="(max-width: 768px) 70vw, 33vw"
              src={image.src}
            />
          ) : (
            <div className="pl-2 pt-3 text-7xl font-bold leading-[0.8] tracking-tighter text-contrast-300 transition-transform duration-500 ease-out group-hover:scale-105">
              {title}
            </div>
          )}
          {badge != null && badge !== '' && (
            <Badge className="absolute left-3 top-3" variant="rounded">
              {badge}
            </Badge>
          )}
        </div>
      </Link>

      <div className="mt-2 flex flex-col items-start gap-x-4 gap-y-3 px-1 @xs:mt-3 @2xl:flex-row">
        <div className="flex-1">
          <Link className="group text-base" href={href} tabIndex={-1}>
            <span className="block font-semibold">{title}</span>

            {subtitle != null && subtitle !== '' && (
              <span className="mb-2 block text-sm font-normal text-contrast-400">{subtitle}</span>
            )}
            {price != null && <PriceLabel price={price} />}
          </Link>
        </div>

        {showCompare && (
          <div className="mt-0.5 shrink-0">
            <Compare label={compareLabel} paramName={compareParamName} productId={id} />
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={clsx('animate-pulse', className)}>
      <div className="group flex cursor-pointer flex-col gap-2 rounded-xl ring-primary ring-offset-4 focus-visible:outline-0 focus-visible:ring-2 @md:rounded-2xl">
        <div className="relative aspect-[5/6] overflow-hidden rounded-[inherit] bg-contrast-100">
          <div className="w-full scale-100 select-none bg-contrast-100 object-cover transition-transform duration-500 ease-out group-hover:scale-110" />
        </div>
      </div>

      <div className="mt-2 flex flex-col items-start gap-x-4 gap-y-3 px-1 @xs:mt-3 @2xl:flex-row">
        <div className="flex-1">
          <div className="group flex flex-col text-base">
            <span className="inline-flex h-[1lh] items-center font-semibold">
              <span className="block h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
            </span>
            <span className="mb-2 inline-flex h-[1lh] items-center text-sm font-normal text-contrast-400">
              <span className="block h-[1ex] w-[8ch] rounded-sm bg-contrast-100" />
            </span>
            <span className="inline-flex h-[1lh] items-center font-semibold">
              <span className="block h-[1ex] w-[5ch] rounded-sm bg-contrast-100" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
