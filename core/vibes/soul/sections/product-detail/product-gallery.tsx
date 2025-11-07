'use client';

import { clsx } from 'clsx';
import useEmblaCarousel from 'embla-carousel-react';
import { useEffect, useState, useRef, useCallback } from 'react';

import { Image } from '~/components/image';

interface Props {
  images: Array<{ alt: string; src: string }>;
  className?: string;
  thumbnailLabel?: string;
  productName: string;
}

export function ProductGallery({
  images,
  className,
  thumbnailLabel = 'View image number',
  productName,
}: Props) {
  const [previewImage, setPreviewImage] = useState(0);
  const [emblaRef, emblaApi] = useEmblaCarousel();
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setPreviewImage(emblaApi.selectedScrollSnap());

    emblaApi.on('select', onSelect);

    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  const selectImage = (index: number) => {
    setPreviewImage(index);
    if (emblaApi) emblaApi.scrollTo(index);
  };

  // Throttle mouse move updates for better performance (~60fps)
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;

    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMousePosition({ x, y });
  }, []);

  return (
    <div className={clsx('sticky top-4 flex flex-col gap-2 @2xl:flex-row', className)}>
      <div
        className="w-full overflow-hidden rounded-xl @xl:rounded-2xl @2xl:order-2"
        ref={emblaRef}
      >
        <div className="flex">
          {images.map((image, idx) => (
            <div
              className="relative aspect-square w-full shrink-0 grow-0 basis-full cursor-zoom-in"
              key={idx}
              ref={idx === previewImage ? imageContainerRef : null}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              role="img"
              aria-label={`${image.alt || `${productName} image ${idx + 1}`} - Hover to zoom`}
            >
              <Image
                alt={image.alt || `${productName} image ${idx + 1}`}
                className={clsx(
                  'object-contain transition-transform duration-200',
                  isZoomed && idx === previewImage ? 'scale-150' : 'scale-100'
                )}
                fill
                priority={idx === 0}
                sizes="(min-width: 42rem) 50vw, 100vw"
                src={image.src}
                style={
                  isZoomed && idx === previewImage
                    ? {
                        transformOrigin: `${mousePosition.x}% ${mousePosition.y}%`,
                      }
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      </div>
      <div className="flex max-w-full shrink-0 flex-row gap-2 overflow-x-auto @2xl:order-1 @2xl:flex-col">
        {images.map((image, index) => (
          <button
            aria-label={`${thumbnailLabel} ${index + 1}`}
            className={clsx(
              'relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border transition-all duration-300 hover:opacity-100 @md:h-16 @md:w-16',
              index === previewImage
                ? 'border-foreground opacity-100'
                : 'border-transparent opacity-50',
            )}
            key={index}
            onClick={() => selectImage(index)}
          >
            <Image
              alt={image.alt || `${productName} image ${index + 1}`}
              className="bg-contrast-100 object-contain"
              fill
              priority={index === 0}
              sizes="(min-width: 28rem) 4rem, 3rem"
              src={image.src}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
