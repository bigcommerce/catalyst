'use client';

import { Combobox, Group, Select, Style, Checkbox } from '@makeswift/runtime/controls';

import { runtime, breakpoints } from '~/lib/makeswift/runtime';
import { ProductCardSkeleton } from '~/vibes/soul/primitives/product-card';

import { searchProducts } from '../../utils/search-products';
import { useProductsByIds } from '../../utils/fetch-products';
import { Price } from '@/vibes/soul/primitives/price-label';
import clsx from 'clsx';
import {
  CategoryGridCard,
  CategoryGridItemSkeleton,
} from '../category-grid-git/category-grid-git.makeswift';
import { searchCategories } from '../../utils/search-categories';
import { ProductCard } from '@/vibes/soul/primitives/product-card-git';
import { useCategoriesByIds } from '../../utils/fetch-categories';
import dynamic from 'next/dynamic';

import 'react-multi-carousel/lib/styles.css';

const Carousel = dynamic(() => import('react-multi-carousel'), { ssr: true });

interface Props {
  className?: string;
  productEntityOne: ProductInterface;
  productEntityTwo: ProductInterface;
  productEntityThree: ProductInterface;
  productEntityFour: ProductInterface;
  categoryEntity: CategoryInterface;
  showReviews: boolean;
  aspectRatio?: '1:1' | '5:6' | '3:4';
}

interface ProductInterface {
  entityId?: string;
}

interface CategoryInterface {
  entityId?: string;
}

const PlaceholderSkeletons: React.FC<{
  mobileColumns: number;
  tabletColumns: number;
  desktopColumns: number;
  className?: string;
}> = ({ mobileColumns, tabletColumns, desktopColumns, className }) => {
  return (
    <div
      className={clsx(
        'grid gap-5',
        `grid-cols-${mobileColumns}`, // mobile: 1 columns
        `sm:grid-cols-${tabletColumns}`, // tablet: 1 columns
        `lg:grid-cols-${desktopColumns}`, // desktop: 5 columns
        `xl:grid-cols-${desktopColumns}`, // super desktop: 5 columns
        className,
      )}
    >
      <CategoryGridItemSkeleton className={className} />
      {Array.from({ length: 4 }).map((_, index) => (
        <ProductCardSkeleton key={index} className={className} />
      ))}
    </div>
  );
};

function MakeswiftFeaturedProductsGridGIT({
  className,
  productEntityOne,
  productEntityFour,
  productEntityThree,
  productEntityTwo,
  categoryEntity,
  aspectRatio,
  showReviews,
  ...props
}: Props) {
  const productIds = [
    productEntityOne,
    productEntityTwo,
    productEntityThree,
    productEntityFour,
  ].map(({ entityId }) => entityId ?? '');

  const mobileColumns = 1,
    tabletColumns = 1,
    desktopColumns = 5;

  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: breakpoints.screen.width }, // XL and above
      items: 4,
      showDots: false,
      swipeable: false,
      draggable: false,
      infinite: false,
    },
    desktop: {
      breakpoint: { max: breakpoints.screen.width, min: breakpoints.large.width }, // 1280–1024
      items: 4,
      showDots: false,
      swipeable: false,
      draggable: false,
      infinite: false,
    },
    tablet: {
      breakpoint: { max: breakpoints.large.width, min: breakpoints.small.width }, // 1024–640
      items: 2,
      showDots: true,
      swipeable: true,
      draggable: true,
      infinite: true,
    },
    mobile: {
      breakpoint: { max: breakpoints.small.width, min: 0 }, // <640
      items: 1,
      showDots: true,
      swipeable: true,
      draggable: true,
      infinite: true,
    },
  };

  if (productIds.length === 0 || categoryEntity == null || !categoryEntity.entityId) {
    return (
      <div className={className}>
        <div className="my-5 py-10 text-center text-lg text-gray-500">
          <p>Please Start Adding Category & Products</p>
        </div>
      </div>
    );
  }

  const { products, isLoading } = useProductsByIds({
    productIds,
  });

  const { categories, isLoading: isLoadingCategory } = useCategoriesByIds({
    categoryIds: [categoryEntity.entityId],
  });

  const category = categories?.[0];

  if (isLoading || isLoadingCategory) {
    return (
      <PlaceholderSkeletons
        mobileColumns={mobileColumns}
        tabletColumns={tabletColumns}
        desktopColumns={desktopColumns}
        className={className}
      />
    );
  }

  if (products == null || category == null || products.length === 0 || categoryEntity == null) {
    return (
      <PlaceholderSkeletons
        mobileColumns={mobileColumns}
        tabletColumns={tabletColumns}
        desktopColumns={desktopColumns}
        className={className}
      />
    );
  }

  return (
    <div
      className={clsx(
        'grid gap-5',
        `grid-cols-${mobileColumns}`, // mobile: 1 columns
        `sm:grid-cols-${tabletColumns}`, // tablet: 1 columns
        `lg:grid-cols-${desktopColumns}`, // desktop: 5 columns
        `xl:grid-cols-${desktopColumns}`, // super desktop: 5 columns
        className,
      )}
    >
      <div className={clsx('grid lg:col-span-1 xl:col-span-1')}>
        <CategoryGridCard
          id={category.id.toString()}
          name={category.name}
          href={category.path}
          imageUrl={category.image}
          productCount={category.productCount}
          fullHeight={true}
        />
      </div>
      <div className={clsx('lg:col-span-4 xl:col-span-4', 'featured-category-carousel-container')}>
        {products.length > 0 ? (
          <Carousel
            swipeable={false}
            draggable={false}
            showDots={true}
            arrows={false}
            responsive={responsive}
            ssr={true} // means to render carousel on server-side.
            deviceType={'desktop'} // This is important for SSR. It should match the device type you want to render.
            autoPlaySpeed={1 * 1000} // Convert seconds to milliseconds
            //keyBoardControl={keyBoardControl}
            customTransition="all 1000ms"
            transitionDuration={1000}
            centerMode={true}
            containerClass="carousel-container"
            removeArrowOnDeviceType={['desktop', 'superLargeDesktop']}
            dotListClass="custom-dot-list-style lg:!hidden"
            itemClass="carousel-item-padding-40-px px-2"
            className={``}
          >
            {products.map((product) => {
              const { price, salePrice } = handlePrice(product.price);

              const badgeOptions = {
                show: false,
                text: '',
                theme: 'primary',
                shape: 'pill',
                location: 'top-right',
              };

              return (
                <ProductCard
                  key={product.id}
                  className={`h-full`}
                  image={product.image}
                  name={product.title}
                  // @ts-ignore
                  rating={product.rating as number}
                  // @ts-ignore
                  reviewCount={product.reviewCount as number}
                  price={price}
                  badge={badgeOptions}
                  showReviews={showReviews}
                  salePrice={salePrice}
                  aspectRatio={aspectRatio}
                  href={product.href}
                  id={product.id}
                  buttonText="Add To Cart"
                  {...props}
                />
              );
            })}
          </Carousel>
        ) : null}
      </div>
    </div>
  );
}

const handlePrice = (productPrice: Price | undefined) => {
  let price;
  let salePrice: string | undefined = undefined;
  if (!productPrice) {
    price = '0';
  } else if (typeof productPrice === 'string') {
    price = productPrice;
  } else if (
    typeof productPrice === 'object' &&
    productPrice !== null &&
    'minValue' in productPrice
  ) {
    price = `${productPrice.minValue} - ${productPrice.maxValue}`;
  } else if (
    typeof productPrice === 'object' &&
    productPrice !== null &&
    'previousValue' in productPrice
  ) {
    price = productPrice.previousValue;
    salePrice = productPrice.currentValue;
  }

  return {
    price,
    salePrice: salePrice ? salePrice.toString() : undefined,
  };
};

runtime.registerComponent(MakeswiftFeaturedProductsGridGIT, {
  type: 'catalog-category-featured-git',
  label: 'GIT / Featured Category (GIT)',
  props: {
    className: Style(),
    productEntityOne: Group({
      label: 'Product One',
      props: {
        entityId: Combobox({
          label: 'Product One',
          async getOptions(query) {
            const products = await searchProducts(query);

            return products.map((product) => ({
              id: product.entityId.toString(),
              label: product.name,
              value: product.entityId.toString(),
            }));
          },
        }),
      },
    }),
    productEntityTwo: Group({
      label: 'Product Two',
      props: {
        entityId: Combobox({
          label: 'Product Two',
          async getOptions(query) {
            const products = await searchProducts(query);

            return products.map((product) => ({
              id: product.entityId.toString(),
              label: product.name,
              value: product.entityId.toString(),
            }));
          },
        }),
      },
    }),
    productEntityThree: Group({
      label: 'Product Three',
      props: {
        entityId: Combobox({
          label: 'Product Three',
          async getOptions(query) {
            const products = await searchProducts(query);

            return products.map((product) => ({
              id: product.entityId.toString(),
              label: product.name,
              value: product.entityId.toString(),
            }));
          },
        }),
      },
    }),
    productEntityFour: Group({
      label: 'Product Four',
      props: {
        entityId: Combobox({
          label: 'Product Four',
          async getOptions(query) {
            const products = await searchProducts(query);

            return products.map((product) => ({
              id: product.entityId.toString(),
              label: product.name,
              value: product.entityId.toString(),
            }));
          },
        }),
      },
    }),
    categoryEntity: Group({
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
    showReviews: Checkbox({
      label: 'Show Product Reviews',
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
  },
});
