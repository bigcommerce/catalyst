import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { ProductCard } from '~/components/product-card';
import { Pagination } from '~/components/ui/pagination';

import { FacetedSearch } from '../../_components/faceted-search';
import { MobileSideNav } from '../../_components/mobile-side-nav';
import { SortBy } from '../../_components/sort-by';
import { fetchFacetedSearch } from '../../fetch-faceted-search';

import { getSessionCustomerAccessToken } from '~/auth';

import { Breadcrumbs } from '~/components/breadcrumbs';

import Link from 'next/link';
import Image from 'next/image';
import logo from '~/public/brand/logo.svg';

import image1_1 from '~/public/brand/image1-1.svg';
import image1_2 from '~/public/brand/image1-2.svg';
import image1_3 from '~/public/brand/image1-3.svg';
import image1_4 from '~/public/brand/image1-4.svg';
import image1_5 from '~/public/brand/image1-5.svg';

import image2_1 from '~/public/brand/image2-1.svg';
import image2_2 from '~/public/brand/image2-2.svg';
import image2_3 from '~/public/brand/image2-3.svg';
import image2_4 from '~/public/brand/image2-4.svg';
import image2_5 from '~/public/brand/image2-5.svg';

import image1 from '~/public/brand/image1.svg';
import image2 from '~/public/brand/image2.svg';

import { getBrand } from './page-data';

import { getPromotions } from '../../fetch-promotions';

import { Brand } from './brand';

import { Page as MakeswiftPage } from '@makeswift/runtime/next';
import { getSiteVersion } from '@makeswift/runtime/next/server';
import { defaultLocale } from '~/i18n/routing';
import { client } from '~/lib/makeswift/client';
import '~/lib/makeswift/components';

interface Props {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const brandId = Number(params.slug);
  const brand = await getBrand({ entityId: brandId });

  if (!brand) {
    return notFound();
  }

  const { pageTitle, metaDescription, metaKeywords } = brand.seo;

  return {
    title: pageTitle || brand.name,
    description: metaDescription,
    keywords: metaKeywords ? metaKeywords.split(',') : null,
  };
}

export default async function BrandPage(props: Props) {
  const searchParams = await props.searchParams;
  const params = await props.params;

  const customerAccessToken = await getSessionCustomerAccessToken();
  const useDefaultPrices = !customerAccessToken;

  const { slug, locale } = params;

  setRequestLocale(locale);

  const t = await getTranslations('Brand');

  const brandId = Number(slug);

  const brand = await getBrand({ entityId: brandId });

  if (!brand) {
    notFound();
  }

  const snapshot = await client.getPageSnapshot(brand.path, {
    siteVersion: await getSiteVersion(),
    locale: locale === defaultLocale ? undefined : locale,
  });

  const promotions = await getPromotions();
  const hasExtendedContent = false;

  return (
    <div className="group py-4 px-4 xl:px-12">
      <Breadcrumbs
        category={{ breadcrumbs: { edges: [{ node: { name: brand.name, path: brand.path } }] } }}
      />

      {brand.defaultImage && brand.defaultImage.urlOriginal ? (
        <section className="mt-8 bg-gray-50 px-4 py-8 text-center md:mb-8">
          <img
            src={brand.defaultImage.urlOriginal}
            alt={brand.name}
            className="mx-auto h-16 w-auto"
          />
          <div className="mt-4 inline-flex flex-wrap items-center justify-center gap-4">
            <Link href={`/search?brand_name[0]=${encodeURIComponent(brand?.name ?? '')}`} className="flex space-x-2 rounded bg-brand-700 px-4 py-2 uppercase text-white">
              <span>Shop All {brand.name}</span>
            </Link>
            <Link href={`/search?brand_name[0]=${encodeURIComponent(brand?.name ?? '')}&is_new=true`} className="flex space-x-2 rounded bg-brand-400 px-4 py-2 uppercase text-white">
              <svg
                width="21"
                height="20"
                viewBox="0 0 21 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.83745 19.8509L5.46245 12.8259L0.0124512 8.10088L7.21245 7.47588L10.0125 0.850876L12.8125 7.47588L20.0125 8.10088L14.5625 12.8259L16.1875 19.8509L10.0125 16.1259L3.83745 19.8509Z"
                  fill="white"
                />
              </svg>
              <span>New Products</span>
            </Link>
            <Link href={`/search?brand_name[0]=${encodeURIComponent(brand?.name ?? '')}&on_sale=true`} className="flex space-x-2 rounded bg-brand-400 px-4 py-2 uppercase text-white">
              <svg
                width="20"
                height="21"
                viewBox="0 0 20 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.16245 20.3509C8.91245 20.3509 8.66245 20.3009 8.41245 20.2009C8.16245 20.1009 7.93745 19.9509 7.73745 19.7509L0.587451 12.6009C0.387451 12.4009 0.241618 12.18 0.149951 11.9384C0.0582845 11.6967 0.0124512 11.4509 0.0124512 11.2009C0.0124512 10.9509 0.0582845 10.7009 0.149951 10.4509C0.241618 10.2009 0.387451 9.97588 0.587451 9.77588L9.38745 0.950876C9.57078 0.767543 9.78745 0.621709 10.0375 0.513376C10.2875 0.405043 10.5458 0.350876 10.8125 0.350876H17.9875C18.5375 0.350876 19.0083 0.546709 19.4 0.938376C19.7916 1.33004 19.9875 1.80088 19.9875 2.35088V9.52588C19.9875 9.79254 19.9375 10.0467 19.8375 10.2884C19.7375 10.53 19.5958 10.7425 19.4125 10.9259L10.5875 19.7509C10.3875 19.9509 10.1625 20.1009 9.91245 20.2009C9.66245 20.3009 9.41245 20.3509 9.16245 20.3509ZM15.4875 6.35088C15.9041 6.35088 16.2583 6.20504 16.55 5.91338C16.8416 5.62171 16.9875 5.26754 16.9875 4.85088C16.9875 4.43421 16.8416 4.08004 16.55 3.78838C16.2583 3.49671 15.9041 3.35088 15.4875 3.35088C15.0708 3.35088 14.7166 3.49671 14.425 3.78838C14.1333 4.08004 13.9875 4.43421 13.9875 4.85088C13.9875 5.26754 14.1333 5.62171 14.425 5.91338C14.7166 6.20504 15.0708 6.35088 15.4875 6.35088Z"
                  fill="white"
                />
              </svg>
              <span>Sale</span>
            </Link>
          </div>
        </section>
      ) : (
        <div className="md:mb-8 lg:flex lg:flex-row lg:items-center lg:justify-between">
          <h1 className="mb-4 text-4xl font-black lg:mb-0 lg:text-5xl">{brand.name}</h1>
        </div>
      )}

      {!!snapshot &&
        <MakeswiftPage snapshot={snapshot} />
      }

      {hasExtendedContent && (
        <>
          <section className="mt-16">
            <h3 className="text-lg font-medium">Section Title</h3>

            <div className="relative mt-4 w-full overflow-x-hidden">
              <ul className="flex space-x-4">
                <li key="1" className="w-60">
                  <Image src={image1_1} alt="Image 1" className="w-full" />
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <span className="uppercase">Category Name</span>
                    <svg
                      width="8"
                      height="13"
                      viewBox="0 0 8 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.90005 6.35089L0.300049 1.75089L1.70005 0.350891L7.70005 6.35089L1.70005 12.3509L0.300049 10.9509L4.90005 6.35089Z"
                        fill="#1C1B1F"
                      />
                    </svg>
                  </div>
                </li>
                <li key="2" className="w-60">
                  <Image src={image1_2} alt="Image 2" className="w-full" />
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <span className="uppercase">Category Name</span>
                    <svg
                      width="8"
                      height="13"
                      viewBox="0 0 8 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.90005 6.35089L0.300049 1.75089L1.70005 0.350891L7.70005 6.35089L1.70005 12.3509L0.300049 10.9509L4.90005 6.35089Z"
                        fill="#1C1B1F"
                      />
                    </svg>
                  </div>
                </li>
                <li key="3" className="w-60">
                  <Image src={image1_3} alt="Image 3" className="w-full" />
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <span className="uppercase">Category Name</span>
                    <svg
                      width="8"
                      height="13"
                      viewBox="0 0 8 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.90005 6.35089L0.300049 1.75089L1.70005 0.350891L7.70005 6.35089L1.70005 12.3509L0.300049 10.9509L4.90005 6.35089Z"
                        fill="#1C1B1F"
                      />
                    </svg>
                  </div>
                </li>
                <li key="4" className="w-60">
                  <Image src={image1_4} alt="Image 4" className="w-full" />
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <span className="uppercase">Category Name</span>
                    <svg
                      width="8"
                      height="13"
                      viewBox="0 0 8 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.90005 6.35089L0.300049 1.75089L1.70005 0.350891L7.70005 6.35089L1.70005 12.3509L0.300049 10.9509L4.90005 6.35089Z"
                        fill="#1C1B1F"
                      />
                    </svg>
                  </div>
                </li>
                <li key="5" className="w-60">
                  <Image src={image1_5} alt="Image 5" className="w-full" />
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <span className="uppercase">Category Name</span>
                    <svg
                      width="8"
                      height="13"
                      viewBox="0 0 8 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.90005 6.35089L0.300049 1.75089L1.70005 0.350891L7.70005 6.35089L1.70005 12.3509L0.300049 10.9509L4.90005 6.35089Z"
                        fill="#1C1B1F"
                      />
                    </svg>
                  </div>
                </li>
                <li key="6" className="w-60">
                  <Image src={image1_1} alt="Image 1" className="w-full" />
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <span className="uppercase">Category Name</span>
                    <svg
                      width="8"
                      height="13"
                      viewBox="0 0 8 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.90005 6.35089L0.300049 1.75089L1.70005 0.350891L7.70005 6.35089L1.70005 12.3509L0.300049 10.9509L4.90005 6.35089Z"
                        fill="#1C1B1F"
                      />
                    </svg>
                  </div>
                </li>
                <li key="7" className="w-60">
                  <Image src={image1_2} alt="Image 2" className="w-full" />
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <span className="uppercase">Category Name</span>
                    <svg
                      width="8"
                      height="13"
                      viewBox="0 0 8 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.90005 6.35089L0.300049 1.75089L1.70005 0.350891L7.70005 6.35089L1.70005 12.3509L0.300049 10.9509L4.90005 6.35089Z"
                        fill="#1C1B1F"
                      />
                    </svg>
                  </div>
                </li>
              </ul>
              <button
                type="button"
                title="Next"
                className="absolute right-4 top-1/2 -mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white"
              >
                <svg
                  width="8"
                  height="13"
                  viewBox="0 0 8 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.90005 6.35089L0.300049 1.75089L1.70005 0.350891L7.70005 6.35089L1.70005 12.3509L0.300049 10.9509L4.90005 6.35089Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </section>

          <section className="mt-16">
            <h3 className="text-lg font-medium">Section Title</h3>

            <div className="relative mt-4 w-full overflow-x-hidden">
              <ul className="flex space-x-4">
                <li key="1" className="w-60">
                  <Image src={image2_1} alt="Image 1" className="w-full" />
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <span className="uppercase">Category Name</span>
                    <svg
                      width="8"
                      height="13"
                      viewBox="0 0 8 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.90005 6.35089L0.300049 1.75089L1.70005 0.350891L7.70005 6.35089L1.70005 12.3509L0.300049 10.9509L4.90005 6.35089Z"
                        fill="#1C1B1F"
                      />
                    </svg>
                  </div>
                </li>
                <li key="2" className="w-60">
                  <Image src={image2_2} alt="Image 2" className="w-full" />
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <span className="uppercase">Category Name</span>
                    <svg
                      width="8"
                      height="13"
                      viewBox="0 0 8 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.90005 6.35089L0.300049 1.75089L1.70005 0.350891L7.70005 6.35089L1.70005 12.3509L0.300049 10.9509L4.90005 6.35089Z"
                        fill="#1C1B1F"
                      />
                    </svg>
                  </div>
                </li>
                <li key="3" className="w-60">
                  <Image src={image2_3} alt="Image 3" className="w-full" />
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <span className="uppercase">Category Name</span>
                    <svg
                      width="8"
                      height="13"
                      viewBox="0 0 8 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.90005 6.35089L0.300049 1.75089L1.70005 0.350891L7.70005 6.35089L1.70005 12.3509L0.300049 10.9509L4.90005 6.35089Z"
                        fill="#1C1B1F"
                      />
                    </svg>
                  </div>
                </li>
                <li key="4" className="w-60">
                  <Image src={image2_4} alt="Image 4" className="w-full" />
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <span className="uppercase">Category Name</span>
                    <svg
                      width="8"
                      height="13"
                      viewBox="0 0 8 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.90005 6.35089L0.300049 1.75089L1.70005 0.350891L7.70005 6.35089L1.70005 12.3509L0.300049 10.9509L4.90005 6.35089Z"
                        fill="#1C1B1F"
                      />
                    </svg>
                  </div>
                </li>
                <li key="5" className="w-60">
                  <Image src={image2_5} alt="Image 5" className="w-full" />
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <span className="uppercase">Category Name</span>
                    <svg
                      width="8"
                      height="13"
                      viewBox="0 0 8 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.90005 6.35089L0.300049 1.75089L1.70005 0.350891L7.70005 6.35089L1.70005 12.3509L0.300049 10.9509L4.90005 6.35089Z"
                        fill="#1C1B1F"
                      />
                    </svg>
                  </div>
                </li>
                <li key="6" className="w-60">
                  <Image src={image2_1} alt="Image 1" className="w-full" />
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <span className="uppercase">Category Name</span>
                    <svg
                      width="8"
                      height="13"
                      viewBox="0 0 8 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.90005 6.35089L0.300049 1.75089L1.70005 0.350891L7.70005 6.35089L1.70005 12.3509L0.300049 10.9509L4.90005 6.35089Z"
                        fill="#1C1B1F"
                      />
                    </svg>
                  </div>
                </li>
                <li key="7" className="w-60">
                  <Image src={image2_2} alt="Image 2" className="w-full" />
                  <div className="mt-2 flex items-center justify-center space-x-2">
                    <span className="uppercase">Category Name</span>
                    <svg
                      width="8"
                      height="13"
                      viewBox="0 0 8 13"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M4.90005 6.35089L0.300049 1.75089L1.70005 0.350891L7.70005 6.35089L1.70005 12.3509L0.300049 10.9509L4.90005 6.35089Z"
                        fill="#1C1B1F"
                      />
                    </svg>
                  </div>
                </li>
              </ul>
              <button
                type="button"
                title="Next"
                className="absolute right-4 top-1/2 -mt-6 flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white"
              >
                <svg
                  width="8"
                  height="13"
                  viewBox="0 0 8 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4.90005 6.35089L0.300049 1.75089L1.70005 0.350891L7.70005 6.35089L1.70005 12.3509L0.300049 10.9509L4.90005 6.35089Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
            </div>
          </section>

          <section className="mt-16 flex h-48 items-center justify-center bg-gray-50 px-4 py-8 text-center">
            <h3 className="text-lg font-medium">Promotional Content Placeholder</h3>
          </section>

          <section className="mt-16">
            <h3 className="text-lg font-medium">More Ways to Shop</h3>

            <div className="mt-4 flex w-full items-start space-x-4">
              <div className="">
                <Image src={image1} alt="Image 1" className="w-full" />
                <h4 className="text-md mt-4 font-medium">A Title About This Item</h4>
                <p className="mt-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                  pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
                  officia deserunt mollit anim id est laborum.
                </p>
                <p className="mt-2">
                  <a href="#" className="uppercase">
                    Link Here
                  </a>
                </p>
              </div>
              <div className="">
                <Image src={image2} alt="Image 2" className="w-full" />
                <h4 className="text-md mt-4 font-medium">A Title About This Item</h4>
                <p className="mt-2">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                  incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
                  exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute
                  irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
                  pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui
                  officia deserunt mollit anim id est laborum.
                </p>
                <p className="mt-2">
                  <a href="#" className="uppercase">
                    Link Here
                  </a>
                </p>
              </div>
            </div>
          </section>

          <section className="mt-16 flex h-48 items-center justify-center bg-gray-50 px-4 py-8 text-center">
            <h3 className="text-lg font-medium">Promotional Content Placeholder</h3>
          </section>

          <h3 className="mt-16 text-lg font-medium">Products Catalog</h3>
        </>
      )}

      <Brand brand={brand} promotions={promotions} useDefaultPrices={useDefaultPrices} />
    </div>
  );
}

// TODO: Not sure why its not working with this line uncommented... Something needs to be fixed to enable it.
//export const runtime = 'edge';
