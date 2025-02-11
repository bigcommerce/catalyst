'use client';
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BcImage } from '~/components/bc-image';

interface CarouselImage {
  src: string;
  alt: string;
  title: string;
}

interface ImageCarouselProps {
  images?: CarouselImage[];
  height?: string;
}

const defaultImage: CarouselImage = {
  src: '/api/placeholder/1200/600',
  alt: 'Default Image',
  title: 'Default Title',
};

const ImageCarousel: React.FC<ImageCarouselProps> = ({
  images = [defaultImage],
  height = '520px',
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  if (!images.length) return null;

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const currentImage: CarouselImage = images[currentSlide] ?? defaultImage;

  return (
    <div>
      <div className="relative w-full overflow-hidden">
        <div className="relative w-full">
          <div className="relative w-full" style={{ height }}>
            <BcImage
              src={currentImage.src}
              alt={currentImage.alt}
              className="h-full w-full object-fill"
              width={1200}
              height={400}
              unoptimized={true}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-6">
              <h2 className="text-center text-[24px] font-normal leading-[32px] text-white">
                {currentImage.title}
              </h2>
            </div>

            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 transform bg-white p-2 shadow-lg transition hover:bg-gray-100"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 transform bg-white p-2 shadow-lg transition hover:bg-gray-100"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col">
        <div className="relative w-full">
          <div className="flex w-full justify-between gap-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className="relative flex-1"
                aria-label={`Go to slide ${index + 1}`}
              >
                <div
                  className={`h-[5px] w-full ${currentSlide === index ? 'bg-[#008BB7]' : 'bg-[#CCCBCB]'}`}
                />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-2 flex items-center justify-center space-x-4">
          <button
            onClick={prevSlide}
            className="p-2 transition hover:opacity-75"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-3 w-3 text-[#1C1B1F]" />
          </button>

          <div className="text-center text-sm font-medium text-gray-600">
            <div>
              {currentSlide + 1} / {images.length}
            </div>
          </div>

          <button
            onClick={nextSlide}
            className="p-2 transition hover:opacity-75"
            aria-label="Next slide"
          >
            <ChevronRight className="h-3 w-3 text-[#1C1B1F]" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCarousel;
