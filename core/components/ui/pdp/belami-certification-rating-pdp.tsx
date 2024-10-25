'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BcImage } from '~/components/bc-image';
import { getMetaFieldsByProduct } from '~/components/common-functions'; // Assuming this is the API call

// Define the interface for certification objects
interface Certification {
  code: string;
  label: string;
  image: string;
}

interface CertificationsAndRatingsProps {
  certificationIcon: string;
  product: any; // Assume you have a product object to pass
}

// Main CertificationsAndRatings component
const CertificationsAndRatings: React.FC<CertificationsAndRatingsProps & { product: any }> = ({
  certificationIcon,
  product,
}) => {
  const t = useTranslations('certificationsAndRatings');
  const [ratingsCertificationsValue, setRatingsCertificationsValue] = useState<Certification[]>([]);

  useEffect(() => {
    // Function to fetch and parse metafields
    const fetchCertifications = async (product: any, metaField: string) => {
      // Fetch metafields data for the product
      let returnData = await getMetaFieldsByProduct(product, metaField);
      console.log('Returned data:', returnData); // Log the returned data

      if (metaField === 'ratings_certifications' && returnData) {
        try {
          // Check if returnData is an object and has a specific property to extract
          const dataToParse = typeof returnData === 'string' ? returnData : returnData.value || '';
          const parsedValue: Certification[] = JSON.parse(dataToParse); // Attempt to parse the relevant data
          console.log('ratings_certifications value:', parsedValue);
          setRatingsCertificationsValue(parsedValue);
        } catch (error) {
          console.error('Failed to parse ratings_certifications value:', error);
        }
      }
    };

    if (product) {
      fetchCertifications(product, 'ratings_certifications'); // Pass product and metafield key
    }
  }, [product]); // Dependency on product to rerun effect when it changes

  // Check if there are any certifications to display
  if (ratingsCertificationsValue.length === 0) {
    return null; // Return null if no certifications to display
  }

  return (
    <div className="product-certificates mt-6 xl:mt-10">
      {/* Center heading for mobile and tablet, left-align for desktop */}
      <h2 className="mb-4 text-center text-base text-[#002A37] xl:text-left">{t('title')}</h2>

      {/* On mobile and tablet, use 2 columns. Flex layout for desktop */}
      <div className="certifications md:py-8em mx-auto grid w-[80%] grid-cols-2 items-center gap-4 md:grid-cols-4 lg:w-[100%] lg:grid-cols-4 xl:w-auto xl:grid-cols-4 xl:gap-4">
        {/* Map through the ratingsCertificationsValue array and render dynamically */}
        {ratingsCertificationsValue.map((certification: Certification, index: number) => (
          <div key={index} className="flex items-center gap-2 md:justify-start">
            <BcImage
              alt={certification.label} // Use label as alt text
              src={certification.image} // Use image URL from metafield
              height={20}
              priority={true}
              width={30}
            />
            <span className="text-[0.875rem]">{certification.label}</span>{' '}
            {/* Use label for text */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificationsAndRatings;
