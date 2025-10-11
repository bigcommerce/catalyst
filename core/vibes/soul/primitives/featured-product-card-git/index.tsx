import clsx from 'clsx';
import React from 'react';

import { Image } from '~/components/image';
import { Link } from '~/components/link';

// Helper to strip HTML tags and truncate text
function truncateHtmlText(html: string, maxLength: number): string {
  if (!html) return '';
  // Create a temporary element to parse HTML
  const tempDiv =
    typeof window !== 'undefined' ? document.createElement('div') : { innerHTML: html };
  if (typeof window !== 'undefined') tempDiv.innerHTML = html;
  // Get the text content
  const text = (tempDiv as any).textContent || '';
  // Truncate and escape
  let truncated = text.slice(0, maxLength);
  if (text.length > maxLength) truncated += '...';
  // Escape for HTML
  return truncated.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

interface ProductCardProps {
  className?: string;
  image?: { src: string; alt: string };
  name: string;
  price?: string;
  salePrice?: string;
  aspectRatio?: '5:6' | '3:4' | '1:1';
  imagePriority?: boolean;
  imageSizes?: string;
  href: string;
  description?: string;
  categories: string[];
  id: string;
  titleExcerptLength: number;
  descriptionExcerptLength: number;
}

const DEFAULT_PRODUCT_IMAGE_URL =
  'https://betterineraction.nyc3.cdn.digitaloceanspaces.com/product-placeholder.svg';

export const FeaturedProductCard = ({
  className,
  image,
  name,
  price,
  salePrice,
  aspectRatio = '5:6',
  imagePriority = false,
  description = '',
  categories = [],
  imageSizes = '(min-width: 80rem) 20vw, (min-width: 64rem) 25vw, (min-width: 42rem) 33vw, (min-width: 24rem) 50vw, 100vw',
  id,
  href,
  titleExcerptLength,
  descriptionExcerptLength,
}: ProductCardProps) => {
  return (
    <Link href={href} id={id}>
      <div
        className={clsx(
          'flex h-full max-w-xl flex-col overflow-hidden rounded-lg bg-white shadow-lg',
          className,
        )}
      >
        <div
          className={clsx(
            'relative overflow-hidden rounded-xl bg-[var(--product-card-light-background,hsl(var(--contrast-100)))] @md:rounded-2xl',
            {
              '5:6': 'aspect-[5/6]',
              '3:4': 'aspect-[3/4]',
              '1:1': 'aspect-square',
            }[aspectRatio],
          )}
        >
          {image != null ? (
            <Image
              alt={image.alt}
              className={clsx(
                'bg-[var(--product-card-light-background,hsl(var(--contrast-100))] w-full scale-100 select-none object-cover transition-transform duration-500 ease-out group-hover:scale-110',
              )}
              fill
              priority={imagePriority}
              sizes={imageSizes}
              src={image.src}
            />
          ) : (
            <Image
              alt={`${name} image`}
              className={clsx(
                'bg-[var(--product-card-light-background,hsl(var(--contrast-100))] w-full scale-100 select-none object-cover transition-transform duration-500 ease-out group-hover:scale-110',
              )}
              fill
              priority={imagePriority}
              sizes={imageSizes}
              src={DEFAULT_PRODUCT_IMAGE_URL}
            />
            // <div
            //   className={clsx(
            //     'break-words pl-5 pt-5 text-4xl font-bold leading-[0.8] tracking-tighter text-[var(--product-card-light-title,hsl(var(--foreground)))] opacity-25 transition-transform duration-500 ease-out group-hover:scale-105 @xs:text-7xl',
            //   )}
            // >
            //   {name}
            // </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-4">
          <p className="mb-1 text-lg font-bold text-gray-800">
            {name.length > titleExcerptLength ? name.slice(0, titleExcerptLength) + '...' : name}
          </p>
          <p className="mb-1 mt-0.5 text-sm font-normal text-gray-500">
            <span
              dangerouslySetInnerHTML={{
                __html: truncateHtmlText(description, descriptionExcerptLength),
              }}
            />
          </p>

          <div className="mt-auto">
            <div className="grid-gap-2 grid grid-cols-2">
              <div>
                {salePrice ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{salePrice}</span>
                    <span className="text-black line-through">{price}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{price}</span>
                  </div>
                )}
              </div>
              {/* <div>
                <p className="text-sm font-normal text-gray-500">
                  {categories.length > 0 ? categories[0] : ''}
                </p>
              </div> */}
            </div>

            <Link
              aria-label={name}
              className={clsx(
                'relative mt-4 block w-full rounded bg-gray-900 py-2 text-center text-white transition hover:bg-gray-800',
              )}
              href={href}
              id={id}
            >
              Shop Now →
            </Link>
          </div>
        </div>
      </div>
    </Link>
  );
};
