import { useState, useRef, useEffect } from 'react';
import { BcImage } from '~/components/bc-image';
import { cn } from '~/lib/utils';
import { GalleryModel } from './belami-gallery-view-all-model-pdp';
import { Banner } from './belami-banner-pdp';
import { imageManagerImageUrl } from '~/lib/store-assets';
import ProductImage from './product-zoom'; // Import the ProductImage component

interface Image {
  altText: string;
  src: string;
}

interface Props {
  className?: string;
  defaultImageIndex?: number;
  images: Image[];
  bannerIcon: string; // Accept bannerIcon as a prop
  galleryExpandIcon: string; 
}

const Gallery = ({ className, images, defaultImageIndex = 0, bannerIcon , galleryExpandIcon }: Props) => {
  if (!images || images.length === 0) return null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(defaultImageIndex);
  const [viewAll, setViewAll] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);

  const selectedImage = images[selectedImageIndex];
  const remainingImagesCount = images.length - 4;

  const openPopup = (index?: number) => {
    if (index !== undefined) setSelectedImageIndex(index);
    setViewAll(true);
  };

  const closePopup = () => setViewAll(false);

  const handleNextImage = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrevImage = () => {
    setSelectedImageIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  useEffect(() => {
    setSelectedImageIndex(defaultImageIndex);
  }, [images, defaultImageIndex]);

  // Define promo images array
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
      msg: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsa dolores dolorum velit cupiditate asperiores numquam aliquam dignissimos eius expedita ratione quidem enim fugit, aliquid odit a quibusdam corrupti accusamus? Placeat.',
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
            {(viewAll ? images : images.slice(0, 4)).map((image, index) => {
              const isActive = selectedImageIndex === index;

              return (
                <button
                  aria-label="Enlarge product image"
                  aria-pressed={isActive}
                  className="gallery-thumbnail xl:w-[6.4em] xl:h-[6.4em] relative h-12 w-12 flex-shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
                  key={image.src}
                  onClick={() => openPopup(index)} 
                >
                  <BcImage
                    alt={image.altText}
                    className={cn(
                      'flex h-full w-full cursor-pointer items-center justify-center border-2 object-fill hover:border-primary',
                      isActive && 'border-primary',
                    )}
                    height={94}
                    priority={true}
                    src={image.src}
                    width={94}
                  />
                  <BcImage
                    alt={image.altText}
                    className="absolute right-2 bottom-2 m-1 h-4 w-4 rounded-full bg-white p-1 object-fill opacity-70"
                    height={10}
                    priority={true}
                    src={galleryExpandIcon}
                    width={10}
                  />
                </button>
              );
            })}

            {!viewAll && images.length > 4 && (
              <button
                aria-label="View all thumbnails"
                className="gallery-thumbnail xl:w-[6.4em] xl:h-[6.4em] relative h-12 w-12 flex-shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 xl:h-24 xl:w-24"
                onClick={() => openPopup()} 
              >
                <BcImage
                  alt="View All"
                  className="flex h-full w-full cursor-pointer items-center justify-center border-2 object-fill"
                  height={94}
                  priority={true}
                  src={images[3].src}
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

        <figure className="group main-gallery relative aspect-square h-full max-h-[100%] w-full">
          {selectedImage ? (
            <>
              <div className="product-img relative overflow-hidden w-full h-full float-left" data-scale="2">
                {/* Use the ProductImage component for zoom functionality */}
     
                <ProductImage 
         
                  size='original'
                  scale={2} src={selectedImage.src}  />
              </div>

              <div
                className="absolute right-4 bottom-4 m-1 h-6 w-6 rounded-full bg-white p-1 object-cover opacity-70 transition-opacity hover:opacity-100 cursor-pointer"
                onClick={() => openPopup()} // Use openPopup to trigger the modal
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
            </>
          ) : (
            <div className="flex aspect-square items-center justify-center bg-gray-200">
              <div className="text-base font-semibold text-gray-500">Coming soon</div>
            </div>
          )}
        </figure>

      </div>

      {/* GalleryModel for Image View */}
      {viewAll && (
        <GalleryModel
          isOpen={viewAll}
          onClose={closePopup}
          images={images}
          selectedImageIndex={selectedImageIndex}
          onSelectImage={setSelectedImageIndex}
        />
      )}

      {/* Use PromoBanner here with the passed bannerIcon */}
      <Banner promoImages={promoImages} />
    </div>
  );
};

export { Gallery };