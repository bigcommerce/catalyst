import clsx from 'clsx';
import { JSX, Suspense } from 'react';
import { Link } from '~/components/link';

interface BrandProps {
  name: string;
  href: string;
  title: string;
  productCount: string;
  imageUrl?: string;
}

export function BrandCard({ imageUrl, title, productCount, href }: BrandProps): JSX.Element {
  return (
    <div className="flex w-full flex-col items-center">
      <Link href={href} className="w-full">
        <div className="flex h-40 w-full items-center justify-center rounded-lg bg-white shadow-md">
          {imageUrl ? (
            <img alt={`${title} brand image`} className="h-24 w-24 object-contain" src={imageUrl} />
          ) : (
            <div className="h-24 w-24 rounded bg-blue-900" />
          )}
        </div>
        <h3 className="mt-4 text-left text-base font-semibold text-gray-900">{title}</h3>
        <p className="text-left text-sm text-gray-500">{productCount} products</p>
      </Link>
    </div>
  );
}

export function BrandCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={clsx(
        'group relative h-48 w-full max-w-md animate-pulse overflow-hidden rounded-md shadow-md',
        className,
      )}
    >
      {/* Image Placeholder */}
      <div className="absolute inset-0 bg-contrast-100" />
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      {/* Text Skeleton */}
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
        <div className="h-6 w-32 rounded bg-contrast-200" /> {/* Title */}
        <div className="h-4 w-24 rounded bg-contrast-200" /> {/* Product count */}
      </div>
    </div>
  );
}
