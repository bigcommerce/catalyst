import React from 'react';
import { BcImage } from '~/components/bc-image';
import { imageManagerImageUrl } from '~/lib/store-assets';

interface TestimonialProps {
  imageSrc: string;
  imageAlt: string;
  testimonial: string;
  name: string;
  position: string;
}

const Testimonial: React.FC<TestimonialProps> = ({ imageSrc, imageAlt, testimonial, name, position }) => (
  <div className="flex flex-col items-center bg-white p-6 shadow-lg">
    <BcImage
      alt={imageAlt}
      width={150}
      height={150}
      unoptimized={true}
      src={imageSrc}
      className="mb-3"
    />
    <h3 className="text-center text-[16px] font-bold leading-[32px] tracking-[0.5px] text-[#008BB7]">
      Our partner since 2008
    </h3>

    <div className="mb-[0.6em] mt-[0.5em] text-left text-[16px] font-normal leading-[32px] tracking-[0.5px] text-[#353535]">
      {testimonial}
    </div>

    <div className="w-full">
      <span className="text-left text-[16px] font-bold leading-[32px] tracking-[0.5px] text-[#353535]">
        {name},
      </span>

      <span className="text-left text-[16px] font-medium italic leading-[32px] tracking-[0.5px] text-[#008BB7]">
        {position}
      </span>
    </div>
  </div>
);

const BrandPartnersSection: React.FC = () => {
  const testimonials = [
    {
      imageSrc: imageManagerImageUrl('quorem-trade.png', 'original'),
      imageAlt: "Fast Shipping",
      testimonial: "1StopLighting.com has been an invaluable partner for Quorum Brands, consistently exceeding our expectations as the go-to resource for builders, electricians, and lighting professionals. Their comprehensive understanding of Quorum products, combined with their unwavering commitment to customer satisfaction, sets them apart in the industry. Their dedication to excellence makes them our trusted ally.",
      name: "Field Bradford",
      position: "National Sales Manager"
    },
    {
      imageSrc: imageManagerImageUrl('quoizel-trade.png', 'original'),
      imageAlt: "Reliable Support",
      testimonial: "Belami not only offers top-tier products within the Pro category, seamlessly blending functionality and design, but also ensures unparalleled customer service, responsiveness, and expertise. Amidst the complexities of the industry, you can confidently rely on the Belami team to deliver the best fixtures for your projects.",
      name: "Howard Greenberg",
      position: "Director of Sales"
    },
    {
      imageSrc: imageManagerImageUrl('maxim-trade.jpg', 'original'),
      imageAlt: "Quality Products",
      testimonial: "Maxim/ET2 has a well-established professional relationship with the Belami team. They have proven to be a top tier partner working alongside trade professionals and helping grow a client's business. Balami's Pro team is second to none when it comes to product knowledge, logistic accuracy, and customer service.",
      name: "Jason Eberhardt",
      position: "National E-commerce Accounting Manager"
    }
  ];

  return (
    <div className="w-full">
      <h2 className="mb-[40px] mt-[40px] text-center text-[24px] font-normal leading-[32px] text-[#353535]">
        What our Brand Partners Say
      </h2>
      <div className="m-auto grid w-[95%] gap-8 px-4 md:grid-cols-3">
        {testimonials.map((testimonial, index) => (
          <Testimonial
            key={index}
            {...testimonial}
          />
        ))}
      </div>
    </div>
  );
};

export default BrandPartnersSection;