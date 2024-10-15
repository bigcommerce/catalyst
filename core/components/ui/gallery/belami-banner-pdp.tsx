import { useState } from 'react';
import { BcImage } from '~/components/bc-image';
import { imageManagerImageUrl } from '~/lib/store-assets';
import { cn } from '~/lib/utils';

interface PromoImage {
  alt: string;
  msg?: string; // Optional message field
  images: { filename: string; width: string }[]; // Array of image objects
}

interface PromoBannerProps {
  promoImages: PromoImage[];
}

const Banner = ({ promoImages }: PromoBannerProps) => {
  const [promoIndex, setPromoIndex] = useState(0);

  // Dynamically set the class name based on the current promoIndex
  const promoClassName = `promo-${promoIndex + 1}`;

  const currentPromo = promoImages[promoIndex];
  const currentPromoImages = currentPromo?.images || [];
  const promoAltText = currentPromo?.alt || 'Promo'; // Default alt text if currentPromo is undefined
  const promoMsg = currentPromo?.msg || ''; // Default message if currentPromo is undefined

  const handlePromoClick = () => {
    setPromoIndex((prevIndex) => (prevIndex + 1) % promoImages.length);
  };

  return (
    <div
      className={cn(
        'promo-banner mt-4 flex cursor-pointer items-center justify-center bg-[#E7F5F8] p-2 text-center',
        promoClassName, // Apply the dynamic class name
      )}
      onClick={handlePromoClick}
    >
      <div className="flex items-center">
        {currentPromoImages.length > 0 &&
          currentPromoImages.map((promoImage, index) => (
            <BcImage
              key={index}
              alt={promoAltText}
              src={promoImage.filename}
              className="h-16 w-auto sm:h-24 md:h-28" // Responsive image sizes
              height={90}
              width={100}
              priority={true}
            />
          ))}
        {promoMsg && (
          <div className="promo-msg ml-4 text-sm sm:text-base md:text-lg">
            {' '}
            {/* Responsive font sizes */}
            {promoMsg}
          </div>
        )}
      </div>
    </div>
  );
};

export { Banner };
