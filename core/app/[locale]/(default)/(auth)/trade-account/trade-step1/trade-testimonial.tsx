'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface TestimonialProps {
  title: string;
  content: string;
  name: string;
  position: string;
}

const StarRating: React.FC = () => (
  <div className="mb-4 flex">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className="h-5 w-5 text-yellow-400"
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

const Testimonial: React.FC<TestimonialProps> = ({ title, content, name, position }) => (
  <div className="display-contents h-full flex-col p-6">
    <h3 className="mb-3 px-3 text-center text-[16px] font-bold leading-[32px] tracking-[0.5px] text-[#008BB7]">
      {title}
    </h3>
    <p className="mb-3 text-left text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
      {content}
    </p>

    <div className="mt-auto flex flex-col">
      <div className="mb-3">
        <span className="text-[16px] font-bold leading-[32px] tracking-[0.5px] text-[#353535]">
          {name},{' '}
        </span>
        <span className="text-[16px] font-medium italic leading-[32px] tracking-[0.5px] text-[#353535]">
          {position}
        </span>
      </div>
      <StarRating />
    </div>
  </div>
);

const HappyProsSection: React.FC = () => {
  const testimonials = [
    {
      title:
        '"I cannot recommend them enough to anyone who is looking for any type of lighting you might need!"',
      content:
        'Jeremy and 1StopLighting have been amazing to work with... All of the lighting fixtures we have bought for our landscaping projects have worked great and our clients love the aesthetic - especially at night! Our orders ship almost immediately after placing them. If there has been any issue or we have needed to return for an overage on the lights, Jeremy & 1StopLighting have worked very efficiently with getting that process started.',
      name: 'Brook Wilson',
      position: 'Cutters Landscaping',
    },
    {
      title: '"They are very helpful and have great products."',
      content:
        "I've been buying chandeliers and pendant lights from Belami for years. Sandy and the rest of the team have been great to work with. They are very helpful and have great products.",
      name: 'Julie de Lancellotti',
      position: 'Director of Store Planning, Windsor',
    },
    {
      title: '"Their dedication to customer satisfaction is evident in every interaction."',
      content:
        "Sandy's company not only met but exceeded our requirements, consistently going above and beyond to ensure that our needs were met efficiently and effectively. Their attention to detail, proactive communication, and willingness to accommodate our specific requests were particularly noteworthy. We are truly impressed by Sandy's leadership and the outstanding performance of her team.",
      name: 'Kona Contractors',
      position: 'Company',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const getItemsPerView = () => {
    // Check if we're on client side
    if (typeof window === 'undefined') return 1;

    // Get the current window width
    const width = window.innerWidth;

    if (width >= 1024) return 3; // Desktop
    if (width >= 768) return 2; // Tablet/iPad
    return 1; // Mobile
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
        Happy Pros
      </h2>

      <div className="relative m-auto w-full max-w-[97%] px-4">
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
                        <Testimonial
                          title={testimonial.title}
                          content={testimonial.content}
                          name={testimonial.name}
                          position={testimonial.position}
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
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

        {/* Slide Indicators */}
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

        {/* Slide Counter */}
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

export default HappyProsSection;
