import { ReactNode } from 'react';

export interface MegaBannerItem {
  title?: string;
  location?: string;
  imageSrc?: string;
  imageMobileSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
  content?: ReactNode | string;
  schedule?: { startDate?: string; endDate?: string };
  conditions?: {
    brandNames?: string;
    categoryNames?: string;
    productIds?: string;
    excludeBrandNames?: string;
    excludeCategoryNames?: string;
    excludeProductIds?: string;
  };
}

export type MegaBannerCustomProps = {
  location?: string;
  brandName?: string;
  categoryNames?: string[];
  productId?: number;
};

export type MegaBannerProps = {
  items: MegaBannerItem[];
  customProps?: MegaBannerCustomProps;
}