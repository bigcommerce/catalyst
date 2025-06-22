'use client';

import {
  Checkbox,
  Combobox,
  Group,
  List,
  Select,
  Style,
  TextInput,
} from '@makeswift/runtime/controls';

import { runtime } from '~/lib/makeswift/runtime';
import { ProductCardSkeleton } from '~/vibes/soul/primitives/product-card';
import { ProductCard } from '~/vibes/soul/primitives/product-card-git';

import { searchProducts } from '../../utils/search-products';
import { useProductsByIds } from '../../utils/fetch-products';
import { searchCategories } from '../../utils/search-categories';

interface Props {
  className?: string;
  categoryItems: CategoryInterface[];
  itemsPerRowSuperDesktop: string;
  itemsPerRowDesktop: string;
  itemsPerRowTablet: string;
  itemsPerRowMobile: string;
  aspectRatio?: '1:1' | '5:6' | '3:4';
  showProductCount?: boolean;
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
  showProductCount,
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

  const isLoading = true;

  // const { categories, isLoading } = useProductsByIds({
  //   categoryIds,
  // });

  if (isLoading) {
    return <ProductCardSkeleton className={className} />;
  }

  // if (categories == null || categories.length === 0) {
  //   return <ProductCardSkeleton className={className} />;
  // }

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
        {/* {categories.map(async (category) => {
          return (
            <p>{category.entityId}</p>
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
        })} */}
      </div>
    </div>
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
    showProductCount: Checkbox({
      label: 'Show Product Count',
      defaultValue: true,
    }),
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
