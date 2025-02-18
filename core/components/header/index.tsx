import { ShoppingCart, User, Hand } from 'lucide-react';
import { getLocale, getTranslations } from 'next-intl/server';
import { ReactNode, Suspense } from 'react';

import { LayoutQuery } from '~/app/[locale]/(default)/query';
import { getSessionCustomerAccessToken } from '~/auth';
import { client } from '~/client';
import { readFragment } from '~/client/graphql';
import { revalidate } from '~/client/revalidate-target';
import { logoTransformer } from '~/data-transformers/logo-transformer';
import { localeLanguageRegionMap } from '~/i18n/routing';

import { Link } from '../link';
import { Button } from '../ui/button';
import { Dropdown } from '../ui/dropdown';
import { Header as ComponentsHeader } from '../ui/header';

import { logout } from './_actions/logout';
import { CartLink } from './cart';
import { HeaderFragment } from './fragment';
//import { QuickSearch } from './quick-search';
import { AutocompleteSearch } from './autocomplete-search';
import { BcImage } from '../bc-image';
import { imageManagerImageUrl } from '~/lib/store-assets';

import { getPriceMaxRules } from '~/belami/lib/fetch-price-max-rules';
import { isBadUserAgent } from '~/belami/lib/bot-detection';

import { cookies, headers } from 'next/headers';

import { getSessionUserDetails } from '~/auth';
import { get } from 'http';

import personIcon from '~/public/accountIcons/person.svg';
import wavingHandIcon from '~/public/home/handWavingIcon.svg'

interface Props {
  cart: ReactNode;
}

const homeLogoMobile = imageManagerImageUrl('logo-mark.png', '150w');
const homeLogoMobileFirst = imageManagerImageUrl('logo-mark.png', '150w');

import { MakeswiftComponent } from '@makeswift/runtime/next';
import { getSiteVersion } from '@makeswift/runtime/next/server';
import { client as makeswiftClient } from '~/lib/makeswift/client';
import { Props } from '@makeswift/runtime/prop-controllers';

import { MegaMenuContextProvider } from '~/belami/components/mega-menu';

export const Header = async ({ cart }: Props) => {
  const locale = await getLocale();
  const t = await getTranslations('Components.Header');

  const cookieStore = await cookies();
  const priceMaxCookie = cookieStore.get('pmx');
  const priceMaxTriggers = priceMaxCookie?.value 
    ? JSON.parse(atob(priceMaxCookie?.value)) 
    : undefined;

  const headersList = await headers();
  const country = headersList.get('x-vercel-ip-country');
  const region = headersList.get('x-vercel-ip-country-region');
  const ip = headersList.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
  const ua = headersList.get('user-agent') || '';

  const isBot = await isBadUserAgent(ua);
  const isCaliforniaIp = country === 'US' && region === 'CA';

  const customerAccessToken = await getSessionCustomerAccessToken();

  const useDefaultPrices = !customerAccessToken;

  const priceMaxRules = priceMaxTriggers && Object.values(priceMaxTriggers).length > 0 ? await getPriceMaxRules(priceMaxTriggers) : null;  

  const { data: response } = await client.fetch({
    document: LayoutQuery,
    fetchOptions: customerAccessToken ? { cache: 'no-store' } : { next: { revalidate } },
  });

  const data = readFragment(HeaderFragment, response).site;

  /**  To prevent the navigation menu from overflowing, we limit the number of categories to 6.
   To show a full list of categories, modify the `slice` method to remove the limit.
   Will require modification of navigation menu styles to accommodate the additional categories.
   */
  const categoryTree = data.categoryTree.slice(0, 6);

  const links = categoryTree.map(({ name, path, children }) => ({
    label: name,
    href: path,
    groups: children.map((firstChild) => ({
      label: firstChild.name,
      href: firstChild.path,
      links: firstChild.children.map((secondChild) => ({
        label: secondChild.name,
        href: secondChild.path,
      })),
    })),
  }));

  const getCustomerData = await getSessionUserDetails();

  const megaMenuSnapshot = await makeswiftClient.getComponentSnapshot('belami-mega-menu', {
    siteVersion: await getSiteVersion()
  });

  return (
    <ComponentsHeader
      homeLogoMobile={homeLogoMobile}
      homeLogoMobileFirst={homeLogoMobileFirst}
      customerAccessToken={customerAccessToken}
      account={
        <div className="flex items-center">
          {/* Support Dropdown */}
          <Dropdown
            getCustomerData={getCustomerData as any}
            items={[
              { href: '/#', label: 'Existing Order', classNameCss:'block font-normal text-[16px] leading-[32px] tracking-[0.15px] text-[#006380]'},
              { href: '/order-tracking', label: 'Track My Order', classNameCss:'block font-normal text-[14px] leading-[24px] tracking-[0.25px] text-[#353535]'},
              { href: '/returns', label: 'Replace Items', classNameCss:'block font-normal text-[14px] leading-[24px] tracking-[0.25px] text-[#353535]'},
              { href: '/content/help-center', label: 'Visit Our Help Center', classNameCss:'block font-normal text-[14px] leading-[24px] tracking-[0.25px] text-[#353535] mb-[5px]'},
              { href: '/#', label: 'New Orders', classNameCss:'block font-normal text-[16px]leading-[32px] tracking-[0.15px] text-[#006380] '}
            ]}
            from='support'
            trigger={
              <Button
                aria-label={'Support'}
                className="p-3 text-black hover:bg-transparent hover:text-primary"
                variant="subtle"
              >
                {/* <Hand className="mr-2" /> */}

                <BcImage
                  alt="an assortment of brandless products against a blank background"
                  className="mr-2"
                  height={28}
                  priority={true}
                  src={wavingHandIcon}
                  width={28}
                  unoptimized={true}
                />

                {'Support'}
              </Button>
            }
          />

          {/* Account Dropdown */}
          <Dropdown
            getCustomerData={getCustomerData as any}
            from='account-dropdown'
            items={
              customerAccessToken
                ? [
                  { href: '/account/', label: 'Account Center', classNameCss:'block font-normal text-[14px] leading-[24px] tracking-[0.25px] color-[#353535]'},
                  { href: '/account/wishlists', label: 'Favourites & Lists', classNameCss:'block font-normal text-[14px] leading-[24px] tracking-[0.25px] color-[#353535]'},
                  { href: '/account/orders', label: 'Orders', classNameCss:'block font-normal text-[14px] leading-[24px] tracking-[0.25px] color-[#353535]'},
                  { action: logout, name: 'Sign Out' },
                  ]
                : [
                  { href: '/login', label: 'Account', classNameCss:'block font-normal text-[16px] leading-[32px] tracking-[0.25px] text-[#006380] text-center'},
                  { href: '/login', label: 'Account Center', classNameCss:'block font-normal text-[14px] leading-[24px] tracking-[0.25px] color-[#353535]'},
                  { href: '/login', label: 'Favorites & Lists', classNameCss:'block font-normal text-[14px] leading-[24px] tracking-[0.25px] color-[#353535]'},
                  { href: '/login', label: 'Orders', classNameCss:'block font-normal text-[14px] leading-[24px] tracking-[0.25px] color-[#353535]'},
                  { href: '/login', label: 'LOG IN', classNameCss:'flex flex-row justify-center items-center p-[0px_8px] gap-[5px] border border-[#b4dde9] rounded-[3px] h-[32px] font-[500] text-[14px] leading-[32px] text-[#002a37] tracking-[1.25px]'},
                  { href: '/register', label: <span>New? <span className='font-[600] underline'>Create Account</span></span>, classNameCss:'block font-normal text-[14px] leading-[24px] tracking-[0.25px] text-[#008BB7]'},
                  ]
            }
            trigger={
              <Button
                aria-label={t('Account.account')}
                className="p-3 text-black hover:bg-transparent hover:text-primary"
                variant="subtle"
              >
                <BcImage
                  className="mr-2"
                  alt="an assortment of brandless products against a blank background"
                  height={16}
                  priority={true}
                  src={personIcon}
                  width={16}
                  unoptimized={true}
                />
                {t('Account.account')}
              </Button>
            }
          />
        </div>
      }
      activeLocale={locale}
      cart={
        <p role="status" className="header-cart-icon flex items-center">
          <Suspense
            fallback={
              <CartLink>
                <ShoppingCart className="header-cart-link hidden" aria-label="cart" />
              </CartLink>
            }
          >
            {cart}
          </Suspense>
        </p>
      }
      links={links}
      locales={localeLanguageRegionMap}
      logo={data.settings ? logoTransformer(data.settings) : undefined}
      search={!isBot ? <AutocompleteSearch 
        useDefaultPrices={useDefaultPrices} 
        priceMaxRules={priceMaxRules} 
        userContext={{
          isBot: isBot,
          isCaliforniaIp: isCaliforniaIp,
          ip: ip,
          ua: ua,
          isGuest: !customerAccessToken
      }} /> : null}
      megaMenu={
        <MegaMenuContextProvider value={{ 
            logo: homeLogoMobile, 
            storeName: data?.settings?.storeName, 
            accountMenuItems: customerAccessToken
              ? [
                  { href: '/account', label: 'My Account' },
                  { href: '/account/favorites', label: 'Favorites' },
                  { href: '/account/purchase-history', label: 'Purchase History' },
                  { href: '/account/finance', label: 'Finance' },
                  { action: logout, name: 'Sign Out' },
                ]
              : [
                  { href: '/login', label: 'My Account' },
                  { href: '/login', label: 'Favorites' },
                  { href: '/login', label: 'Purchase History' },
                  { href: '/login', label: 'Financing' },
                  { href: '/login', label: 'Login' },
                ],
            supportMenuItems: [
                { href: '/support/faqs', label: 'Existing Order' },
                { href: '/order-tracking', label: 'Track My Order' },
                { href: '/support/contact', label: 'Replace Items' },
                { href: '/support/contact', label: 'Gift Certificates' },
                { href: '/content/help-center', label: 'Visit Our Help Center' },
                { href: '/support/contact', label: 'New Orders' },
                { href: '/support/contact', label: 'Contact ' },
              ]
          }}>
          <MakeswiftComponent snapshot={megaMenuSnapshot} label={`Mega Menu`} type='belami-mega-menu' />
        </MegaMenuContextProvider>
      }
    />
  );
};

export const HeaderSkeleton = () => (
  <header className="flex min-h-[92px] !max-w-[100%] animate-pulse items-center justify-between gap-1 overflow-y-visible bg-white p-[0px_4em] !px-[40px] 2xl:container sm:px-10 lg:gap-8 lg:px-12 2xl:mx-auto 2xl:px-0">
    <div className="h-16 w-40 rounded bg-slate-200" />
    <div className="hidden space-x-4 lg:flex">
      <div className="h-6 w-20 rounded bg-slate-200" />
      <div className="h-6 w-20 rounded bg-slate-200" />
      <div className="h-6 w-20 rounded bg-slate-200" />
      <div className="h-6 w-20 rounded bg-slate-200" />
    </div>
    <div className="flex items-center gap-2 lg:gap-4">
      <div className="h-8 w-8 rounded-full bg-slate-200" />

      <div className="flex gap-2 lg:gap-4">
        <div className="h-8 w-8 rounded-full bg-slate-200" />
        <div className="h-8 w-8 rounded-full bg-slate-200" />
      </div>

      <div className="h-8 w-20 rounded bg-slate-200" />

      <div className="h-8 w-8 rounded bg-slate-200 lg:hidden" />
    </div>
  </header>
);
