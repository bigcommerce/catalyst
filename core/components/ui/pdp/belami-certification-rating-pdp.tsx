'use client';
import React, { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { BcImage } from '~/components/bc-image';
import { getMetaFieldsByProduct } from '~/components/common-functions';

interface Certification {
  code: string;
  label: string;
  image: string;
}

interface MetaField {
  entityId: number;
  key: string;
  value: string;
}

interface CertificationsAndRatingsProps {
  certificationIcon: string;
  product: any;
  selectedVariant?: any;
}

const CertificationsAndRatings: React.FC<CertificationsAndRatingsProps> = ({
  certificationIcon,
  product,
  selectedVariant,
}) => {
  const t = useTranslations('certificationsAndRatings');
  const [variantCertifications, setVariantCertifications] = useState<Certification[]>([]);
  const [productCertifications, setProductCertifications] = useState<Certification[]>([]);
  const [matchedVariantId, setMatchedVariantId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        let productData = selectedVariant
          ? {
              ...product,
              entityId: product.entityId,
              sku: selectedVariant.sku,
              variants: product.variants,
              productOptions: product.productOptions,
            }
          : product;

        // Get metadata using the common function
        const response = await getMetaFieldsByProduct(productData, 'ratings_certifications');

        setStatusMessage(response.message);

        // Parse and set product certifications
        if (response.productMetaField) {
          try {
            const parsedProductValue: Certification[] = JSON.parse(
              response.productMetaField.value || '[]',
            );
            setProductCertifications(parsedProductValue);
          } catch (error) {
            console.error('Failed to parse product certifications:', error);
            setProductCertifications([]);
          }
        }

        // Parse and set variant certifications
        if (response.metaField) {
          try {
            const parsedVariantValue: Certification[] = JSON.parse(
              response.metaField.value || '[]',
            );
            setVariantCertifications(parsedVariantValue);

            if (selectedVariant) {
              setMatchedVariantId(response.isVariantData ? selectedVariant.entityId : null);
            }
          } catch (error) {
            console.error('Failed to parse variant certifications:', error);
            setVariantCertifications([]);
          }
        } else {
          setVariantCertifications([]);
        }
      } catch (error) {
        console.error('Error fetching certifications:', error);
        setVariantCertifications([]);
        setProductCertifications([]);
        setStatusMessage('Error fetching certification data');
      }
    };

    if (product) {
      fetchData();
    }
  }, [product, selectedVariant]);

  // Combine and deduplicate certifications
  const allCertifications = [
    ...new Map(
      [...variantCertifications, ...productCertifications].map((cert) => [cert.code, cert]),
    ).values(),
  ];

  // Conditionally render the component only if there are certifications
  if (allCertifications.length === 0) {
    return null;
  }

  return (
    <div className="product-certificates mt-6 xl:mt-10">
      <h2 className="mb-4 text-center text-base text-[#002A37] xl:text-left">{t('title')}</h2>

      <div className="mb-4 text-sm text-gray-600">
        <div>Status: {statusMessage}</div>
      </div>

      <div className="certifications md:py-8em mx-auto grid w-[80%] grid-cols-2 items-center gap-4 md:grid-cols-4 lg:w-[100%] lg:grid-cols-4 xl:w-auto xl:grid-cols-4 xl:gap-4">
        {allCertifications.map((certification: Certification, index: number) => (
          <div key={index} className="flex items-center gap-2 md:justify-start">
            <BcImage
              alt={certification.label}
              src={certification.image}
              height={20}
              priority={true}
              width={30}
            />
            <span className="text-[0.875rem]">{certification.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificationsAndRatings;