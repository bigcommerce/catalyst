'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { Select, SelectContent, SelectItem } from '~/components/ui/select';

export function SortBy() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const t = useTranslations('FacetedGroup.SortBy');
  const value = searchParams.get('sort') ?? 'featured';

  const onSort = (sortValue: string) => {
    const params = new URLSearchParams(searchParams);

    params.set('sort', sortValue);

    return router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <Select
      aria-label={t('ariaLabel')}
      className="order-2 min-w-[224px] md:order-3 md:w-auto"
      onValueChange={onSort}
      value={value}
    >
      <SelectContent>
        <SelectItem value="featured">{t('featuredItems')}</SelectItem>
        <SelectItem value="newest">{t('newestItems')}</SelectItem>
        <SelectItem value="best_selling">{t('bestSellingItems')}</SelectItem>
        <SelectItem value="a_to_z">{t('aToZ')}</SelectItem>
        <SelectItem value="z_to_a">{t('zToA')}</SelectItem>
        <SelectItem value="best_reviewed">{t('byReview')}</SelectItem>
        <SelectItem value="lowest_price">{t('priceAscending')}</SelectItem>
        <SelectItem value="highest_price">{t('priceDescending')}</SelectItem>
        <SelectItem value="relevance">{t('relevance')}</SelectItem>
      </SelectContent>
    </Select>
  );
}
