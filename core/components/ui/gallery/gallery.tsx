import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  ComponentPropsWithoutRef,
  ComponentPropsWithRef,
  ElementRef,
  forwardRef,
  useEffect,
  useState,
} from 'react';
import { BcImage } from '~/components/bc-image';

import { cn } from '~/lib/utils';

interface Image {
  url: string;
  altText: string;
}

const GalleryPreviousIndicator = ({
  children,
  className,
  onClick,
  ...props
}: ComponentPropsWithoutRef<'button'>) => {
  return (
    <button
      aria-label="Previous product image"
      className={cn(
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
        className,
      )}
      onClick={(e) => {
        if (onClick) {
          onClick(e);
        }
      }}
      {...props}
    >
      {children || <ChevronLeft />}
    </button>
  );
};

const GalleryNextIndicator = ({
  children,
  className,
  onClick,
  ...props
}: ComponentPropsWithoutRef<'button'>) => {
  return (
    <button
      aria-label="Next product image"
      className={cn(
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20',
        className,
      )}
      onClick={(e) => {
        if (onClick) {
          onClick(e);
        }
      }}
      {...props}
    >
      {children || <ChevronRight />}
    </button>
  );
};

interface GalleryProps extends ComponentPropsWithoutRef<'div'> {
  images: Image[] | [];
  defaultImageIndex?: number;
  noImageText?: string;
}

export const Gallery = ({
  className,
  children,
  images,
  defaultImageIndex = 0,
  noImageText,
  ...props
}: GalleryProps) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(defaultImageIndex);

  useEffect(() => {
    setSelectedImageIndex(defaultImageIndex);
  }, [defaultImageIndex]);

  const selectedImage = images.length > 0 ? images[selectedImageIndex] : undefined;

  return (
    <div aria-live="polite" className={className} {...props}>
      <figure className="relative aspect-square h-full max-h-[548px] w-full">
        {selectedImage ? (
          <BcImage
            alt={selectedImage.altText}
            className="h-full w-full object-contain"
            fill
            priority={true}
            sizes="(min-width: 1024px) 50vw, 100vw"
            src={selectedImage.url}
          />
        ) : (
          <div className="flex aspect-square items-center justify-center bg-gray-200">
            <div className="text-base font-semibold text-gray-500">
              {noImageText ?? 'Coming soon'}
            </div>
          </div>
        )}
        {images.length > 1 && (
          <div className="absolute top-1/2 flex w-full -translate-y-1/2 justify-between px-5 sm:px-0">
            <GalleryPreviousIndicator
              onClick={() =>
                setSelectedImageIndex((prev) => {
                  if (prev === 0) {
                    return images.length - 1;
                  }
                  return prev - 1;
                })
              }
            />
            <GalleryNextIndicator
              onClick={() =>
                setSelectedImageIndex((prev) => {
                  if (prev === images.length - 1) {
                    return 0;
                  }
                  return prev + 1;
                })
              }
            />
          </div>
        )}
      </figure>
      <nav
        aria-label="Thumbnail navigation"
        className="mt-3 flex w-full flex-wrap items-center gap-4 px-1 py-1 md:mt-5 md:gap-6"
      >
        {images.map((image, index) => {
          return (
            <button
              aria-label="Enlarge product image"
              aria-pressed={selectedImageIndex === index}
              className="inline-block h-12 w-12 flex-shrink-0 flex-grow-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 md:h-24 md:w-24"
              onClick={(e) => {
                setSelectedImageIndex(index);
              }}
              type="button"
            >
              <div
                className={cn(
                  'flex cursor-pointer items-center justify-center border-2 hover:border-primary',
                  selectedImageIndex === index && 'border-primary',
                  'h-full w-full object-contain',
                )}
              >
                <BcImage
                  alt={image.altText}
                  priority={true}
                  src={image.url}
                  height={94}
                  width={94}
                />
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
