'use client';
import { MegaBannerItem, MegaBannerProps } from './mega-banner-types';
import Link from 'next/link';
import clsx from 'clsx';

export function MegaBanner({ items, customProps }: MegaBannerProps) {
  const locationItems = customProps && !!customProps.location ? items.filter((item: MegaBannerItem) => item.location === customProps?.location) : items;
  const activeItems = locationItems.filter((item: MegaBannerItem) => (!item.schedule || !item.schedule.startDate || new Date(item.schedule.startDate) <= new Date()) && (!item.schedule || !item.schedule.endDate || new Date(item.schedule.endDate) >= new Date()));
  const filteredItems = activeItems;
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