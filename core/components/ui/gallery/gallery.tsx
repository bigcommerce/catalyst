import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

import { BcImage } from '~/components/bc-image';
import { cn } from '~/lib/utils';

interface Image {
  altText: string;
  src: string;
}

interface Props {
  className?: string;
  defaultImageIndex?: number;
  images: Image[];
}

const Gallery = ({ className, images, defaultImageIndex = 0 }: Props) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(defaultImageIndex);

  const selectedImage = images.length > 0 ? images[selectedImageIndex] : undefined;

  return (
    <div aria-live="polite" className={className}>
      <figure className="relative aspect-square h-full max-h-[548px] w-full">
        {selectedImage ? (
          <BcImage
            alt={selectedImage.altText}
            className="h-full w-full object-contain"
            fill
            priority={true}
            sizes="(min-width: 1024px) 50vw, 100vw"
            src={selectedImage.src}
          />
        ) : (
          <div className="flex aspect-square items-center justify-center bg-gray-200">
            <div className="text-base font-semibold text-gray-500">Coming soon</div>
          </div>
        )}
        {images.length > 1 && (
          <div className="absolute top-1/2 flex w-full -translate-y-1/2 justify-between px-5 sm:px-0">
            <button
              aria-label="Previous product image"
              className="focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              onClick={() =>
                setSelectedImageIndex((prev) => {
                  if (prev === 0) {
                    return images.length - 1;
                  }

                  return prev - 1;
                })
              }
            >
              <ChevronLeft />
            </button>
            <button
              aria-label="Next product image"
              className="focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
              onClick={() =>
                setSelectedImageIndex((prev) => {
                  if (prev === images.length - 1) {
                    return 0;
                  }

                  return prev + 1;
                })
              }
            >
              <ChevronRight />
            </button>
          </div>
        )}
      </figure>
      <nav
        aria-label="Thumbnail navigation"
        className="mt-3 flex w-full flex-wrap items-center gap-4 px-6 py-1 sm:px-1 md:mt-5 md:gap-6"
      >
        {images.map((image, index) => {
          const isActive = selectedImageIndex === index;

          return (
            <button
              aria-label="Enlarge product image"
              aria-pressed={isActive}
              className="inline-block h-12 w-12 flex-shrink-0 flex-grow-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 md:h-24 md:w-24"
              key={image.src}
              onClick={() => {
                setSelectedImageIndex(index);
              }}
            >
              <BcImage
                alt={image.altText}
                className={cn(
                  'flex h-full w-full cursor-pointer items-center justify-center border-2 object-contain hover:border-primary',
                  isActive && 'border-primary',
                )}
                height={94}
                priority={true}
                src={image.src}
                width={94}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export { Gallery };
