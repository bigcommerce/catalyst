'use client';

import { cs } from '@bigcommerce/reactant/cs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import client from '~/client';
import { createUrl } from '~/utils';

const ThumbnailImage = ({
  active,
  ...props
}: {
  active?: boolean;
} & React.ComponentProps<typeof Image>) => {
  const scrollTargetElementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (active) {
      scrollTargetElementRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [active]);

  return (
    <div className="aspect-square h-full w-full" ref={scrollTargetElementRef}>
      <div
        className={cs(
          'flex items-center justify-center border-2 hover:border-blue-primary',
          active && 'border-blue-primary',
        )}
      >
        {props.src ? <Image className={cs('h-full w-full object-contain')} {...props} /> : null}
      </div>
    </div>
  );
};

interface Props {
  images: NonNullable<Awaited<ReturnType<typeof client.getProduct>>>['images'];
}

export const Gallery = ({ images }: Props) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const imageSearchParam = searchParams.get('image');

  const defaultImageIndex = images.findIndex((image) => image.isDefault);

  let imageIndex = imageSearchParam ? Number(imageSearchParam) : defaultImageIndex;

  imageIndex = imageIndex < images.length && imageIndex >= 0 ? imageIndex : 0;

  const nextSearchParams = new URLSearchParams(searchParams.toString());
  const nextImageIndex = imageIndex + 1 < images.length ? imageIndex + 1 : 0;

  nextSearchParams.set('image', nextImageIndex.toString());

  const nextUrl = createUrl(pathname, nextSearchParams);

  const previousSearchParams = new URLSearchParams(searchParams.toString());
  const previousImageIndex = imageIndex === 0 ? images.length - 1 : imageIndex - 1;

  previousSearchParams.set('image', previousImageIndex.toString());

  const previousUrl = createUrl(pathname, previousSearchParams);

  return (
    <div className="-mx-6 mb-10 sm:-mx-0 md:mb-12">
      <div className="lg:sticky lg:top-0">
        <div className="relative aspect-square h-full max-h-[548px] w-full">
          {images[imageIndex] && (
            <Image
              alt={images[imageIndex]?.altText ?? ''}
              className="h-full w-full object-contain"
              fill
              priority={true}
              sizes="(min-width: 1024px) 50vw, 100vw"
              src={images[imageIndex]?.url ?? ''}
            />
          )}

          {images.length > 1 && (
            <div className="absolute top-1/2 flex w-full -translate-y-1/2 justify-between px-5 sm:px-0">
              <Link
                aria-label="Previous product image"
                className="focus:ring-primary-blue/20 focus:outline-none focus:ring-4"
                href={previousUrl}
                scroll={false}
              >
                <ChevronLeft />
              </Link>
              <Link
                aria-label="Next product image"
                className="focus:ring-primary-blue/20 focus:outline-none focus:ring-4"
                href={nextUrl}
                scroll={false}
              >
                <ChevronRight />
              </Link>
            </div>
          )}
        </div>

        {images.length > 1 && (
          <ul className="mt-3 flex w-full flex-nowrap items-center gap-4 overflow-x-auto px-6 py-1 sm:-mx-1 sm:px-1 md:mt-5 md:gap-6">
            {images.map((image, index) => {
              const isActive = index === imageIndex;
              const imageSearchParams = new URLSearchParams(searchParams.toString());

              imageSearchParams.set('image', index.toString());

              return (
                <li className="h-24 w-24" key={image.url}>
                  <Link
                    aria-label="Enlarge product image"
                    className="focus:ring-primary-blue/20 inline-block h-full w-full focus:outline-none focus:ring-4"
                    href={createUrl(pathname, imageSearchParams)}
                    scroll={false}
                  >
                    <ThumbnailImage
                      active={isActive}
                      alt={image.altText}
                      height={94}
                      src={image.url}
                      width={94}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};
