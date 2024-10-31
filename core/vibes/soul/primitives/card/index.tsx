import { BcImage } from '~/components/bc-image';
import { Link } from '~/components/link';
import { ComponentPropsWithoutRef } from 'react';

import { clsx } from 'clsx';
import { ArrowUpRight } from 'lucide-react';

export interface CardProps {
  title: string;
  image: { src: string; alt: string };
  href: string;
  textContrast?: 'light' | 'dark';
}

export const Card = function Card({
  title,
  image,
  href,
  textContrast = 'dark',
  ...props
}: CardProps & ComponentPropsWithoutRef<'a'>) {
  return (
    <Link
      href={href}
      className="group relative flex aspect-[3/4] w-full min-w-56 max-w-md flex-col gap-2 rounded-lg ring-primary ring-offset-4 focus-visible:outline-0 focus-visible:ring-2 @4xl:min-w-72 @4xl:rounded-xl"
      {...props}
    >
      <ArrowUpRight
        strokeWidth={1.5}
        className={clsx(
          'absolute right-2.5 top-2.5 z-10 transition-transform duration-700 ease-out group-hover:-translate-y-1.5 group-hover:translate-x-1.5 @4xl:right-5 @4xl:top-5',
          textContrast === 'light' ? 'text-background' : 'text-foreground',
        )}
      />
      <div className="relative h-full w-full overflow-hidden rounded-lg @4xl:rounded-xl">
        <BcImage
          src={image.src}
          fill
          alt={image.alt}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="w-full scale-105 select-none bg-contrast-100 object-cover transition-transform duration-700 ease-out group-hover:scale-100"
        />
      </div>
      <span
        className={clsx(
          'line-clamp-1 text-lg font-medium text-foreground @4xl:absolute @4xl:bottom-5 @4xl:left-5',
          textContrast === 'light' ? '@4xl:text-background' : '@4xl:text-foreground',
        )}
      >
        {title}
      </span>
    </Link>
  );
};

export const CardSkeleton = function CardSkeleton() {
  return (
    <div className="relative flex aspect-[3/4] w-full min-w-56 max-w-md animate-pulse flex-col gap-2 @4xl:min-w-72">
      {/* Image */}
      <div className="h-full w-full overflow-hidden rounded-lg bg-contrast-100 @4xl:rounded-xl" />
      {/* Title */}
      <div className="mb-1 line-clamp-1 h-6 w-20 rounded-lg bg-contrast-100 @4xl:absolute @4xl:bottom-5 @4xl:left-5" />
    </div>
  );
};
