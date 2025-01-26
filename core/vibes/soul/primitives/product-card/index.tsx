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
  image?: { src: string; alt: string, blurDataURL?: string };
  price?: Price;
  subtitle?: string;
  badge?: string;
  rating?: number;
}

interface Props {
  className?: string;
  colorScheme?: 'light' | 'dark';
  aspectRatio?: '5:6' | '3:4' | '1:1';
  showCompare?: boolean;
  imagePriority?: boolean;
  imageSizes?: string;
  compareLabel?: string;
  compareParamName?: string;
  product: CardProduct;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --product-card-focus: hsl(var(--primary));
 *   --product-card-border-radius: 1rem;
 *   --product-card-light-background: hsl(var(--contrast-100));
 *   --product-card-light-title: hsl(var(--foreground));
 *   --product-card-light-subtitle: hsl(var(--foreground) / 75%);
 *   --product-card-dark-background: hsl(var(--contrast-500));
 *   --product-card-dark-title: hsl(var(--background));
 *   --product-card-dark-subtitle: hsl(var(--background) / 75%);
 * }
 * ```
 */
export function ProductCard({
  product: { id, title, subtitle, badge, price, image, href },
  colorScheme = 'light',
  className,
  showCompare = false,
  aspectRatio = '5:6',
  compareLabel,
  compareParamName,
  imagePriority = false,
  imageSizes = '(min-width: 80rem) 20vw, (min-width: 64rem) 25vw, (min-width: 42rem) 33vw, (min-width: 24rem) 50vw, 100vw',
}: Props) {
  return (
    <div className={clsx('@container', className)}>
      <Link
        aria-label={title}
        className="group flex cursor-pointer flex-col gap-2 rounded-[var(--product-card-border-radius,1rem)] ring-[var(--product-card-focus,hsl(var(--primary)))] ring-offset-4 focus-visible:outline-0 focus-visible:ring-2"
        href={href}
        id={id}
      >
        <div
          className={clsx(
            'relative overflow-hidden rounded-[inherit]',
            {
              '5:6': 'aspect-[5/6]',
              '3:4': 'aspect-[3/4]',
              '1:1': 'aspect-square',
            }[aspectRatio],
            {
              light: 'bg-[var(--product-card-light-background,hsl(var(--contrast-100)))]',
              dark: 'bg-[var(--product-card-dark-background,hsl(var(--contrast-500)))]',
            }[colorScheme],
          )}
        >
          {image != null ? (
            <Image
              alt={image.alt}
              className={clsx(
              'w-full scale-100 select-none object-cover transition-transform duration-500 ease-out group-hover:scale-110',
              {
                light: 'bg-[var(--product-card-light-background,hsl(var(--contrast-100))]',
                dark: 'bg-[var(--product-card-dark-background,hsl(var(--contrast-500))]',
              }[colorScheme],
            )}
            fill
            priority={imagePriority}
              sizes={imageSizes}
              src={image.src}
              placeholder={image.blurDataURL ? 'blur' : 'empty'}
              blurDataURL={image.blurDataURL}
            />
          ) : (
            <div
              className={clsx(
                'break-words pl-5 pt-5 text-4xl font-bold leading-[0.8] tracking-tighter opacity-25 transition-transform duration-500 ease-out group-hover:scale-105 @xs:text-7xl',
                {
                  light: 'text-[var(--product-card-light-title,hsl(var(--foreground)))]',
                  dark: 'text-[var(--product-card-dark-title,hsl(var(--background)))]',
                }[colorScheme],
              )}
            >
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
            <span
              className={clsx(
                'block font-semibold',
                {
                  light: 'text-[var(--product-card-light-title,hsl(var(--foreground)))]',
                  dark: 'text-[var(--product-card-dark-title,hsl(var(--background)))]',
                }[colorScheme],
              )}
            >
              {title}
            </span>

            {subtitle != null && subtitle !== '' && (
              <span
                className={clsx(
                  'mb-2 block text-sm font-normal',
                  {
                    light: 'text-[var(--product-card-light-subtitle,hsl(var(--foreground)/75%))]',
                    dark: 'text-[var(--product-card-dark-subtitle,hsl(var(--background)/75%))]',
                  }[colorScheme],
                )}
              >
                {subtitle}
              </span>
            )}
            {price != null && <PriceLabel colorScheme={colorScheme} price={price} />}
          </Link>
        </div>

        {showCompare && (
          <div className="mt-0.5 shrink-0">
            <Compare
              colorScheme={colorScheme}
              label={compareLabel}
              paramName={compareParamName}
              productId={id}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={className}>
      <div className="flex aspect-[5/6] flex-col gap-2 rounded-xl bg-contrast-100 @md:rounded-2xl" />
      <div className="mt-2 flex flex-col items-start gap-x-4 gap-y-3 px-1 @xs:mt-3 @2xl:flex-row">
        <div className="flex-1">
          <div className="flex flex-col text-base">
            <div className="flex h-[1lh] items-center">
              <span className="block h-[1ex] w-[10ch] rounded-sm bg-contrast-100" />
            </div>
            <div className="mb-2 flex h-[1lh] items-center text-sm font-normal text-contrast-400">
              <span className="block h-[1ex] w-[8ch] rounded-sm bg-contrast-100" />
            </div>
            <div className="flex h-[1lh] items-center">
              <span className="block h-[1ex] w-[5ch] rounded-sm bg-contrast-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
