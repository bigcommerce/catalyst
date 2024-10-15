import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { BcImage } from '~/components/bc-image';
import { useEffect } from 'react';

interface Image {
  altText: string;
  src: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Image[];
  selectedImageIndex: number;
  onSelectImage: (index: number) => void;
}

const GalleryModel = ({
  isOpen,
  onClose,
  images,
  selectedImageIndex,
  onSelectImage,
}: ModalProps) => {
  useEffect(() => {
    const body = document.body;
    const originalPosition = body.style.position;

    if (isOpen) {
      body.style.position = 'fixed';
      body.style.overflow = 'hidden';
      body.style.width = '100%';
    } else {
      body.style.position = originalPosition;
      body.style.overflow = '';
    }

    return () => {
      body.style.position = originalPosition;
      body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const validIndex = Math.max(0, Math.min(selectedImageIndex, images.length - 1));
  const selectedImage = images[validIndex] || {
    altText: 'Image not available',
    src: '/path/to/default-image.jpg',
  };

  const handlePreviousImage = () => {
    onSelectImage(validIndex === 0 ? images.length - 1 : validIndex - 1);
  };

  const handleNextImage = () => {
    onSelectImage(validIndex === images.length - 1 ? 0 : validIndex + 1);
  };

  return (
    <div
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70"
      id="gallery-model"
    >
      <div
        className="modal-content relative flex h-full w-full flex-col bg-white xl:flex-row"
        id="div-modal-content"
      >
        {/* Gallery Slider */}
        <div className="gallery-slider relative flex h-[65%] w-full items-center justify-center overflow-hidden sm:h-[100%] xl:h-full xl:w-[60%]">
          <button
            aria-label="Previous image"
            className="absolute left-4 top-1/2 -translate-y-1/2 transform p-2 hover:bg-opacity-50 focus:outline-none"
            onClick={handlePreviousImage}
          >
            <ChevronLeft size={36} className="hover:text-gray-300" />
          </button>

          <BcImage
            alt={selectedImage.altText || 'Image not available'}
            className="h-full w-full object-contain"
            src={selectedImage.src || '/path/to/default-image.jpg'}
            width={800}
            height={600}
            priority={true}
          />

          <button
            aria-label="Next image"
            className="absolute right-4 top-1/2 -translate-y-1/2 transform p-2 hover:bg-opacity-50 focus:outline-none"
            onClick={handleNextImage}
          >
            <ChevronRight size={36} className="hover:text-gray-300" />
          </button>
        </div>

        {/* Thumbnail Images */}
        <div className="gallery-thumbnails h-auto w-full overflow-y-auto p-4 xl:h-full xl:w-[30%]">
          <div className="grid grid-cols-6 gap-4 xl:grid-cols-3">
            {images.map((image, index) => (
              <div
                key={index}
                className={`cursor-pointer border-2 ${
                  index === validIndex ? 'border-black' : 'border-transparent'
                }`}
                onClick={() => onSelectImage(index)}
              >
                <BcImage
                  alt={image.altText}
                  className="h-12 w-24 md:h-24" // Adjusted size for thumbnails
                  src={image.src}
                  width={96}
                  height={96}
                  loading="lazy" // Enable lazy loading
                />
              </div>
            ))}
          </div>
        </div>

        {/* Close Button */}
        <button
          aria-label="Close gallery"
          className="absolute left-1/2 top-4 z-10 flex w-[10%] -translate-x-1/2 transform items-center justify-center p-2 text-black xl:left-auto xl:right-4 xl:top-4 xl:transform-none"
          onClick={onClose}
        >
          <X size={32} />
        </button>
      </div>
    </div>
  );
};

export { GalleryModel };
