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
  description: string;
  href: string;
  image?: { src: string; alt: string };
  categories: string[];
  price?: Price;
  subtitle?: string;
  badge?: string;
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
  showButton?: boolean;
  onClick?: () => void;
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
 * }
 * ```
 */

const DEFAULT_PRODUCT_IMAGE_URL =
  'https://betterineraction.nyc3.cdn.digitaloceanspaces.com/product-placeholder.svg';

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
  showButton = false,
}: ProductCardProps) {
  return (
    <article
      className={clsx(
        'group flex min-w-0 max-w-md flex-col gap-2 overflow-hidden border font-[family-name:var(--card-font-family,var(--font-family-body))] shadow-lg @container',
        className,
      )}
    >
      <div className="relative">
        <div
          className={clsx(
            'relative overflow-hidden rounded-xl @md:rounded-2xl',
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
                'w-full scale-100 select-none object-fill transition-transform duration-500 ease-out group-hover:scale-110',
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
            <Image
              alt={`${title} image`}
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
              src={DEFAULT_PRODUCT_IMAGE_URL}
            />
            // <div
            //   className={clsx(
            //     'break-words pl-5 pt-5 text-4xl font-bold leading-[0.8] tracking-tighter opacity-25 transition-transform duration-500 ease-out group-hover:scale-105 @xs:text-7xl',
            //     {
            //       light: 'text-[var(--product-card-light-title,hsl(var(--foreground)))]',
            //       dark: 'text-[var(--product-card-dark-title,hsl(var(--background)))]',
            //     }[colorScheme],
            //   )}
            // >
            //   {title}
            // </div>
          )}
          {badge != null && badge !== '' && (
            <Badge className="absolute left-3 top-3" shape="rounded">
              {badge}
            </Badge>
          )}
        </div>

        <div className="mx-4 mb-2 mt-2 flex flex-col items-start gap-x-4 gap-y-3 px-1 @xs:mt-3 @2xl:flex-row">
          <div className="flex-1 text-sm @[16rem]:text-base">
            <span
              className={clsx(
                'line-clamp-2 block break-words font-semibold',
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
            {price != null && <PriceLabel colorScheme={colorScheme} price={price} />}
          </div>
        </div>
        {showButton && (
          <div className="mt-auto p-4 pt-0">
            <button
              className={clsx(
                'relative w-full rounded bg-gray-900 py-2 text-center text-white transition hover:bg-gray-800',
              )}
              type="button"
              tabIndex={-1}
              aria-disabled="true"
            >
              Shop Now →
            </button>
          </div>
        )}
        <Link
          aria-label={title}
          className={clsx(
            'absolute inset-0 rounded-b-lg rounded-t-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--product-card-focus,hsl(var(--primary)))] focus-visible:ring-offset-4',
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
      {showCompare && (
        <div className="mt-0.5 shrink-0">
          <Compare
            colorScheme={colorScheme}
            label={compareLabel}
            paramName={compareParamName}
            product={{ id, title, href, image }}
          />
        </div>
      )}
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
