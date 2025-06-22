'use client';

import { Combobox, Group, List, Select, Style } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import * as Skeleton from '@/vibes/soul/primitives/skeleton';

import { searchCategories } from '../../utils/search-categories';
import clsx from 'clsx';
import { useCategoriesByIds } from '../../utils/fetch-categories';

interface Props {
  className?: string;
  categoryItems: CategoryInterface[];
  itemsPerRowSuperDesktop: string;
  itemsPerRowDesktop: string;
  itemsPerRowTablet: string;
  itemsPerRowMobile: string;
  aspectRatio?: '1:1' | '5:6' | '3:4';
}

interface CategoryInterface {
  entityId?: string;
}

const gridColsClass = (prefix: string, count: string) => {
  // Only allow 1-4
  const allowed = ['1', '2', '3', '4'];
  if (!allowed.includes(count)) return '';
  return `${prefix}grid-cols-${count}`;
};

function MakeswiftCategoryGridGIT({
  className,
  categoryItems,
  itemsPerRowDesktop,
  itemsPerRowSuperDesktop,
  itemsPerRowTablet,
  itemsPerRowMobile,
  aspectRatio,
  ...props
}: Props) {
  const categoryIds = categoryItems.map(({ entityId }) => entityId ?? '');

  if (categoryIds.length === 0) {
    return (
      <div className={className}>
        <div className="my-5 py-10 text-center text-lg text-gray-500">
          <p>Please Start Adding Categories</p>
        </div>
      </div>
    );
  }

  const { categories, isLoading } = useCategoriesByIds({
    categoryIds,
  });

  if (isLoading) {
    return <CategoryGridItemSkeleton className={className} />;
  }

  if (categories == null || categories.length === 0) {
    return <CategoryGridItemSkeleton className={className} />;
  }

  return (
    <div className={className}>
      <div
        className={[
          'grid gap-4',
          gridColsClass('', itemsPerRowMobile),
          gridColsClass('sm:', itemsPerRowMobile),
          gridColsClass('md:', itemsPerRowTablet),
          gridColsClass('lg:', itemsPerRowDesktop),
          gridColsClass('xl:', itemsPerRowSuperDesktop),
        ].join(' ')}
      >
        {categories.map(async (category) => {
          return (
            <p>{category.name}</p>
            // <ProductCard
            //   key={product.id}
            //   className={className}
            //   image={product.image}
            //   name={product.title}
            //   rating={product.rating}
            //   reviewCount={product.reviewCount}
            //   price={price}
            //   salePrice={salePrice}
            //   badge={customProductSettings?.badge}
            //   aspectRatio={aspectRatio}
            //   showReviews={showReviews}
            //   href={product.href}
            //   id={product.id}
            //   {...props}
            // />
          );
        })}
      </div>
    </div>
  );
}

export function CategoryGridItemSkeleton({
  className,
  aspectRatio = '5:6',
}: {
  className?: string;
  aspectRatio?: string;
}) {
  return (
    <Skeleton.Root className={clsx(className)}>
      <Skeleton.Box
        className={clsx(
          'rounded-[var(--product-card-border-radius,1rem)]',
          {
            '5:6': 'aspect-[5/6]',
            '3:4': 'aspect-[3/4]',
            '1:1': 'aspect-square',
          }[aspectRatio],
        )}
      />
    </Skeleton.Root>
  );
}

runtime.registerComponent(MakeswiftCategoryGridGIT, {
  type: 'catalog-category-grid-git',
  label: 'GIT / Category Grid (GIT)',
  props: {
    className: Style(),
    categoryItems: List({
      label: 'Categories',
      type: Group({
        label: 'Category',
        props: {
          entityId: Combobox({
            label: 'Category',
            async getOptions(query) {
              const categories = await searchCategories(query);

              return categories.map((category) => ({
                id: category.category_id.toString(),
                label: category.name,
                value: category.category_id.toString(),
              }));
            },
          }),
        },
      }),
      getItemLabel(category) {
        return 'Category';
      },
    }),
    // showProductCount: Checkbox({
    //   label: 'Show Product Count',
    //   defaultValue: true,
    // }),
    aspectRatio: Select({
      label: 'Product Image aspect ratio',
      options: [
        { value: '1:1', label: 'Square' },
        { value: '5:6', label: '5:6' },
        { value: '3:4', label: '3:4' },
      ],
      defaultValue: '1:1',
    }),
    itemsPerRowSuperDesktop: Select({
      label: 'Items Per Row (Super Desktop)',
      defaultValue: '8',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '6', label: '6' },
        { value: '8', label: '8' },
        { value: '10', label: '10' },
      ],
    }),
    itemsPerRowDesktop: Select({
      label: 'Items Per Row (Desktop)',
      defaultValue: '6',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '6', label: '6' },
        { value: '8', label: '8' },
        { value: '10', label: '10' },
      ],
    }),
    itemsPerRowTablet: Select({
      label: 'Items Per Row (Tablet)',
      defaultValue: '4',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '6', label: '6' },
        { value: '8', label: '8' },
        { value: '10', label: '10' },
      ],
    }),
    itemsPerRowMobile: Select({
      label: 'Items Per Row (Mobile)',
      defaultValue: '2',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '6', label: '6' },
        { value: '8', label: '8' },
        { value: '10', label: '10' },
      ],
    }),
  },
});
