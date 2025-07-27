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
    <div>
      <Link href={`${href}`}>
        <div className="group relative h-48 w-full cursor-pointer overflow-hidden rounded-md shadow-md">
          {imageUrl ? (
            <img
              alt={`${title} brand image`}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              src={imageUrl}
            />
          ) : (
            <div className="h-full w-full" style={{ backgroundColor: '#304A7A' }} />
          )}

          <div className="absolute inset-0 bg-black bg-opacity-40 transition duration-300 group-hover:bg-opacity-50" />
          <div className="absolute bottom-4 left-4 z-10 text-white">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm">{productCount} products</p>
          </div>
        </div>
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
