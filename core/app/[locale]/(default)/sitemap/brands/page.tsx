import { cache } from 'react';
import { getSiteMapBrandsData } from './page-data';

interface Props {}

const siteMapBrandsDataCache = cache(async (): Promise<any> => {
  const brands = await getSiteMapBrandsData();

  return brands;
});

export default async function VisualSiteMap(props: Props) {
  const brands = await siteMapBrandsDataCache();

  return (
    <div className="mx-auto w-full max-w-screen-2xl px-4 py-10 @container @xl:px-6 @xl:py-14 @4xl:px-8 @4xl:py-20">
      <h1 className="text-3xl font-bold">Visual Site Map (Brands)</h1>
      <div className="mt-4">
        <hr className="mb-4 mt-4" />
        <h2 className="text-2xl font-semibold">Brands</h2>
        <ul>
          {brands.map((brand: any) => (
            <li className="underline" key={brand.id}>
              <a href={brand.path}>{brand.name}</a>
            </li>
          ))}
        </ul>
        <hr className="mb-4 mt-4" />
      </div>
    </div>
  );
}
