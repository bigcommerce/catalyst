'use client';
import { MegaBannerItem, MegaBannerProps } from './mega-banner-types';
import Link from 'next/link';
import { usePathname } from 'next/navigation'
import clsx from 'clsx';

export function MegaBanner({ items, customProps }: MegaBannerProps) {
  const pathname = customProps?.path || usePathname();

  const locationItems = items.filter((item: MegaBannerItem) => !customProps || !customProps.location || item.location === customProps?.location);

  const pathItems = locationItems.filter((item: MegaBannerItem) => (!pathname || !item.conditions || !item.conditions.paths|| item.conditions.paths.replace(/ /g, '').toLowerCase().split(',').includes(pathname.toLowerCase())));
  const categoryItems = pathItems.filter((item: MegaBannerItem) => (!customProps || !customProps.categoryNames || !item.conditions || !item.conditions.categoryNames || customProps.categoryNames.some((categoryName: string) => item.conditions?.categoryNames?.toLowerCase().split(',').includes(categoryName.toLowerCase()))));
  const brandItems = categoryItems.filter((item: MegaBannerItem) => (!customProps || !customProps.brandName || !item.conditions || !item.conditions.brandNames|| item.conditions.brandNames.toLowerCase().split(',').includes(customProps.brandName.toLowerCase())));
  const productItems = brandItems.filter((item: MegaBannerItem) => (!customProps || !customProps.productId || !item.conditions || !item.conditions.productIds|| item.conditions.productIds.replace(/ /g, '').split(',').includes(String(customProps.productId))));

  const activeItems = productItems.filter((item: MegaBannerItem) => (!item.schedule || !item.schedule.startDate || new Date(item.schedule.startDate) <= new Date()) && (!item.schedule || !item.schedule.endDate || new Date(item.schedule.endDate) >= new Date()));

  const filteredItems = activeItems.filter((item: MegaBannerItem) => (
    !customProps || 
    !item.conditions || 
    (
      (!item.conditions.excludePaths || !pathname || !item.conditions.excludePaths.replace(/ /g, '').toLowerCase().split(',').includes(pathname.toLowerCase())) &&
      (!item.conditions.excludeCategoryNames || !customProps.categoryNames || !customProps.categoryNames.some((categoryName: string) => item.conditions?.excludeCategoryNames?.toLowerCase().split(',').includes(categoryName.toLowerCase()))) && 
      (!item.conditions.excludeBrandNames || !customProps.brandName || !item.conditions.excludeBrandNames.toLowerCase().split(',').includes(customProps.brandName.toLowerCase())) &&
      (!item.conditions.excludeProductIds || !customProps.productId || !item.conditions.excludeProductIds.replace(/ /g, '').split(',').includes(String(customProps.productId)))
    )
  ));

  return (filteredItems && filteredItems.length > 0) && (
    <div className={clsx('mega-banner', !!customProps?.location && 'mega-banner-' + customProps?.location, filteredItems[0]?.customCss?.root)}>
      {!!filteredItems[0]?.content ? (
        !!filteredItems[0]?.link?.href && filteredItems[0]?.link?.href !== '#' ? (
          <Link href={filteredItems[0]?.link.href} dangerouslySetInnerHTML={{ __html: filteredItems[0]?.content}} className={clsx('mega-banner-link', filteredItems[0]?.customCss?.link)}></Link>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: filteredItems[0]?.content }}></div>
        )
      ) : (
        !!filteredItems[0]?.imageSrc && (
          !!filteredItems[0]?.link?.href && filteredItems[0]?.link?.href !== '#' ? (
            <Link href={filteredItems[0]?.link.href} className={clsx('mega-banner-link', filteredItems[0]?.customCss?.link)}>
              {!!filteredItems[0]?.imageMobileSrc ? (
                <>
                  <img src={filteredItems[0]?.imageSrc} alt={filteredItems[0]?.imageAlt} className={clsx('mega-banner-image hidden md:block', filteredItems[0]?.customCss?.image)} />
                  <img src={filteredItems[0]?.imageMobileSrc} alt={filteredItems[0]?.imageAlt} className={clsx('mega-banner-image-mobile block md:hidden', filteredItems[0]?.customCss?.image)} />
                </>
              ) : (
                <img src={filteredItems[0]?.imageSrc} alt={filteredItems[0]?.imageAlt} className={clsx('mega-banner-image', filteredItems[0]?.customCss?.image)} />
              )}
            </Link>
          ) : (
            !!filteredItems[0]?.imageMobileSrc ? (
              <>
                <img src={filteredItems[0]?.imageSrc} alt={filteredItems[0]?.imageAlt} className={clsx('mega-banner-image hidden md:block', filteredItems[0]?.customCss?.image)} />
                <img src={filteredItems[0]?.imageMobileSrc} alt={filteredItems[0]?.imageAlt} className={clsx('mega-banner-image-mobile block md:hidden', filteredItems[0]?.customCss?.image)} />
              </>
            ) : (
              <img src={filteredItems[0]?.imageSrc} alt={filteredItems[0]?.imageAlt} className={clsx('mega-banner-image', filteredItems[0]?.customCss?.image)} />
            )
          )
        )
      )}
    </div>
  );
}