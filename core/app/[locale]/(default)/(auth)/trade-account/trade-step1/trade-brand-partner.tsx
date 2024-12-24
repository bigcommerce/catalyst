'use client';

import React, { useState } from 'react';
import { BcImage } from '~/components/bc-image';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TestimonialData {
  imageSrc: string;
  imageAlt: string;
  testimonial: string;
  name: string;
  position: string;
}

interface BrandPartnersSectionProps {
  testimonials: TestimonialData[];
}

const Testimonial: React.FC<TestimonialData> = ({
  imageSrc,
  imageAlt,
  testimonial,
  name,
  position,
}) => (
  <div className="block h-full flex-col items-center bg-white p-6 shadow-lg">
    <BcImage
      alt={imageAlt}
      width={150}
      height={150}
      unoptimized={true}
      src={imageSrc}
      className="mb-3"
    />
    <h3 className="text-center text-base font-bold leading-8 tracking-wider text-[#008BB7]">
      Our partner since 2008
    </h3>

    <div className="mb-2 mt-2 text-left text-base font-normal leading-8 tracking-wider text-[#353535]">
      {testimonial}
    </div>

    <div className="mt-auto w-full">
      <span className="text-left text-base font-bold leading-8 tracking-wider text-[#353535]">
        {name},
      </span>

      <span className="text-left text-base font-medium italic leading-8 tracking-wider text-[#008BB7]">
        {position}
      </span>
    </div>
  </div>
);

const BrandPartnersSection: React.FC<BrandPartnersSectionProps> = ({ testimonials }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const getItemsPerView = () => {
    if (typeof window === 'undefined') return 1;
    const width = window.innerWidth;
    if (width >= 1024) return 3;
    if (width >= 768) return 2;
    return 1;
  };

  const itemsPerView = getItemsPerView();
  const totalSlides = Math.ceil(testimonials.length / itemsPerView);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1 >= totalSlides ? 0 : prevIndex + 1));
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 < 0 ? totalSlides - 1 : prevIndex - 1));
  };

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <div className="w-full pb-[40px] pt-[40px]">
      <h2 className="mb-10 text-center text-2xl font-normal leading-8 text-[#353535]">
        What our Brand Partners Say
      </h2>

      <div className="relative m-auto w-[95.5%] px-4">
        <div className="relative overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {[...Array(totalSlides)].map((_, slideIndex) => (
              <div key={`slide-${slideIndex}`} className="w-full flex-shrink-0">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {testimonials
                    .slice(slideIndex * itemsPerView, slideIndex * itemsPerView + itemsPerView)
                    .map((testimonial, index) => (
                      <div
                        key={`testimonial-${slideIndex}-${index}`}
                        className="transform transition-transform duration-500 ease-in-out"
                      >
                        <Testimonial {...testimonial} />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {totalSlides > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 transform rounded-full bg-white p-2 shadow-lg hover:bg-gray-100"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-6 w-6 text-[#008BB7]" />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 transform rounded-full bg-white p-2 shadow-lg hover:bg-gray-100"
                aria-label="Next slide"
              >
                <ChevronRight className="h-6 w-6 text-[#008BB7]" />
              </button>
            </>
          )}
        </div>

        {totalSlides > 1 && (
          <div className="m-auto mt-4 flex w-[98%] justify-center gap-3">
            {[...Array(totalSlides)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-[5px] w-full transition-all ${
                  currentIndex === index ? 'bg-[#008BB7]' : 'bg-gray-300'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {totalSlides > 1 && (
          <div className="mt-2 flex items-center justify-center space-x-4">
            <button
              onClick={handlePrev}
              className="p-2 transition hover:opacity-75"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-3 w-3 text-[#1C1B1F]" />
            </button>

            <div className="text-center text-sm font-medium text-gray-600">
              {currentIndex + 1} / {totalSlides}
            </div>

            <button
              onClick={handleNext}
              className="p-2 transition hover:opacity-75"
              aria-label="Next slide"
            >
              <ChevronRight className="h-3 w-3 text-[#1C1B1F]" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrandPartnersSection;