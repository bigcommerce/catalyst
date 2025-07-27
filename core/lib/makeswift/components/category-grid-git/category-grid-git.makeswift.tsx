'use client';

import { Combobox, Group, List, Select, Style } from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';

import * as Skeleton from '@/vibes/soul/primitives/skeleton';

import { searchCategories } from '../../utils/search-categories';
import clsx from 'clsx';
import { useCategoriesByIds } from '../../utils/fetch-categories';
import { Link } from '~/components/link';
import { Image } from '~/components/image';

interface Props {
  className?: string;
  categoryItems: CategoryInterface[];
  itemsPerRowSuperDesktop: string;
  itemsPerRowDesktop: string;
  itemsPerRowTablet: string;
  itemsPerRowMobile: string;
}

interface CategoryInterface {
  entityId?: string;
}

function MakeswiftCategoryGridGIT({
  className,
  categoryItems,
  itemsPerRowDesktop,
  itemsPerRowSuperDesktop,
  itemsPerRowTablet,
  itemsPerRowMobile,
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
  const skeletonCount = Number(itemsPerRowDesktop) || 6; // fallback to 6 if invalid
  const skeletons = Array.from({ length: skeletonCount });

  const { categories, isLoading } = useCategoriesByIds({
    categoryIds,
  });

  if (isLoading) {
    return (
      <div
        className={clsx(
          'grid gap-5',
          `grid-cols-${itemsPerRowMobile}`, // mobile: 2 columns
          `sm:grid-cols-${itemsPerRowTablet}`, // tablet: 4 columns
          `lg:grid-cols-${itemsPerRowDesktop}`, // desktop: 6 columns
          `xl:grid-cols-${itemsPerRowSuperDesktop}`, // super desktop: 8 columns
          className,
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <CategoryGridItemSkeleton key={index} className={className} />
        ))}
      </div>
    );
  }

  if (categories == null || categories.length === 0) {
    return (
      <div
        className={clsx(
          'grid gap-5',
          `grid-cols-${itemsPerRowMobile}`, // mobile: 2 columns
          `sm:grid-cols-${itemsPerRowTablet}`, // tablet: 4 columns
          `lg:grid-cols-${itemsPerRowDesktop}`, // desktop: 6 columns
          `xl:grid-cols-${itemsPerRowSuperDesktop}`, // super desktop: 8 columns
          className,
        )}
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <CategoryGridItemSkeleton key={index} className={className} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'grid gap-5',
        `grid-cols-${itemsPerRowMobile}`, // mobile: 2 columns
        `sm:grid-cols-${itemsPerRowTablet}`, // tablet: 4 columns
        `lg:grid-cols-${itemsPerRowDesktop}`, // desktop: 6 columns
        `xl:grid-cols-${itemsPerRowSuperDesktop}`, // super desktop: 8 columns
        className,
      )}
    >
      {categories.map(async (category) => {
        return (
          <CategoryGridCard
            key={category.id}
            id={category.id.toString()}
            name={category.name}
            href={category.path}
            imageUrl={category.image}
            productCount={category.productCount}
          />
        );
      })}
    </div>
  );
}

interface CategoryGridCardProps {
  name: string;
  href: string;
  id: string;
  imageUrl?: string;
  productCount: number;
  imagePriority?: boolean;
  imageSizes?: string;
  fullHeight?: boolean;
}

export function CategoryGridCard({
  href,
  id,
  imageUrl,
  name,
  productCount,
  imagePriority = false,
  fullHeight = false,
  imageSizes = '(min-width: 80rem) 20vw, (min-width: 64rem) 25vw, (min-width: 42rem) 33vw, (min-width: 24rem) 50vw, 100vw',
}: CategoryGridCardProps) {
  return (
    <Link aria-label={name} href={href} id={id}>
      {/* Image */}
      <div
        className={`group relative ${fullHeight ? 'h-full' : 'h-48'} w-full cursor-pointer overflow-hidden rounded-md shadow-md`}
      >
        {imageUrl ? (
          <Image
            alt={name}
            className={clsx(
              'bg-[var(--product-card-light-background,hsl(var(--contrast-100))] w-full scale-100 select-none object-cover transition-transform duration-500 ease-out group-hover:scale-110',
            )}
            fill
            priority={imagePriority}
            sizes={imageSizes}
            src={imageUrl}
          />
        ) : (
          <div className="h-full w-full" style={{ backgroundColor: '#304A7A' }} />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-40 transition duration-300 group-hover:bg-opacity-50" />
        <div className="absolute bottom-4 left-4 z-10 text-white">
          <h3 className="text-lg font-semibold">{name}</h3>
          {/* <p className="text-sm">{productCount} products</p> */}
        </div>
      </div>
    </Link>
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
    itemsPerRowSuperDesktop: Select({
      label: 'Items Per Row (Super Desktop)',
      defaultValue: '8',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
        { value: '4', label: '4' },
        { value: '5', label: '5' },
        { value: '6', label: '6' },
        { value: '7', label: '7' },
        { value: '8', label: '8' },
        { value: '9', label: '9' },
        { value: '10', label: '10' },
        { value: '11', label: '11' },
        { value: '12', label: '12' },
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
        { value: '5', label: '5' },
        { value: '6', label: '6' },
        { value: '7', label: '7' },
        { value: '8', label: '8' },
        { value: '9', label: '9' },
        { value: '10', label: '10' },
        { value: '11', label: '11' },
        { value: '12', label: '12' },
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
        { value: '5', label: '5' },
        { value: '6', label: '6' },
        { value: '7', label: '7' },
        { value: '8', label: '8' },
        { value: '9', label: '9' },
        { value: '10', label: '10' },
        { value: '11', label: '11' },
        { value: '12', label: '12' },
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
        { value: '5', label: '5' },
        { value: '6', label: '6' },
        { value: '7', label: '7' },
        { value: '8', label: '8' },
        { value: '9', label: '9' },
        { value: '10', label: '10' },
        { value: '11', label: '11' },
        { value: '12', label: '12' },
      ],
    }),
  },
});
