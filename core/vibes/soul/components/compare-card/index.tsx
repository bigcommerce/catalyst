import { clsx } from 'clsx';
import Image from 'next/image';
import { ComponentPropsWithoutRef } from 'react';

import { Badge } from '@/vibes/soul/components/badge';
import { Button } from '@/vibes/soul/components/button';
import { Label } from '@/vibes/soul/components/label';
import { Price, ProductPrice } from '@/vibes/soul/components/product-card/price';
import { Rating } from '@/vibes/soul/components/rating';
import { Link } from '~/components/link';

interface Image {
  altText: string;
  src: string;
}

export interface Product {
  id: string;
  name: string;
  href: string;
  image?: Image;
  price?: ProductPrice;
  subtitle?: string;
  badge?: string;
  description?: string;
  rating?: number;
  availability?: string;
  className?: string;
}

export const CompareCard = function CompareCard({
  id,
  name,
  href,
  image,
  price,
  subtitle,
  badge,
  description,
  rating,
  availability,
  className,
}: Product & ComponentPropsWithoutRef<'a'>) {
  return (
    <Link
      className={clsx(
        'flex max-w-lg flex-col gap-2 rounded-xl text-foreground ring-primary ring-offset-4 focus-visible:outline-0 focus-visible:ring-2 @5xl:w-96',
        className,
      )}
      href={href}
      id={id}
    >
      <div className="relative aspect-[5/6] overflow-hidden rounded-xl">
        {badge != null && badge !== '' && (
          <Badge className="absolute left-2.5 top-2.5 @4xl:left-4 @4xl:top-4">{badge}</Badge>
        )}
        {image?.src != null && image.src !== '' && (
          <Image
            alt={image.altText}
            className="w-full select-none bg-contrast-100 object-cover transition-transform duration-300 ease-in-out"
            fill
            sizes="(max-width: 768px) 90vw, 512vw"
            src={image.src}
          />
        )}
      </div>
      <div className="mb-2 flex flex-col gap-1">
        <h3 className="flex flex-col flex-wrap justify-between gap-1 text-sm font-semibold @sm:pt-3 @4xl:flex-row">
          <span className="line-clamp-2">{name}</span>
          {subtitle != null && subtitle !== '' && (
            <span className="font-normal text-contrast-400">{subtitle}</span>
          )}
        </h3>
        {price != null && price !== '' && <Price price={price} />}
      </div>
      <Button className="mb-8 w-full">Add to Cart</Button>
      <hr className="mb-4" />

      {description != null && description !== '' && (
        <>
          <Label className="mb-3">Description</Label>
          <p className="mb-4">{description}</p>
          <hr className="mb-4" />
        </>
      )}
      {rating != null && (
        <>
          <Label className="mb-3">Rating</Label>
          <Rating className="mb-8" rating={rating} />
          <hr className="mb-4" />
        </>
      )}
      {availability != null && availability !== '' && (
        <>
          <Label className="mb-3">Availability</Label>
          <p className="mb-8">{availability}</p>
        </>
      )}
    </Link>
  );
};

interface CompareCardSkeletonProps {
  className?: string;
}

export const CompareCardSkeleton = function CompareCardSkeleton({
  className,
}: CompareCardSkeletonProps) {
  return (
    <div className={clsx('animate-pulse cursor-pointer rounded-xl', className)}>
      {/* Image */}
      <div className="relative aspect-[5/6] overflow-hidden rounded-xl bg-contrast-100 @6xl:min-w-80" />
      <div className="flex flex-col gap-2 @sm:gap-2">
        <h3 className="mt-4 flex flex-col flex-wrap justify-between gap-2 @sm:mt-7 @sm:gap-2 @4xl:flex-row">
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
