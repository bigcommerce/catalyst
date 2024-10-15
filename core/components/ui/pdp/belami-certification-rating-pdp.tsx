'use client';
import React from 'react';
import { useTranslations } from 'next-intl'; // Import useTranslations hook
import { BcImage } from '~/components/bc-image';

interface CertificationsAndRatingsProps {
  certificationIcon: string; // Define prop for certification icon
}

// Main CertificationsAndRatings component
const CertificationsAndRatings: React.FC<CertificationsAndRatingsProps> = ({
  certificationIcon,
}) => {
  const t = useTranslations('certificationsAndRatings'); // Use translations for this component

  return (
    <div className="product-certificates mt-6 xl:mt-10">
      {/* Center heading for mobile and tablet, left-align for desktop */}
      <h2 className="mb-4 text-center text-base text-[#002A37] xl:text-left">{t('title')}</h2>

      {/* On mobile and tablet, use 2 columns. Flex layout for desktop */}
      <div className="certifications md:py-8em mx-auto grid w-[80%] grid-cols-2 items-center gap-4 md:grid-cols-4 lg:w-[100%] lg:grid-cols-4 xl:w-auto xl:grid-cols-4 xl:gap-10">
        {/* Certification items */}
        <div className="flex items-center gap-2 md:justify-start">
          <BcImage
            alt={t('dampRated')} // Alt text from translations
            src={certificationIcon}
            height={10}
            priority={true}
            width={20}
          />
          <span className="text-[0.875rem]">{t('dampRated')}</span> {/* Text from translations */}
        </div>

        <div className="flex items-center gap-2 md:justify-start">
          <BcImage
            alt={t('csaCertified')} // Alt text from translations
            src={certificationIcon}
            height={10}
            priority={true}
            width={20}
          />
          <span className="text-[0.875rem]">{t('csaCertified')}</span>{' '}
          {/* Text from translations */}
        </div>

        <div className="flex items-center gap-2 md:justify-start">
          <BcImage
            alt={t('etlCertified')} // Alt text from translations
            src={certificationIcon}
            height={10}
            priority={true}
            width={20}
          />
          <span className="text-[0.875rem]">{t('etlCertified')}</span>{' '}
          {/* Text from translations */}
        </div>

        <div className="flex items-center gap-2 md:justify-start">
          <BcImage
            alt={t('wetRated')} // Alt text from translations
            src={certificationIcon}
            height={10}
            priority={true}
            width={20}
          />
          <span className="text-[0.875rem]">{t('wetRated')}</span> {/* Text from translations */}
        </div>
      </div>
    </div>
  );
};

export default CertificationsAndRatings;
