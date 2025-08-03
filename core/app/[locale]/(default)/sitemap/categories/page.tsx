import { cache } from 'react';
import { getSiteMapCategoriesData } from './page-data';
import { client, Page } from '~/lib/makeswift';

interface Props {}

const siteMapCategoriesDataCache = cache(async (): Promise<any> => {
  const categories = await getSiteMapCategoriesData();

  return categories;
});

export default async function VisualSiteMap(props: Props) {
  const categories = await siteMapCategoriesDataCache();

  // Recursive category rendering
  const renderCategories = (categories: any[]) => (
    <ul>
      {categories.map((category: any) => (
        <li key={category.id || category.path}>
          <a className="underline" href={category.path}>
            {category.name}
          </a>
          {category.children && category.children.length > 0 && (
            <div className="ml-4">{renderCategories(category.children)}</div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 @container @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
      <h1 className="text-3xl font-bold">Visual Site Map (Categories)</h1>
      <div className="mt-4">
        <hr className="mb-4 mt-4" />
        <h2 className="text-2xl font-semibold">Categories</h2>
        {renderCategories(categories)}
        <hr className="mb-4 mt-4" />
      </div>
    </div>
  );
}
