export interface MegaBannerItem {
  title?: string;
  location?: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
  content?: string;
  startDate?: string;
  endDate?: string;
  brandIds?: string;
  categoryIds?: string;
  productIds?: string;
  excludeBrandIds?: string;
  excludeCategoryIds?: string;
  excludeProductIds?: string;
}

export type MegaBannerCustomProps = {
  location?: string;
  brandId?: string;
  categoryId?: string;
  productId?: string;
};

export type MegaBannerProps = {
  items: MegaBannerItem[];
  customProps?: MegaBannerCustomProps;
};
