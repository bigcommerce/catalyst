'use client';

import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { Select } from '~/components/ui/form';
import { usePathname, useRouter } from '~/i18n/routing';

export function SortBy() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const t = useTranslations('FacetedGroup.SortBy');
  const value = searchParams.get('sort') ?? 'featured';

  const onSort = (sortValue: string) => {
    const params = new URLSearchParams(searchParams);

    params.set('sort', sortValue);
    params.delete('before');
    params.delete('after');

    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="order-2 min-w-[224px] md:order-3 md:w-auto">
      <span className="hidden" data-pending={isPending ? '' : undefined} />
      <Select
        label={t('ariaLabel')}
        onValueChange={onSort}
        options={[
          { value: 'featured', label: t('featuredItems') },
          { value: 'newest', label: t('newestItems') },
          { value: 'best_selling', label: t('bestSellingItems') },
          { value: 'a_to_z', label: t('aToZ') },
          { value: 'z_to_a', label: t('zToA') },
          { value: 'best_reviewed', label: t('byReview') },
          { value: 'lowest_price', label: t('priceAscending') },
          { value: 'highest_price', label: t('priceDescending') },
          { value: 'relevance', label: t('relevance') },
        ]}
        value={value}
      />
    </div>
  );
}
