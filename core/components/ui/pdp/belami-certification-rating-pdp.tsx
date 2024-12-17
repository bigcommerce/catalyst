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
  // console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^",product);
  const productData = {
    brand: product.brand?.name || null, // Use null if brand.name is undefined
    sku: product.sku,
    name: product.name,
    mpn: product.mpn,
  };

  // Save the object to localStorage
  localStorage.setItem('productInfo', JSON.stringify(productData));
  
  const t = useTranslations('certificationsAndRatings');
  const [variantCertifications, setVariantCertifications] = useState<Certification[]>([]);
  const [productCertifications, setProductCertifications] = useState<Certification[]>([]);
  const [statusMessage, setStatusMessage] = useState<string>('');

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

        let validProductCerts: Certification[] = [];
        let validVariantCerts: Certification[] = [];

        // Parse and validate product certifications
        if (response.productMetaField?.value) {
          try {
            const parsedProductValue: Certification[] = JSON.parse(response.productMetaField.value);
            validProductCerts = parsedProductValue.filter(isValidCertification);
            setProductCertifications(validProductCerts);
          } catch (error) {
            console.error('Failed to parse product certifications:', error);
            setProductCertifications([]);
          }
        }

        // Parse and validate variant certifications
        if (response.metaField?.value) {
          try {
            const parsedVariantValue: Certification[] = JSON.parse(response.metaField.value);
            validVariantCerts = parsedVariantValue.filter(isValidCertification);
            setVariantCertifications(validVariantCerts);
          } catch (error) {
            console.error('Failed to parse variant certifications:', error);
            setVariantCertifications([]);
          }
        } else {
          setVariantCertifications([]);
        }

        // Set status message based on actual valid certifications
        if (validVariantCerts.length > 0 && validProductCerts.length > 0) {
          setStatusMessage('Found both variant and product data');
        } else if (validVariantCerts.length > 0) {
          setStatusMessage('Found variant data only');
        } else if (validProductCerts.length > 0) {
          setStatusMessage('Found product data only');
        } else {
          setStatusMessage('No valid certification data found');
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

      <div className="mb-4 text-sm text-gray-600">
        <div>Status: {statusMessage}</div>
      </div>

      <div className="certifications md:py-8em mx-auto grid w-[80%] grid-cols-2 items-center gap-4 md:grid-cols-4 lg:w-[100%] lg:grid-cols-4 xl:w-auto xl:grid-cols-4 xl:gap-4">
        {allCertifications.map((certification: Certification, index: number) => (
          <div
            key={`${certification.code}-${index}`}
            className="flex items-center gap-2 md:justify-start"
          >
            <BcImage
              alt={certification.label}
              src={certification.image}
              width={30}
              height={20}
              priority={true}
            />
            <span className="text-[0.875rem]">{certification.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CertificationsAndRatings;