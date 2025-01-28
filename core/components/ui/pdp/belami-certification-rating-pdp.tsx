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

  // Helper function to validate certification
  const isValidCertification = (cert: Certification): boolean => {
    return Boolean(cert && cert.code && cert.label && cert.image);
  };

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

        const response = await getMetaFieldsByProduct(productData, 'ratings_certifications');

        // Parse and validate product certifications
        if (response.productMetaField?.value) {
          try {
            const parsedProductValue: Certification[] = JSON.parse(response.productMetaField.value);
            setProductCertifications(parsedProductValue.filter(isValidCertification));
          } catch (error) {
            console.error('Failed to parse product certifications:', error);
            setProductCertifications([]);
          }
        }

        // Parse and validate variant certifications
        if (response.metaField?.value) {
          try {
            const parsedVariantValue: Certification[] = JSON.parse(response.metaField.value);
            setVariantCertifications(parsedVariantValue.filter(isValidCertification));
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
      }
    };

    if (product) {
      fetchData();
    }
  }, [product, selectedVariant]);

  // Combine and deduplicate valid certifications
  const allCertifications = [
    ...new Map(
      [...variantCertifications, ...productCertifications]
        .filter(isValidCertification)
        .map((cert) => [cert.code, cert]),
    ).values(),
  ];

  // Don't render anything if there are no valid certifications
  if (allCertifications.length === 0) {
    return null;
  }

  return (
    <div className="product-certificates mt-6 xl:mt-10">
      <h2 className="mb-4 text-center text-base text-[#002A37] xl:text-left">{t('title')}</h2>
      <div className="certifications flex flex-wrap items-center gap-4">
        {allCertifications.map((certification: Certification, index: number) => (
          <div key={`${certification.code}-${index}`} className="flex items-center gap-2">
            <BcImage
              alt={certification.label}
              src={certification.image}
              width={30}
              height={20}
              priority={true}
            />
            <span className="text-sm">{certification.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificationsAndRatings;
