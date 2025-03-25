import { clsx } from 'clsx';

import { Badge } from '@/vibes/soul/primitives/badge';
import { Price, PriceLabel } from '@/vibes/soul/primitives/price-label';
import * as Skeleton from '@/vibes/soul/primitives/skeleton';
import { Image } from '~/components/image';
import { Link } from '~/components/link';

import { Compare } from './compare';

export interface Product {
  id: string;
  title: string;
  href: string;
  image?: { src: string; alt: string };
  price?: Price;
  subtitle?: string;
  badge?: string;
  rating?: number;
}

export interface ProductCardProps {
  className?: string;
  colorScheme?: 'light' | 'dark';
  aspectRatio?: '5:6' | '3:4' | '1:1';
  showCompare?: boolean;
  imagePriority?: boolean;
  imageSizes?: string;
  compareLabel?: string;
  compareParamName?: string;
  product: Product;
}

// eslint-disable-next-line valid-jsdoc
/**
 * This component supports various CSS variables for theming. Here's a comprehensive list, along
 * with their default values:
 *
 * ```css
 * :root {
 *   --product-card-focus: hsl(var(--primary));
 *   --product-card-light-offset: hsl(var(--background));
 *   --product-card-light-background: hsl(var(--contrast-100));
 *   --product-card-light-title: hsl(var(--foreground));
 *   --product-card-light-subtitle: hsl(var(--foreground) / 75%);
 *   --product-card-dark-offset: hsl(var(--foreground));
 *   --product-card-dark-background: hsl(var(--contrast-500));
 *   --product-card-dark-title: hsl(var(--background));
 *   --product-card-dark-subtitle: hsl(var(--background) / 75%);
 *   --product-card-font-family: var(--font-family-body);
 *   --product-card-border-radius: 1rem;
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
}: ProductCardProps) {
  return (
    <article
      className={clsx(
        'group w-full max-w-md font-[family-name:var(--product-card-font-family,var(--font-family-body))] @container',
        className,
      )}
    >
      <div className="relative">
        <div className="relative">
          <div
            className={clsx(
              'relative overflow-hidden rounded-[var(--product-card-border-radius,1rem)]',
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
              <Badge className="absolute left-3 top-3" shape="rounded">
                {badge}
              </Badge>
            )}
          </div>
          <Link
            aria-label={title}
            className={clsx(
              'absolute inset-0 rounded-[var(--product-card-border-radius,1rem)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--product-card-focus,hsl(var(--primary)))] focus-visible:ring-offset-4',
              {
                light: 'ring-offset-[var(--product-card-light-offset,hsl(var(--background)))]',
                dark: 'ring-offset-[var(--product-card-dark-offset,hsl(var(--foreground)))]',
              }[colorScheme],
            )}
            href={href}
            id={id}
          >
            <span className="sr-only">View product</span>
          </Link>
        </div>
        <div className="mt-2 flex flex-col items-start gap-x-4 gap-y-3 px-1 @xs:mt-3 @xs:flex-row">
          <div className="relative flex-1 text-sm @[16rem]:text-base">
            <h3
              className={clsx(
                'block font-semibold',
                {
                  light: 'text-[var(--product-card-light-title,hsl(var(--foreground)))]',
                  dark: 'text-[var(--product-card-dark-title,hsl(var(--background)))]',
                }[colorScheme],
              )}
            >
              {title}
            </h3>

            {subtitle != null && subtitle !== '' && (
              <span
                className={clsx(
                  'block text-sm font-normal',
                  {
                    light: 'text-[var(--product-card-light-subtitle,hsl(var(--foreground)/75%))]',
                    dark: 'text-[var(--product-card-dark-subtitle,hsl(var(--background)/75%))]',
                  }[colorScheme],
                )}
              >
                {subtitle}
              </span>
            )}
            {price != null && (
              <PriceLabel className="mt-2" colorScheme={colorScheme} price={price} />
            )}
            <Link
              aria-label={title}
              className={clsx(
                'absolute inset-0 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--product-card-focus,hsl(var(--primary)))] focus-visible:ring-offset-4',
                {
                  light: 'ring-offset-[var(--product-card-light-offset,hsl(var(--background)))]',
                  dark: 'ring-offset-[var(--product-card-dark-offset,hsl(var(--foreground)))]',
                }[colorScheme],
              )}
              href={href}
              id={id}
              tabIndex={-1}
            >
              <span className="sr-only">View product</span>
            </Link>
          </div>
          {showCompare && (
            <div className="shrink-0">
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
    </article>
  );
}

export function ProductCardSkeleton({
  className,
  aspectRatio = '5:6',
}: Pick<ProductCardProps, 'className' | 'aspectRatio'>) {
  return (
    <Skeleton.Root className={clsx(className)}>
      <Skeleton.Box
        className={clsx(
          'rounded-[var(--product-card-border-radius,1rem)]',
          {
            '5:6': 'aspect-[5/6]',
            '3:4': 'aspect-[3/4]',
            '1:1': 'aspect-square',
          }[aspectRatio],
        )}
      />
      <div className="mt-2 flex flex-col items-start gap-x-4 gap-y-3 px-1 @xs:mt-3 @xs:flex-row">
        <div className="flex-1 text-sm @[16rem]:text-base">
          <Skeleton.Text characterCount={10} className="rounded" />
          <Skeleton.Text characterCount={8} className="rounded" />
          <Skeleton.Text characterCount={6} className="rounded" />
        </div>
      </div>
    </Skeleton.Root>
  );
}
