import { ReactNode } from 'react';

export interface MegaBannerItem {
  title?: string;
  location?: string;
  imageSrc?: string;
  imageMobileSrc?: string;
  imageAlt?: string;
  imageWidth?: string;
  link?: { href?: string; target?: string };
  content?: ReactNode | string;
  customCss?: { 
    root?: string; 
    link?: string;
    image?: string;
  };
  schedule?: { startDate?: string; endDate?: string };
  conditions?: {
    paths?: string;
    brandNames?: string;
    categoryNames?: string;
    productIds?: string;
    excludePaths?: string;
    excludeBrandNames?: string;
    excludeCategoryNames?: string;
    excludeProductIds?: string;
  };
}

export type MegaBannerCustomProps = {
  location?: string;
  path?: string;
  brandName?: string;
  categoryNames?: string[];
  productId?: number;
};

export type MegaBannerProps = {
  items: MegaBannerItem[];
  customProps?: MegaBannerCustomProps;
}