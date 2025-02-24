export interface MegaBannerItem {
  title?: string;
  imageSrc?: string;
  imageAlt?: string;
  link?: { href?: string; target?: string };
  content?: string;
  brandIds?: string;
  categoryIds?: string;
  productIds?: string;
  startDate?: string;
  endDate?: string;
}

export interface MegaBannerSection {
  title?: string;
  banners: MegaBannerItem[];
}

export type MegaBannerProps = {
  sections: MegaBannerSection[];
};
