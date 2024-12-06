import { useState, useRef, useEffect, useMemo } from 'react';
import { BcImage } from '~/components/bc-image';
import { cn } from '~/lib/utils';
import { GalleryModel } from './belami-gallery-view-all-model-pdp';
import { Banner } from './belami-banner-pdp';
import { imageManagerImageUrl } from '~/lib/store-assets';
import ProductImage from './product-zoom';

interface Image {
  altText: string;
  src: string;
}

interface Props {
  className?: string;
  defaultImageIndex?: number;
  images: Image[];
  bannerIcon: string;
  galleryExpandIcon: string;
  productMpn?: string | null;
}

const Gallery = ({
  className,
  images,
  defaultImageIndex = 0,
  bannerIcon,
  galleryExpandIcon,
  productMpn,
}: Props) => {
  if (!images || images.length === 0) return null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(defaultImageIndex);
  const [viewAll, setViewAll] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  // Filter images based on MPN match
  const filteredImages = useMemo(() => {
    if (!productMpn) {
      return images;
    }
    const matchingImages = images.filter((image) =>
      image.altText.toLowerCase().includes(productMpn.toLowerCase()),
    );
    return matchingImages.length > 0 ? matchingImages : images;
  }, [images, productMpn]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [filteredImages]);

  const selectedImage = filteredImages[selectedImageIndex];
  if (!selectedImage) return null;

  const remainingImagesCount = filteredImages.length - 4;

  const openPopup = (index?: number) => {
    if (index !== undefined) setSelectedImageIndex(index);
    setViewAll(true);
  };

  const closePopup = () => {
    setViewAll(false);
  };

  const handleNextImage = () => {
    setSelectedImageIndex((selectedImageIndex + 1) % filteredImages.length);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((selectedImageIndex - 1 + filteredImages.length) % filteredImages.length);
  };

  useEffect(() => {
    // Ensure the selected index is within bounds of filtered images
    if (selectedImageIndex >= filteredImages.length) {
      setSelectedImageIndex(0);
    }
  }, [selectedImageIndex, filteredImages.length]);

  useEffect(() => {
    const validDefaultIndex = Math.min(defaultImageIndex, filteredImages.length - 1);
    setSelectedImageIndex(validDefaultIndex);
  }, [images, defaultImageIndex, filteredImages.length]);

  const promoImages = [
    {
      alt: 'Buy one get one Free Now through 8/24',
      msg: 'Buy one get one Free Now through 8/24',
      images: [{ filename: bannerIcon, width: '50w' }],
    },
    {
      alt: 'Save 20% on all items through 9/01',
      images: [
        { filename: bannerIcon, width: '50w' },
        { filename: bannerIcon, width: '50w' },
        { filename: bannerIcon, width: '50w' },
      ],
    },
    {
      alt: 'Save 20% on all items through 9/01',
      images: [],
      msg: 'Lorem ipsum dolor sit amet consectetur adipisicing elit.',
    },
  ];

  return (
    <div aria-live="polite" className={className}>
      <div className="gallery-container relative flex flex-col-reverse xl:flex-row">
        <div className="gallery-images mr-0 mt-5 flex flex-col items-center xl:mr-4 xl:mt-0 xl:flex-col xl:space-y-4">
          <nav
            ref={thumbnailRef}
            aria-label="Thumbnail navigation"
            className="no-scrollbar flex flex-row space-x-4 overflow-x-auto xl:flex-col xl:space-x-0 xl:space-y-4"
            style={{ maxHeight: '700px' }}
          >
            {(viewAll ? filteredImages : filteredImages.slice(0, 4)).map((image, index) => {
              const isActive = selectedImageIndex === index;

              return (
                <button
                  aria-label="Enlarge product image"
                  aria-pressed={isActive}
                  className={cn(
                    'gallery-thumbnail relative h-12 w-12 flex-shrink-0 border-2 transition-colors duration-200 hover:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 xl:h-[6.4em] xl:w-[6.4em]',
                    isActive ? 'border-primary' : 'border-gray-200',
                  )}
                  key={image.src}
                  onClick={() => openPopup(index)}
                >
                  <BcImage
                    alt={image.altText}
                    className="flex h-full w-full cursor-pointer items-center justify-center object-fill"
                    height={94}
                    priority={true}
                    src={image.src}
                    width={94}
                  />
                  <BcImage
                    alt={image.altText}
                    className="absolute bottom-2 right-2 m-1 h-4 w-4 rounded-full bg-white object-fill p-1 opacity-70"
                    height={10}
                    priority={true}
                    src={galleryExpandIcon}
                    width={10}
                  />
                </button>
              );
            })}

            {!viewAll && filteredImages.length > 4 && (
              <button
                aria-label="View all thumbnails"
                className="gallery-thumbnail relative h-12 w-12 flex-shrink-0 border-2 border-gray-200 transition-colors duration-200 hover:border-primary focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 xl:h-[6.4em] xl:w-[6.4em]"
                onClick={() => openPopup()}
              >
                <BcImage
                  alt="View All"
                  className="flex h-full w-full cursor-pointer items-center justify-center object-fill"
                  height={94}
                  priority={true}
                  src={filteredImages[3].src}
                  width={94}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50 text-white">
                  <span className="text-[0.625rem] xl:text-lg">View All</span>
                  <span className="mt-1 text-[0.625rem] xl:text-sm">{`(+${remainingImagesCount})`}</span>
                </div>
              </button>
            )}
          </nav>
        </div>

        <figure className="main-gallery group relative aspect-square h-full max-h-[100%] w-full">
          <div
            className="product-img relative float-left h-full w-full overflow-hidden"
            data-scale="2"
          >
            <ProductImage size="original" scale={2} src={selectedImage.src} />
          </div>

          <div
            className="absolute bottom-4 right-4 m-1 h-6 w-6 cursor-pointer rounded-full bg-white object-cover p-1 opacity-70 transition-opacity hover:opacity-100"
            onClick={() => openPopup()}
          >
            <img
              alt="Overlay"
              className="h-full w-full object-cover"
              height={24}
              src={galleryExpandIcon}
              width={24}
            />
          </div>

          <button
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 transform border border-gray-300 bg-white p-3 text-lg font-bold leading-[0.9] text-black opacity-0 transition-opacity duration-300 hover:bg-gray-200 group-hover:opacity-100"
            onClick={handlePrevImage}
          >
            &#10094;
          </button>
          <button
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 transform border border-gray-300 bg-white p-3 text-lg font-bold leading-[0.9] text-black opacity-0 transition-opacity duration-300 hover:bg-gray-200 group-hover:opacity-100"
            onClick={handleNextImage}
          >
            &#10095;
          </button>
        </figure>
      </div>

      {viewAll && selectedImage && (
        <GalleryModel
          isOpen={viewAll}
          onClose={closePopup}
          images={filteredImages}
          selectedImageIndex={selectedImageIndex}
          onSelectImage={setSelectedImageIndex}
          productMpn={productMpn}
        />
      )}

      <Banner promoImages={promoImages} />
    </div>
  );
};

export { Gallery };
