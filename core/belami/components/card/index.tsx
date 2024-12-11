import { clsx } from 'clsx';
import { ArrowUpRight } from 'lucide-react';
import { BcImage as Image } from '~/components/bc-image';

import { Link } from '~/components/link';

export type CardProps = {
  className?: string;
  title: string;
  image?: { src: string; alt: string };
  href: string;
  textContrast?: 'light' | 'dark';
};

export function Card({ className, title, image, href, textContrast = 'dark' }: CardProps) {
  return (
    <div className={className}>
      <Link
        className="group relative flex cursor-pointer flex-col gap-2 rounded-xl ring-primary ring-offset-4 focus-visible:outline-0 focus-visible:ring-2 @md:rounded-2xl"
        href={href}
      >
        <ArrowUpRight
          className={clsx(
            'absolute right-2.5 top-2.5 z-10 transition-transform duration-700 ease-out group-hover:-translate-y-1.5 group-hover:translate-x-1.5 @4xl:right-5 @4xl:top-5',
            textContrast === 'light' ? 'text-background' : 'text-foreground',
          )}
          strokeWidth={1.5}
        />
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
        </div>
        <span
          className={clsx(
            'line-clamp-1 text-lg font-medium text-foreground text-center',
            textContrast === 'light' ? '@4xl:text-background' : '@4xl:text-foreground',
          )}
        >
          {title}
        </span>
      </Link>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="relative flex aspect-[3/4] w-full animate-pulse flex-col gap-2 @4xl:min-w-72">
      {/* Image */}
      <div className="h-full w-full overflow-hidden rounded-lg bg-contrast-100 @4xl:rounded-xl" />
      {/* Title */}
      <div className="mb-1 line-clamp-1 h-6 w-20 rounded-lg bg-contrast-100 @4xl:absolute @4xl:bottom-5 @4xl:left-5" />
    </div>
  );
}
