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
  const [statusMessage, setStatusMessage] = useState<string>('');

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

  const allCertifications = [
    ...new Map(
      [...variantCertifications, ...productCertifications]
        .filter(isValidCertification)
        .map((cert) => [cert.code, cert]),
    ).values(),
  ];

  if (allCertifications.length === 0) {
    return null;
  }

  return (
    <div className="product-certificates mt-6 xl:mt-10">
      <h2 className="mb-4 text-center text-base text-[#002A37] xl:text-left">{t('title')}</h2>

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
