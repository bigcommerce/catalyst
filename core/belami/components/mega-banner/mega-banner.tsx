'use client';
import { MegaBannerItem, MegaBannerProps } from './mega-banner-types';
import Link from 'next/link';
import clsx from 'clsx';

export function MegaBanner({ items, customProps }: MegaBannerProps) {
  const locationItems = items.filter((item: MegaBannerItem) => !customProps || !customProps.location || item.location === customProps?.location);

  const categoryItems = locationItems.filter((item: MegaBannerItem) => (!customProps || !customProps.categoryId || !item.conditions || !item.conditions.categoryIds|| item.conditions.categoryIds.replace(/ /g, '').split(',').includes(String(customProps.categoryId))));
  const brandItems = categoryItems.filter((item: MegaBannerItem) => (!customProps || !customProps.brandId || !item.conditions || !item.conditions.brandIds|| item.conditions.brandIds.replace(/ /g, '').split(',').includes(String(customProps.brandId))));
  const productItems = brandItems.filter((item: MegaBannerItem) => (!customProps || !customProps.productId || !item.conditions || !item.conditions.productIds|| item.conditions.productIds.replace(/ /g, '').split(',').includes(String(customProps.productId))));

  const activeItems = productItems.filter((item: MegaBannerItem) => (!item.schedule || !item.schedule.startDate || new Date(item.schedule.startDate) <= new Date()) && (!item.schedule || !item.schedule.endDate || new Date(item.schedule.endDate) >= new Date()));

  const filteredItems = activeItems.filter((item: MegaBannerItem) => (
    !customProps || 
    !item.conditions || 
    ((!item.conditions.excludeCategoryIds || !customProps.categoryId || !item.conditions.excludeCategoryIds.replace(/ /g, '').split(',').includes(String(customProps.categoryId))) && 
    (!item.conditions.excludeBrandIds || !customProps.brandId || !item.conditions.excludeBrandIds.replace(/ /g, '').split(',').includes(String(customProps.brandId))) &&
    (!item.conditions.excludeProductIds || !customProps.productId || !item.conditions.excludeProductIds.replace(/ /g, '').split(',').includes(String(customProps.productId))))
  ));

  return (filteredItems && filteredItems.length > 0) && (
    <div className={clsx('mega-banner', !!customProps?.location && 'mega-banner-' + customProps?.location)}>
      {!!filteredItems[0]?.content ? (
        !!filteredItems[0]?.link?.href ? (
          <Link href={filteredItems[0]?.link.href} dangerouslySetInnerHTML={{ __html: filteredItems[0]?.content}}></Link>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: filteredItems[0]?.content }}></div>
        )
      ) : (
        !!filteredItems[0]?.imageSrc && (
          !!filteredItems[0]?.link?.href ? (
            <Link href={filteredItems[0]?.link.href}><img src={filteredItems[0]?.imageSrc} alt={filteredItems[0]?.imageAlt} /></Link>
          ) : (
            <img src={filteredItems[0]?.imageSrc} alt={filteredItems[0]?.imageAlt} />
          )
        )
      )}
    </div>
  );
}