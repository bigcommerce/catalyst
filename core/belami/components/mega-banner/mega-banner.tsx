'use client';
import { MegaBannerItem, MegaBannerProps } from './mega-banner-types';

export function MegaBanner({ items, customProps }: MegaBannerProps) {

  return (items && items.length > 0) && (
    <div>
      BANNER HERE
    </div>
  );
}
