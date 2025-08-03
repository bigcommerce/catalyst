import { cache } from 'react';
import { getSiteMapData } from './page-data';
import { client, Page } from '~/lib/makeswift';

interface Props {}

const siteMapData = cache(async (): Promise<any> => {
  const { brands, categories } = await getSiteMapData();

  return {
    brands,
    categories,
  };
});

export default async function VisualSiteMap(props: Props) {
  const data = await siteMapData();
  let pages = await client
    .getPages({
      locale: 'en',
    })
    .toArray();

  pages = pages.filter((page) => page.isOnline);

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
      <h1 className="text-3xl font-bold">Visual Site Map</h1>
      <div className="mt-4">
        <h2 className="text-2xl font-semibold">Pages</h2>
        {pages.map((page) => (
          <li className="underline" key={page.id}>
            <a href={page.path}>
              {page.title
                ? page.title
                : (() => {
                    const name = page.path
                      .split('/')
                      [page.path.split('/').length - 1]?.replaceAll('-', ' ');
                    return name ? name.charAt(0).toUpperCase() + name.slice(1) : '';
                  })()}
            </a>
          </li>
        ))}

        <hr className="mb-4 mt-4" />
        <h2 className="text-2xl font-semibold">Categories</h2>
        {renderCategories(data.categories)}
        <li className="underline">
          <a href={'/sitemap/categories'}>View All</a>
        </li>
        <hr className="mb-4 mt-4" />
        <h2 className="text-2xl font-semibold">Brands</h2>
        <ul>
          {data.brands.map((brand: any) => (
            <li className="underline" key={brand.id}>
              <a href={brand.path}>{brand.name}</a>
            </li>
          ))}
          <li className="underline">
            <a href={'/sitemap/brands'}>View All</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
