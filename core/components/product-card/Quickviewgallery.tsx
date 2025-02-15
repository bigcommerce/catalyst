import React, { useState, useEffect } from 'react';
import { BcImage } from '~/components/bc-image';
import { cn } from '~/lib/utils';

const QuickViewGallery = ({
  className,
  images = [],
  videos = [],
  product,
  defaultImageIndex = 0,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(defaultImageIndex);
  const [currentPage, setCurrentPage] = useState(1);
  const totalImages = images.length;

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
    setCurrentPage((prev) => (prev === 1 ? totalImages : prev - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
    setCurrentPage((prev) => (prev === totalImages ? 1 : prev + 1));
  };

  const selectedImage = images[selectedIndex];

  return (
    <div className={cn("relative flex flex-col", className)}>
      {/* Wishlist Button */}
      <div className="absolute right-4 top-4 z-10">
        <button className="text-gray-400 hover:text-red-500">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Main Image */}
      <div className="relative mb-4 aspect-square w-full overflow-hidden">
        <BcImage
          src={selectedImage?.src || ''}
          alt={selectedImage?.altText || ''}
          className="h-full w-full object-contain"
          width={500}
          height={500}
          priority={true}
        />
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-center gap-4 mt-2">
        <button 
          onClick={handlePrevious}
          className="text-gray-600 hover:text-gray-800 text-xl"
          aria-label="Previous image"
        >
          ❮
        </button>
        <span className="text-sm text-gray-600">{currentPage}/{totalImages}</span>
        <button 
          onClick={handleNext}
          className="text-gray-600 hover:text-gray-800 text-xl"
          aria-label="Next image"
        >
          ❯
        </button>
      </div>

      {/* View Full Details Link */}
      <div className="text-center mt-4">
        <a href="#" className="text-center text-[16px] font-normal leading-[32px] tracking-[0.15px] underline decoration-solid decoration-[auto] underline-offset-auto decoration-from-font text-[#008BB7] font-[Open\ Sans] hover:underline ">
          View Full Details
        </a>
      </div>
    </div>
  );
};

export { QuickViewGallery };