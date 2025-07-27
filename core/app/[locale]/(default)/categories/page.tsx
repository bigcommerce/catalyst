import type { Metadata } from 'next';
import { getCategoriesData } from './page-data';
import { SectionLayout } from '@/vibes/soul/sections/section-layout';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { CategoryCard } from '@/vibes/soul/sections/products-list-section/filters-panel';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Categories',
    description: 'Explore our diverse range of categories offering quality products.',
  };
}

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function BrandsPage(props: Props) {
  const { locale } = await props.params;

  setRequestLocale(locale);

  // Fetch categories data
  const categories = await getCategoriesData();

  if (categories.length === 0) {
    return notFound();
  }

  return (
    <SectionLayout
      hideOverflow={true}
      paddingOptionsLargeDesktop="px-8 py-8"
      paddingOptionsDesktop="px-6  py-6"
      paddingOptionsTablet="px-4 py-4"
      paddingOptionsMobile="px-2 py-2"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-6">
        {categories.map((category) => (
          <CategoryCard
            href={category.path}
            key={category.path}
            title={category.name}
            imageUrl={category.image?.url || ''}
            productCount={category.productCount}
          />
        ))}
      </div>
    </SectionLayout>
  );
}
